import { Text, View } from "react-native";
import { Button } from "../../components";
import { execute } from "../../db";

const AddUser = () => {
  const create = async () => {
    try {
      // Example: Create a new user in the database
      await execute(
        `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)`,
      );
      await execute(
        `INSERT INTO users (name, email) VALUES ('John Doe', 'dd')`,
      );
      alert("User created successfully!");
    } catch (error) {
      alert("Error creating user: " + error);
    }
  };
  return (
    <View>
      <Text>Add User</Text>
      <Button title="Create" onPress={create} />
    </View>
  );
};
export default AddUser;
