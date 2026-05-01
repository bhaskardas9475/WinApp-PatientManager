import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

interface TextBoxProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
}

export const TextBox: React.FC<TextBoxProps> = ({
  label,
  placeholder = "Enter text...",
  value,
  onChangeText,
  secureTextEntry = false,
}) => {
  const [text, setText] = useState(value || "");

  const handleChange = (newText: string) => {
    setText(newText);
    onChangeText?.(newText);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={text}
        onChangeText={handleChange}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
  },
});
