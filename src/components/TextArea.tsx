import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder = "Enter text...",
  value,
  onChangeText,
  rows = 4,
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
        style={[
          styles.textarea,
          {
            minHeight: 50 + rows * 25,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={text}
        onChangeText={handleChange}
        multiline
        textAlignVertical="top"
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
  textarea: {
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
