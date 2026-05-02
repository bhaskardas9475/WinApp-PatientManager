import { USER_MIGRATION } from "@/screens/AddUser/user.controller";
import { execute } from ".";

export default {
  up: async () => {
    await execute(USER_MIGRATION);
  },
};
