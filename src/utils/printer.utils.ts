import { NativeModules } from "react-native";

const { PrintService: NativePrintService } = NativeModules;

type NativePrintServiceModule = {
  printText: (content: string) => Promise<string>;
  printTextToPrinter: (content: string, printerName: string) => Promise<string>;
  getPrinters: () => Promise<string[]>;
  getDefaultPrinter: () => Promise<string>;
};

export type PrescriptionValue = string | number | null | undefined;

export interface PrescriptionField {
  label: string;
  value: PrescriptionValue;
}

export interface PrescriptionMedicineRow {
  medicine: PrescriptionValue;
  dosage?: PrescriptionValue;
  timing?: PrescriptionValue;
  duration?: PrescriptionValue;
}

export interface PrescriptionTestRow {
  test: PrescriptionValue;
  instructions?: PrescriptionValue;
  remarks?: PrescriptionValue;
}

export interface PrescriptionPrintData {
  title?: string;
  headerLines?: string[];
  footerLines?: string[];
  prescriptionTitle?: string;
  prescriptionDate?: PrescriptionValue;
  patientDetails: PrescriptionField[];
  medicines?: PrescriptionMedicineRow[];
  tests?: PrescriptionTestRow[];
  notes?: string[];
  advice?: string[];
}

const PrintService = NativePrintService as NativePrintServiceModule;
const TABLE_CELL_SEPARATOR = "\u001f";

const normalizeValue = (value: PrescriptionValue) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const buildTaggedLine = (tag: string, value?: string) => {
  if (!value?.trim()) {
    return "";
  }

  return `[${tag}]${value.trim()}`;
};

const buildTableBlock = (
  headers: Array<{ label: string; width: number }>,
  rows: PrescriptionValue[][],
) => {
  const widths = headers.map((item) => item.width).join(",");
  const header = `[TABLE_HEADER]${headers
    .map((item) => normalizeValue(item.label))
    .join(TABLE_CELL_SEPARATOR)}`;
  const body = rows.map(
    (row) =>
      `[TABLE_ROW]${row
        .map((cell) => normalizeValue(cell).replaceAll(TABLE_CELL_SEPARATOR, " "))
        .join(TABLE_CELL_SEPARATOR)}`,
  );

  return [`[TABLE_BEGIN]${widths}`, header, ...body, "[TABLE_END]"];
};

export const buildPrescriptionPrintContent = (
  data: PrescriptionPrintData,
) => {
  const lines: string[] = [];

  lines.push(buildTaggedLine("TITLE", data.title || "Prescription"));

  (data.headerLines || []).forEach((line) => {
    lines.push(buildTaggedLine("SUBTITLE", line));
  });

  if (data.prescriptionTitle || data.prescriptionDate) {
    lines.push("[SPACER]");
    lines.push(
      buildTaggedLine(
        "SECTION",
        data.prescriptionTitle || "Prescription",
      ),
    );

    if (normalizeValue(data.prescriptionDate)) {
      lines.push(
        buildTaggedLine(
          "BODY",
          `Date: ${normalizeValue(data.prescriptionDate)}`,
        ),
      );
    }
  }

  lines.push("[SPACER]");
  lines.push(buildTaggedLine("SECTION", "Patient Details"));
  data.patientDetails.forEach((field) => {
    if (!normalizeValue(field.value)) {
      return;
    }

    lines.push(
      buildTaggedLine(
        "BODY",
        `${field.label}: ${normalizeValue(field.value)}`,
      ),
    );
  });

  if (data.medicines?.length) {
    lines.push("[SPACER]");
    lines.push(buildTaggedLine("SECTION", "Medicines"));
    lines.push(
      ...buildTableBlock(
        [
          { label: "Medicine", width: 24 },
          { label: "Dosage", width: 12 },
          { label: "Timing", width: 14 },
          { label: "Duration", width: 12 },
        ],
        data.medicines.map((medicine) => [
          medicine.medicine,
          medicine.dosage,
          medicine.timing,
          medicine.duration,
        ]),
      ),
    );
  }

  if (data.tests?.length) {
    lines.push("[SPACER]");
    lines.push(buildTaggedLine("SECTION", "Tests"));
    lines.push(
      ...buildTableBlock(
        [
          { label: "Test", width: 24 },
          { label: "Instructions", width: 24 },
          { label: "Remarks", width: 18 },
        ],
        data.tests.map((test) => [test.test, test.instructions, test.remarks]),
      ),
    );
  }

  if (data.notes?.length) {
    lines.push("[SPACER]");
    lines.push(buildTaggedLine("SECTION", "Notes"));
    data.notes.forEach((note) => {
      if (!note.trim()) {
        return;
      }

      lines.push(buildTaggedLine("BULLET", note));
    });
  }

  if (data.advice?.length) {
    lines.push("[SPACER]");
    lines.push(buildTaggedLine("SECTION", "Advice"));
    data.advice.forEach((item) => {
      if (!item.trim()) {
        return;
      }

      lines.push(buildTaggedLine("BULLET", item));
    });
  }

  if (data.footerLines?.length) {
    lines.push("[SPACER]");
    data.footerLines.forEach((line) => {
      lines.push(buildTaggedLine("FOOTER", line));
    });
  }

  return lines.filter(Boolean).join("\n");
};

export const getPrinters = async () => {
  return await PrintService.getPrinters();
};

export const getDefaultPrinter = async () => {
  return await PrintService.getDefaultPrinter();
};

export const printText = async (content: string) => {
  return await PrintService.printText(content);
};

export const printTextToPrinter = async (
  content: string,
  printerName: string,
) => {
  return await PrintService.printTextToPrinter(content, printerName);
};

export const printPrescription = async (data: PrescriptionPrintData) => {
  return await printText(buildPrescriptionPrintContent(data));
};

export const printPrescriptionToPrinter = async (
  data: PrescriptionPrintData,
  printerName: string,
) => {
  return await printTextToPrinter(
    buildPrescriptionPrintContent(data),
    printerName,
  );
};

export { PrintService };
