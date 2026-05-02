#pragma once
#include "NativeModules.h"
#include "sqlite/sqlite3.h"
#include <winrt/Windows.Storage.h>
#include <string>

namespace winrt::NativeModuleSampleExample {
    REACT_MODULE(SQLiteModule)
        struct SQLiteModule {

        static std::wstring GetDatabasePath() noexcept {
            const auto localFolder = winrt::Windows::Storage::ApplicationData::Current().LocalFolder();
            return localFolder.Path().c_str() + std::wstring(L"\\AppDatabase.db");
        }

        static bool OpenDatabase(sqlite3** db) noexcept {
            const std::wstring databasePath = GetDatabasePath();
            return sqlite3_open16(databasePath.c_str(), db) == SQLITE_OK;
        }

        // Executes a SQL command (CREATE, INSERT, UPDATE, DELETE)
        REACT_METHOD(execute)
            void execute(std::string query, winrt::Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
            sqlite3* db = nullptr;

            // Open Database
            if (!OpenDatabase(&db)) {
                promise.Reject("Failed to open database");
                return;
            }

            char* errMsg = 0;
            if (sqlite3_exec(db, query.c_str(), nullptr, nullptr, &errMsg) == SQLITE_OK) {
                // Resolves the promise
                promise.Resolve("Success");
            }
            else {
                // Rejects the promise with the SQLite error message
                std::string error = errMsg ? errMsg : "Unknown error";
                promise.Reject(winrt::Microsoft::ReactNative::ReactError{ error.c_str() });
                sqlite3_free(errMsg);
            }

            sqlite3_close(db);
        }

        REACT_METHOD(query)
            void query(
                std::string sql,
                winrt::Microsoft::ReactNative::ReactPromise<winrt::Microsoft::ReactNative::JSValueArray> promise) noexcept {
            sqlite3* db = nullptr;
            sqlite3_stmt* stmt = nullptr;

            if (!OpenDatabase(&db)) {
                promise.Reject("Failed to open DB");
                return;
            }

            if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
                promise.Reject(sqlite3_errmsg(db));
                sqlite3_close(db);
                return;
            }

            winrt::Microsoft::ReactNative::JSValueArray rows;

            while (true) {
                const int result = sqlite3_step(stmt);
                if (result == SQLITE_DONE) {
                    break;
                }

                if (result != SQLITE_ROW) {
                    promise.Reject(sqlite3_errmsg(db));
                    sqlite3_finalize(stmt);
                    sqlite3_close(db);
                    return;
                }

                winrt::Microsoft::ReactNative::JSValueObject row;
                int cols = sqlite3_column_count(stmt);
                for (int i = 0; i < cols; i++) {
                    const char* columnName = sqlite3_column_name(stmt, i);
                    std::string key = columnName ? columnName : "";

                    switch (sqlite3_column_type(stmt, i)) {
                    case SQLITE_INTEGER:
                        row[key] = static_cast<int64_t>(sqlite3_column_int64(stmt, i));
                        break;
                    case SQLITE_FLOAT:
                        row[key] = sqlite3_column_double(stmt, i);
                        break;
                    case SQLITE_TEXT: {
                        const auto* text = reinterpret_cast<const char*>(sqlite3_column_text(stmt, i));
                        row[key] = text ? text : "";
                        break;
                    }
                    case SQLITE_NULL:
                        row[key] = nullptr;
                        break;
                    case SQLITE_BLOB: {
                        const auto* blob = reinterpret_cast<const char*>(sqlite3_column_text(stmt, i));
                        row[key] = blob ? blob : "";
                        break;
                    }
                    default:
                        row[key] = nullptr;
                        break;
                    }
                }

                rows.push_back(std::move(row));
            }

            sqlite3_finalize(stmt);
            sqlite3_close(db);
            promise.Resolve(std::move(rows));
        }
    };
}
