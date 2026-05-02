import { execute } from ".";

export default {
  up: async () => {
    await execute(
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, gender TEXT, comment TEXT)",
    );
  },
};
