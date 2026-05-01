#pragma once
#include "NativeModules.h"
#include "sqlite/sqlite3.h"
#include <string>
#include <vector>

namespace winrt::NativeModuleSampleExample {
    REACT_MODULE(SQLiteModule)
        struct SQLiteModule {

        // Executes a SQL command (CREATE, INSERT, UPDATE, DELETE)
        REACT_METHOD(execute)
            void execute(std::string query, winrt::Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
            sqlite3* db;

            // Open Database
            if (sqlite3_open("AppDatabase.db", &db) != SQLITE_OK) {
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
            void query(std::string sql, winrt::Microsoft::ReactNative::ReactPromise<std::string> promise) noexcept {
            sqlite3* db;
            sqlite3_stmt* stmt;

            if (sqlite3_open("AppDatabase.db", &db) != SQLITE_OK) {
                promise.Reject("Failed to open DB");
                return;
            }

            if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
                promise.Reject(sqlite3_errmsg(db));
                sqlite3_close(db);
                return;
            }

            // Simple JSON construction (For testing. Real apps use a JSON library like nlohmann/json)
            std::string json = "[";
            bool firstRow = true;

            while (sqlite3_step(stmt) == SQLITE_ROW) {
                if (!firstRow) json += ",";
                json += "{";
                int cols = sqlite3_column_count(stmt);
                for (int i = 0; i < cols; i++) {
                    if (i > 0) json += ",";
                    std::string colName = (char*)sqlite3_column_name(stmt, i);
                    std::string colVal = (char*)sqlite3_column_text(stmt, i);
                    json += "\"" + colName + "\":\"" + colVal + "\"";
                }
                json += "}";
                firstRow = false;
            }
            json += "]";

            sqlite3_finalize(stmt);
            sqlite3_close(db);
            promise.Resolve(json);
        }
    };
}
