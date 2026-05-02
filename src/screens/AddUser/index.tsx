import { StyleSheet, View } from "react-native";
import {
  Button,
  Col,
  RadioGroup,
  Row,
  Section,
  Table,
  TextBox,
} from "@/components";
import { useAddUserController } from "./user.controller";

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const AddUser = () => {
  const {
    users,
    form,
    loading,
    saving,
    editingUserId,
    formVersion,
    updateField,
    saveUser,
    deleteUser,
    startEdit,
    resetForm,
  } = useAddUserController();

  return (
    <View style={styles.container}>
      <Section title={editingUserId === null ? "Add User" : "Edit User"}>
        <Row spacing={16}>
          <Col style={styles.formCol}>
            <TextBox
              key={`name-${formVersion}`}
              label="Name"
              placeholder="Enter name"
              value={form.name}
              onChangeText={(value) => updateField("name", value)}
            />
          </Col>

          <Col style={styles.formCol}>
            <TextBox
              key={`phone-${formVersion}`}
              label="Phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChangeText={(value) => updateField("phone", value)}
            />
          </Col>

          <Col style={styles.formCol}>
            <RadioGroup
              key={`gender-${formVersion}`}
              label="Gender"
              options={genderOptions}
              selectedValue={form.gender}
              onSelect={(value) => updateField("gender", value)}
            />
          </Col>

          <Col style={styles.formCol}>
            <TextBox
              key={`comment-${formVersion}`}
              label="Comment"
              placeholder="Enter comment"
              value={form.comment}
              onChangeText={(value) => updateField("comment", value)}
            />
          </Col>
        </Row>

        <View style={styles.buttonRow}>
          {editingUserId !== null && (
            <Button title="Cancel" variant="secondary" onPress={resetForm} />
          )}
          <Button
            title={
              saving
                ? "Saving..."
                : editingUserId === null
                  ? "Create"
                  : "Update"
            }
            onPress={saveUser}
            disabled={saving}
          />
        </View>
      </Section>

      <Section title="User List" style={styles.listSection}>
        <Table
          data={users}
          cols={["Name", "Phone", "Gender", "Comment"]}
          itemActions={[
            {
              title: "Edit",
              variant: "secondary",
              onClick: (item) => startEdit(item),
            },
            {
              title: "Delete",
              variant: "danger",
              onClick: (item) => deleteUser(item.id),
            },
          ]}
        />
      </Section>
    </View>
  );
};

export default AddUser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formCol: {
    minWidth: 180,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  listSection: {
    flex: 1,
    marginBottom: 0,
  },
});
