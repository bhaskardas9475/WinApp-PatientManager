import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  active: string;
  onChange: (key: any) => void;
};

const MenuItem = ({ label, value, active, onPress }: any) => {
  const isActive = active === value;

  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      style={[styles.item, isActive && styles.activeItem]}
    >
      <Text style={[styles.text, isActive && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function Sidebar({ active, onChange }: Props) {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.title}>Patient Manager</Text>

      <MenuItem
        label="Dashboard"
        value="dashboard"
        active={active}
        onPress={onChange}
      />
      <MenuItem
        label="Create Prescription"
        value="prescription"
        active={active}
        onPress={onChange}
      />
      <MenuItem
        label="Add User"
        value="user"
        active={active}
        onPress={onChange}
      />
      <MenuItem
        label="Add Tests"
        value="tests"
        active={active}
        onPress={onChange}
      />
      <MenuItem
        label="Add Medicine"
        value="medicine"
        active={active}
        onPress={onChange}
      />
      <MenuItem
        label="UI Components"
        value="components"
        active={active}
        onPress={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e5e5e5",
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  activeItem: {
    backgroundColor: "#e6f0ff",
  },
  text: {
    fontSize: 14,
  },
  activeText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
