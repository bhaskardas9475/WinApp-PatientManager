import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

/**
 * Props for the Row component
 * @param spacing - The gap between columns in pixels
 */
interface RowProps {
  children: ReactNode;
  spacing?: number;
  style?: ViewStyle;
}

/**
 * Props for the Col component
 */
interface ColProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Row: React.FC<RowProps> = ({ children, spacing = 0, style }) => {
  return <View style={[styles.row, { gap: spacing }, style]}>{children}</View>;
};

export const Col: React.FC<ColProps> = ({ children, style }) => {
  return <View style={[styles.col, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  col: {
    flex: 1, // Ensures columns take up equal available space
  },
});
