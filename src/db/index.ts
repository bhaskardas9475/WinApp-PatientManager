/**
 * db/index.ts
 *
 * A typed wrapper for the custom C++ SQLiteModule.
 * Provides async/await access to the local SQLite database.
 */
import { NativeModules } from "react-native";

const { SQLiteModule } = NativeModules;

/**
 * Interface for database row results.
 * The native bridge returns rows as plain JS objects.
 */
export interface QueryResult {
  [key: string]: string | number | null;
}

/**
 * execute
 * Used for DDL (Data Definition Language) and DML (Data Manipulation Language).
 * Use this for commands that DO NOT return rows.
 *
 * SUPPORTED COMMANDS:
 * - CREATE TABLE / DROP TABLE / ALTER TABLE
 * - INSERT INTO
 * - UPDATE
 * - DELETE
 * - BEGIN TRANSACTION / COMMIT / ROLLBACK
 *
 * @param sql The SQL statement to execute.
 * @returns Promise<string> Resolves with "Success" or rejects with an error.
 */
export const execute = async (sql: string): Promise<string> => {
  try {
    return await SQLiteModule.execute(sql);
  } catch (error) {
    console.error("SQL Execute Error:", error);
    throw error;
  }
};

/**
 * query
 * Used for Data Retrieval.
 * Use this for commands that RETURN rows.
 *
 * SUPPORTED COMMANDS:
 * - SELECT
 * - PRAGMA (e.g., table_info)
 *
 * @param sql The SQL query to run.
 * @returns Promise<QueryResult[]> An array of objects representing the rows.
 */
export const query = async (sql: string): Promise<QueryResult[]> => {
  try {
    return await SQLiteModule.query(sql);
  } catch (error) {
    console.error("SQL Query Error:", error);
    throw error;
  }
};

/**
 * USAGE EXAMPLES:
 *
 * 1. Initialize Table:
 *    await execute("CREATE TABLE IF NOT EXISTS Settings (key TEXT PRIMARY KEY, value TEXT);");
 *
 * 2. Insert Data:
 *    await execute("INSERT OR REPLACE INTO Settings (key, value) VALUES ('theme', 'dark');");
 *
 * 3. Fetch Data:
 *    const results = await query("SELECT * FROM Settings;");
 *    console.log(results[0].value); // 'dark'
 */

export default {
  execute,
  query,
};
