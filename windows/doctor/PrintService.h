#pragma once
#include "pch.h"
#include "NativeModules.h"

namespace winrt::PatientManagement::implementation {

	REACT_MODULE(PrintService);

	struct PrintService {
		PrintService() = default;

		REACT_METHOD(printText);
		void printText(
			std::string content,
			winrt::Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept;

		REACT_METHOD(printTextToPrinter);
		void printTextToPrinter(
			std::string content,
			std::string printerName,
			winrt::Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept;

		REACT_METHOD(getPrinters);
		void getPrinters(
			winrt::Microsoft::ReactNative::ReactPromise<winrt::Microsoft::ReactNative::JSValueArray> promise) noexcept;

		REACT_METHOD(getDefaultPrinter);
		void getDefaultPrinter(
			winrt::Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept;
	};

}
