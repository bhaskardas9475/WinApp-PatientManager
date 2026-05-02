import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  small?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  small = false,
  style,
  textStyle,
}) => {
  const variantStyle = getVariantStyle(variant, disabled);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyle.button,
        small ? styles.smallStyle : null,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          variantStyle.text,
          small ? styles.smallText : null,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const getVariantStyle = (variant: string, disabled: boolean) => {
  const baseDisabled = disabled
    ? {
        button: { opacity: 0.5 },
        text: {},
      }
    : {};

  switch (variant) {
    case "secondary":
      return {
        button: {
          backgroundColor: "#f0f0f0",
          borderWidth: 1,
          borderColor: "#007AFF",
          ...baseDisabled.button,
        },
        text: { color: "#007AFF" },
      };
    case "danger":
      return {
        button: {
          backgroundColor: "#ff3b30",
          ...baseDisabled.button,
        },
        text: { color: "#fff" },
      };
    case "primary":
    default:
      return {
        button: {
          backgroundColor: "#007AFF",
          ...baseDisabled.button,
        },
        text: { color: "#fff" },
      };
  }
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    cursor: "pointer",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  smallStyle: {
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  smallText: {
    fontSize: 12,
  },
});
