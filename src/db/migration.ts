import { migrateUserTable } from "@/screens/AddUser/user.controller";

export default {
  up: async () => {
    await migrateUserTable();
  },
};
