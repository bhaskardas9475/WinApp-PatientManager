import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import Dashboard from "@/screens/Dashboard";
import CreatePrescription from "@/screens/CreatePrescription";
import AddUser from "@/screens/AddUser";
import AddTests from "@/screens/AddTests";
import AddMedicine from "@/screens/AddMedicine";
import Sidebar from "@/components/Sidebar";
import Preview from "@/components/preview";

type ScreenKey =
  | "dashboard"
  | "prescription"
  | "user"
  | "tests"
  | "medicine"
  | "components";

export default function MainLayout() {
  const [active, setActive] = useState<ScreenKey>("dashboard");

  const renderScreen = () => {
    switch (active) {
      case "prescription":
        return <CreatePrescription />;
      case "user":
        return <AddUser />;
      case "tests":
        return <AddTests />;
      case "medicine":
        return <AddMedicine />;
      case "components":
        return <Preview />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <View style={styles.container}>
      <Sidebar active={active} onChange={setActive} />
      <View style={styles.content}>{renderScreen()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#e1e1e1",
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
