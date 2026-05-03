#include "pch.h"
#include "PrintService.h"

#include <algorithm>
#include <numeric>
#include <string>
#include <string_view>
#include <vector>
#include <winspool.h>

namespace {

constexpr wchar_t TABLE_CELL_SEPARATOR = 0x001F;

enum class PrintLineKind {
  Title,
  Subtitle,
  Section,
  Body,
  Bullet,
  Footer,
  Spacer,
};

struct PrintLine {
  PrintLineKind kind;
  std::wstring text;
};

struct TableRow {
  bool isHeader = false;
  std::vector<std::wstring> cells;
};

struct TableBlock {
  std::vector<int> weights;
  std::vector<TableRow> rows;
};

struct PrintFonts {
  HFONT title = nullptr;
  HFONT subtitle = nullptr;
  HFONT section = nullptr;
  HFONT body = nullptr;
  HFONT footer = nullptr;
  HFONT tableHeader = nullptr;
  HFONT tableBody = nullptr;
};

std::wstring Utf8ToWide(std::string const &value) noexcept {
  if (value.empty()) {
    return {};
  }

  const int size = MultiByteToWideChar(CP_UTF8, 0, value.c_str(), -1, nullptr, 0);
  if (size <= 0) {
    return {};
  }

  std::wstring result(static_cast<size_t>(size - 1), L'\0');
  MultiByteToWideChar(CP_UTF8, 0, value.c_str(), -1, result.data(), size);
  return result;
}

std::string WideToUtf8(std::wstring const &value) noexcept {
  if (value.empty()) {
    return {};
  }

  const int size = WideCharToMultiByte(CP_UTF8, 0, value.c_str(), -1, nullptr, 0, nullptr, nullptr);
  if (size <= 0) {
    return {};
  }

  std::string result(static_cast<size_t>(size - 1), '\0');
  WideCharToMultiByte(CP_UTF8, 0, value.c_str(), -1, result.data(), size, nullptr, nullptr);
  return result;
}

std::wstring GetDefaultPrinterName() noexcept {
  DWORD size = 0;
  GetDefaultPrinterW(nullptr, &size);
  if (size == 0) {
    return {};
  }

  std::wstring printerName(size - 1, L'\0');
  if (!GetDefaultPrinterW(printerName.data(), &size)) {
    return {};
  }

  return printerName;
}

winrt::Microsoft::ReactNative::JSValueArray GetInstalledPrinters() noexcept {
  DWORD needed = 0;
  DWORD returned = 0;
  const DWORD flags = PRINTER_ENUM_LOCAL | PRINTER_ENUM_CONNECTIONS;

  EnumPrintersW(flags, nullptr, 4, nullptr, 0, &needed, &returned);
  if (needed == 0) {
    return {};
  }

  std::vector<BYTE> buffer(needed);
  if (!EnumPrintersW(flags, nullptr, 4, buffer.data(), needed, &needed, &returned)) {
    return {};
  }

  auto *printerInfo = reinterpret_cast<PRINTER_INFO_4W *>(buffer.data());
  winrt::Microsoft::ReactNative::JSValueArray printers;

  for (DWORD index = 0; index < returned; ++index) {
    printers.push_back(WideToUtf8(printerInfo[index].pPrinterName ? printerInfo[index].pPrinterName : L""));
  }

  return printers;
}

bool StartsWith(std::wstring const &value, std::wstring_view prefix) noexcept {
  return value.size() >= prefix.size() && value.compare(0, prefix.size(), prefix) == 0;
}

std::wstring TrimLeft(std::wstring value) noexcept {
  const auto start = value.find_first_not_of(L" \t");
  if (start == std::wstring::npos) {
    return L"";
  }

  return value.substr(start);
}

std::vector<std::wstring> SplitLines(std::wstring const &content) noexcept {
  std::vector<std::wstring> lines;
  size_t start = 0;

  while (start <= content.size()) {
    const size_t end = content.find(L'\n', start);
    std::wstring line =
        end == std::wstring::npos ? content.substr(start) : content.substr(start, end - start);

    if (!line.empty() && line.back() == L'\r') {
      line.pop_back();
    }

    lines.push_back(line);

    if (end == std::wstring::npos) {
      break;
    }

    start = end + 1;
  }

  return lines;
}

std::vector<std::wstring> Split(std::wstring const &value, wchar_t delimiter) noexcept {
  std::vector<std::wstring> result;
  std::wstring current;

  for (wchar_t ch : value) {
    if (ch == delimiter) {
      result.push_back(current);
      current.clear();
    } else {
      current.push_back(ch);
    }
  }

  result.push_back(current);
  return result;
}

std::vector<int> ParseWeights(std::wstring const &value) noexcept {
  std::vector<int> weights;
  for (auto const &part : Split(value, L',')) {
    const std::wstring trimmed = TrimLeft(part);
    if (trimmed.empty()) {
      continue;
    }

    try {
      weights.push_back(std::max(1, std::stoi(trimmed)));
    } catch (...) {
      return {};
    }
  }

  return weights;
}

PrintLine ParseTextLine(std::wstring const &line) noexcept {
  if (line.empty() || line == L"[SPACER]") {
    return {PrintLineKind::Spacer, L""};
  }

  struct TagMapping {
    std::wstring_view tag;
    PrintLineKind kind;
  };

  static constexpr TagMapping mappings[] = {
      {L"[TITLE]", PrintLineKind::Title},
      {L"[SUBTITLE]", PrintLineKind::Subtitle},
      {L"[SECTION]", PrintLineKind::Section},
      {L"[BODY]", PrintLineKind::Body},
      {L"[BULLET]", PrintLineKind::Bullet},
      {L"[FOOTER]", PrintLineKind::Footer},
  };

  for (auto const &mapping : mappings) {
    if (StartsWith(line, mapping.tag)) {
      return {mapping.kind, TrimLeft(line.substr(mapping.tag.size()))};
    }
  }

  return {PrintLineKind::Body, line};
}

HFONT CreatePointFont(HDC printerDc, int pointSize, int weight, wchar_t const *faceName) noexcept {
  return CreateFontW(
      -MulDiv(pointSize, GetDeviceCaps(printerDc, LOGPIXELSY), 72),
      0,
      0,
      0,
      weight,
      FALSE,
      FALSE,
      FALSE,
      DEFAULT_CHARSET,
      OUT_DEFAULT_PRECIS,
      CLIP_DEFAULT_PRECIS,
      CLEARTYPE_QUALITY,
      DEFAULT_PITCH | FF_DONTCARE,
      faceName);
}

PrintFonts CreateFonts(HDC printerDc) noexcept {
  PrintFonts fonts;
  fonts.title = CreatePointFont(printerDc, 16, FW_BOLD, L"Segoe UI");
  fonts.subtitle = CreatePointFont(printerDc, 10, FW_NORMAL, L"Segoe UI");
  fonts.section = CreatePointFont(printerDc, 11, FW_BOLD, L"Segoe UI");
  fonts.body = CreatePointFont(printerDc, 10, FW_NORMAL, L"Segoe UI");
  fonts.footer = CreatePointFont(printerDc, 9, FW_NORMAL, L"Segoe UI");
  fonts.tableHeader = CreatePointFont(printerDc, 10, FW_BOLD, L"Segoe UI");
  fonts.tableBody = CreatePointFont(printerDc, 10, FW_NORMAL, L"Segoe UI");
  return fonts;
}

void DestroyFonts(PrintFonts const &fonts) noexcept {
  if (fonts.title != nullptr) {
    DeleteObject(fonts.title);
  }
  if (fonts.subtitle != nullptr) {
    DeleteObject(fonts.subtitle);
  }
  if (fonts.section != nullptr) {
    DeleteObject(fonts.section);
  }
  if (fonts.body != nullptr) {
    DeleteObject(fonts.body);
  }
  if (fonts.footer != nullptr) {
    DeleteObject(fonts.footer);
  }
  if (fonts.tableHeader != nullptr) {
    DeleteObject(fonts.tableHeader);
  }
  if (fonts.tableBody != nullptr) {
    DeleteObject(fonts.tableBody);
  }
}

HFONT SelectFontForLine(PrintLine const &line, PrintFonts const &fonts) noexcept {
  switch (line.kind) {
  case PrintLineKind::Title:
    return fonts.title;
  case PrintLineKind::Subtitle:
    return fonts.subtitle;
  case PrintLineKind::Section:
    return fonts.section;
  case PrintLineKind::Footer:
    return fonts.footer;
  case PrintLineKind::Bullet:
  case PrintLineKind::Body:
  case PrintLineKind::Spacer:
  default:
    return fonts.body;
  }
}

UINT GetDrawFlags(PrintLine const &line) noexcept {
  switch (line.kind) {
  case PrintLineKind::Title:
    return DT_CENTER | DT_TOP | DT_WORDBREAK | DT_NOPREFIX;
  case PrintLineKind::Subtitle:
  case PrintLineKind::Footer:
    return DT_CENTER | DT_TOP | DT_WORDBREAK | DT_NOPREFIX;
  case PrintLineKind::Section:
  case PrintLineKind::Bullet:
  case PrintLineKind::Body:
  default:
    return DT_LEFT | DT_TOP | DT_WORDBREAK | DT_EXPANDTABS | DT_NOPREFIX;
  }
}

int GetSpacingAfterLine(PrintLine const &line) noexcept {
  switch (line.kind) {
  case PrintLineKind::Title:
    return 10;
  case PrintLineKind::Subtitle:
    return 4;
  case PrintLineKind::Section:
    return 6;
  case PrintLineKind::Footer:
    return 3;
  case PrintLineKind::Bullet:
  case PrintLineKind::Body:
  default:
    return 4;
  }
}

std::wstring GetRenderableText(PrintLine const &line) noexcept {
  if (line.kind == PrintLineKind::Bullet) {
    return L"* " + line.text;
  }

  return line.text;
}

bool StartNewPage(HDC printerDc, int &currentY, RECT const &pageRect, std::string &errorMessage) noexcept {
  if (EndPage(printerDc) <= 0) {
    errorMessage = "Unable to finish print page.";
    return false;
  }

  if (StartPage(printerDc) <= 0) {
    errorMessage = "Unable to start print page.";
    return false;
  }

  currentY = pageRect.top;
  return true;
}

std::vector<int> BuildColumnWidths(RECT const &pageRect, std::vector<int> const &weights) noexcept {
  std::vector<int> widths;
  if (weights.empty()) {
    return widths;
  }

  const int totalWidth = pageRect.right - pageRect.left;
  const int totalWeight = std::max(1, std::accumulate(weights.begin(), weights.end(), 0));
  int assigned = 0;

  for (size_t index = 0; index < weights.size(); ++index) {
    if (index == weights.size() - 1) {
      widths.push_back(totalWidth - assigned);
    } else {
      const int width = (totalWidth * weights[index]) / totalWeight;
      widths.push_back(width);
      assigned += width;
    }
  }

  return widths;
}

int MeasureTableRowHeight(
    HDC printerDc,
    TableRow const &row,
    std::vector<int> const &columnWidths,
    HFONT font) noexcept {
  constexpr int cellPadding = 8;
  const HGDIOBJ previousFont = SelectObject(printerDc, font);
  int maxHeight = 0;

  for (size_t index = 0; index < columnWidths.size(); ++index) {
    RECT measureRect{0, 0, std::max(10, columnWidths[index] - cellPadding * 2), 0};
    const std::wstring text = index < row.cells.size() ? row.cells[index] : L"";
    DrawTextW(
        printerDc,
        text.c_str(),
        -1,
        &measureRect,
        DT_LEFT | DT_TOP | DT_WORDBREAK | DT_NOPREFIX | DT_CALCRECT);
    maxHeight = std::max<int>(
        maxHeight,
        static_cast<int>(measureRect.bottom - measureRect.top));
  }

  SelectObject(printerDc, previousFont);
  return std::max<int>(28, maxHeight + cellPadding * 2);
}

void DrawTableRow(
    HDC printerDc,
    TableRow const &row,
    std::vector<int> const &columnWidths,
    RECT const &pageRect,
    int top,
    int rowHeight,
    HFONT font) noexcept {
  constexpr int cellPadding = 8;
  const HGDIOBJ previousFont = SelectObject(printerDc, font);

  int left = pageRect.left;
  for (size_t index = 0; index < columnWidths.size(); ++index) {
    const int right = left + columnWidths[index];
    Rectangle(printerDc, left, top, right, top + rowHeight);

    RECT textRect{
        left + cellPadding,
        top + cellPadding,
        right - cellPadding,
        top + rowHeight - cellPadding,
    };

    const std::wstring text = index < row.cells.size() ? row.cells[index] : L"";
    DrawTextW(printerDc, text.c_str(), -1, &textRect, DT_LEFT | DT_TOP | DT_WORDBREAK | DT_NOPREFIX);
    left = right;
  }

  SelectObject(printerDc, previousFont);
}

bool RenderTextLine(
    HDC printerDc,
    PrintLine const &line,
    PrintFonts const &fonts,
    RECT const &pageRect,
    int &currentY,
    std::string &errorMessage) noexcept {
  if (line.kind == PrintLineKind::Spacer) {
    currentY += 10;
    return true;
  }

  const HFONT font = SelectFontForLine(line, fonts);
  HGDIOBJ previousFont = nullptr;
  if (font != nullptr) {
    previousFont = SelectObject(printerDc, font);
  }

  RECT drawRect{
      pageRect.left,
      currentY,
      pageRect.right,
      pageRect.bottom,
  };

  const std::wstring renderText = GetRenderableText(line);
  const UINT flags = GetDrawFlags(line);
  RECT measureRect = drawRect;
  DrawTextW(printerDc, renderText.c_str(), -1, &measureRect, flags | DT_CALCRECT);

  if (measureRect.bottom > pageRect.bottom) {
    if (!StartNewPage(printerDc, currentY, pageRect, errorMessage)) {
      if (previousFont != nullptr) {
        SelectObject(printerDc, previousFont);
      }
      return false;
    }

    drawRect.top = currentY;
    measureRect = drawRect;
    DrawTextW(printerDc, renderText.c_str(), -1, &measureRect, flags | DT_CALCRECT);
  }

  DrawTextW(printerDc, renderText.c_str(), -1, &drawRect, flags);
  currentY = measureRect.bottom + GetSpacingAfterLine(line);

  if (previousFont != nullptr) {
    SelectObject(printerDc, previousFont);
  }

  return true;
}

bool RenderTableBlock(
    HDC printerDc,
    TableBlock const &table,
    PrintFonts const &fonts,
    RECT const &pageRect,
    int &currentY,
    std::string &errorMessage) noexcept {
  if (table.weights.empty() || table.rows.empty()) {
    return true;
  }

  const std::vector<int> columnWidths = BuildColumnWidths(pageRect, table.weights);
  if (columnWidths.empty()) {
    return true;
  }

  const TableRow *headerRow = nullptr;
  size_t startIndex = 0;
  if (!table.rows.empty() && table.rows.front().isHeader) {
    headerRow = &table.rows.front();
    startIndex = 1;
  }

  auto renderHeaderIfNeeded = [&]() noexcept -> bool {
    if (headerRow == nullptr) {
      return true;
    }

    const int headerHeight =
        MeasureTableRowHeight(printerDc, *headerRow, columnWidths, fonts.tableHeader);
    if (currentY + headerHeight > pageRect.bottom) {
      if (!StartNewPage(printerDc, currentY, pageRect, errorMessage)) {
        return false;
      }
    }

    DrawTableRow(printerDc, *headerRow, columnWidths, pageRect, currentY, headerHeight, fonts.tableHeader);
    currentY += headerHeight;
    return true;
  };

  if (!renderHeaderIfNeeded()) {
    return false;
  }

  for (size_t rowIndex = startIndex; rowIndex < table.rows.size(); ++rowIndex) {
    const TableRow &row = table.rows[rowIndex];
    const int rowHeight =
        MeasureTableRowHeight(printerDc, row, columnWidths, fonts.tableBody);

    if (currentY + rowHeight > pageRect.bottom) {
      if (!StartNewPage(printerDc, currentY, pageRect, errorMessage)) {
        return false;
      }

      if (!renderHeaderIfNeeded()) {
        return false;
      }
    }

    DrawTableRow(printerDc, row, columnWidths, pageRect, currentY, rowHeight, fonts.tableBody);
    currentY += rowHeight;
  }

  currentY += 8;
  return true;
}

std::string PrintTextInternal(std::string const &content, std::wstring const &printerName) noexcept {
  if (content.empty()) {
    return "Nothing to print.";
  }

  if (printerName.empty()) {
    return "No printer selected.";
  }

  const std::wstring printableContent = Utf8ToWide(content);
  if (printableContent.empty()) {
    return "Unable to convert text for printing.";
  }

  const std::vector<std::wstring> rawLines = SplitLines(printableContent);

  HDC printerDc = CreateDCW(L"WINSPOOL", printerName.c_str(), nullptr, nullptr);
  if (printerDc == nullptr) {
    return "Unable to create printer device context.";
  }

  DOCINFOW documentInfo{};
  documentInfo.cbSize = sizeof(documentInfo);
  documentInfo.lpszDocName = L"Doctor Print Job";

  if (StartDocW(printerDc, &documentInfo) <= 0) {
    DeleteDC(printerDc);
    return "Unable to start print job.";
  }

  if (StartPage(printerDc) <= 0) {
    AbortDoc(printerDc);
    DeleteDC(printerDc);
    return "Unable to start print page.";
  }

  const int marginX = GetDeviceCaps(printerDc, LOGPIXELSX);
  const int marginY = GetDeviceCaps(printerDc, LOGPIXELSY);
  const int pageWidth = GetDeviceCaps(printerDc, HORZRES);
  const int pageHeight = GetDeviceCaps(printerDc, VERTRES);
  const RECT pageRect{
      marginX,
      marginY,
      pageWidth - marginX,
      pageHeight - marginY,
  };

  PrintFonts fonts = CreateFonts(printerDc);
  SetBkMode(printerDc, TRANSPARENT);

  int currentY = pageRect.top;
  std::string errorMessage;

  for (size_t index = 0; index < rawLines.size(); ++index) {
    const std::wstring &rawLine = rawLines[index];

    if (StartsWith(rawLine, L"[TABLE_BEGIN]")) {
      TableBlock table;
      table.weights = ParseWeights(TrimLeft(rawLine.substr(std::wstring(L"[TABLE_BEGIN]").size())));

      while (++index < rawLines.size()) {
        const std::wstring &tableLine = rawLines[index];
        if (tableLine == L"[TABLE_END]") {
          break;
        }

        if (StartsWith(tableLine, L"[TABLE_HEADER]")) {
          table.rows.push_back(
              TableRow{true, Split(tableLine.substr(std::wstring(L"[TABLE_HEADER]").size()), TABLE_CELL_SEPARATOR)});
          continue;
        }

        if (StartsWith(tableLine, L"[TABLE_ROW]")) {
          table.rows.push_back(
              TableRow{false, Split(tableLine.substr(std::wstring(L"[TABLE_ROW]").size()), TABLE_CELL_SEPARATOR)});
        }
      }

      if (!RenderTableBlock(printerDc, table, fonts, pageRect, currentY, errorMessage)) {
        DestroyFonts(fonts);
        AbortDoc(printerDc);
        DeleteDC(printerDc);
        return errorMessage;
      }

      continue;
    }

    if (!RenderTextLine(
            printerDc,
            ParseTextLine(rawLine),
            fonts,
            pageRect,
            currentY,
            errorMessage)) {
      DestroyFonts(fonts);
      AbortDoc(printerDc);
      DeleteDC(printerDc);
      return errorMessage;
    }
  }

  DestroyFonts(fonts);

  if (EndPage(printerDc) <= 0) {
    AbortDoc(printerDc);
    DeleteDC(printerDc);
    return "Unable to finish print page.";
  }

  if (EndDoc(printerDc) <= 0) {
    DeleteDC(printerDc);
    return "Unable to finish print job.";
  }

  DeleteDC(printerDc);
  return {};
}

} // namespace

namespace winrt::PatientManagement::implementation {

void PrintService::printText(
    std::string content,
    winrt::Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
  const std::wstring printerName = GetDefaultPrinterName();
  const std::string error = PrintTextInternal(content, printerName);

  if (!error.empty()) {
    promise.Reject(error.c_str());
    return;
  }

  promise.Resolve("Printed successfully.");
}

void PrintService::printTextToPrinter(
    std::string content,
    std::string printerName,
    winrt::Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
  const std::string error = PrintTextInternal(content, Utf8ToWide(printerName));

  if (!error.empty()) {
    promise.Reject(error.c_str());
    return;
  }

  promise.Resolve("Printed successfully.");
}

void PrintService::getPrinters(
    winrt::Microsoft::ReactNative::ReactPromise<winrt::Microsoft::ReactNative::JSValueArray> promise) noexcept {
  promise.Resolve(GetInstalledPrinters());
}

void PrintService::getDefaultPrinter(
    winrt::Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
  const std::wstring printerName = GetDefaultPrinterName();

  if (printerName.empty()) {
    promise.Resolve("");
    return;
  }

  promise.Resolve(WideToUtf8(printerName));
}

} // namespace winrt::PatientManagement::implementation
