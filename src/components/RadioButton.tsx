import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

interface RadioButtonProps {
  label?: string;
  selected?: boolean;
  onSelect?: () => void;
}

interface RadioGroupProps {
  label?: string;
  options: Array<{ label: string; value: string }>;
  selectedValue?: string;
  onSelect?: (value: string) => void;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  selected = false,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.radio}>
        {selected && <View style={styles.radioDot} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
}) => {
  const [selected, setSelected] = useState(selectedValue || options[0]?.value);

  useEffect(() => {
    setSelected(selectedValue || options[0]?.value);
  }, [options, selectedValue]);

  const handleSelect = (value: string) => {
    setSelected(value);
    onSelect?.(value);
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.groupLabel}>{label}</Text>}
      <View style={styles.groupContainer}>
        {options.map((option) => (
          <RadioButton
            key={option.value}
            label={option.label}
            selected={selected === option.value}
            onSelect={() => handleSelect(option.value)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  wrapper: {
    marginBottom: 12,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  groupContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#fff",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  label: {
    fontSize: 14,
    color: "#333",
  },
});
