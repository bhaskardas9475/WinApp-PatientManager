import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
  TextInput,
} from "react-native";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  selectedValue?: string | number;
  onValueChange?: (value: string | number) => void;
  placeholder?: string;
  enableSearch?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = "Select an option...",
  enableSearch = false,
}) => {
  const [selected, setSelected] = useState(
    selectedValue || options[0]?.value || "",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSelected(selectedValue || options[0]?.value || "");
  }, [options, selectedValue]);

  const selectedLabel =
    options.find((opt) => opt.value === selected)?.label || placeholder;

  const filteredOptions = searchQuery
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  const handleSelect = (value: string | number) => {
    setSelected(value);
    onValueChange?.(value);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectButtonText}>{selectedLabel}</Text>
        <Text style={styles.selectArrow}>{isOpen ? "^" : "v"}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownWrapper}>
          <View style={styles.dropdownContainer}>
            {enableSearch && (
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}
            <FlatList
              showsVerticalScrollIndicator={true}
              data={filteredOptions}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    selected === item.value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected === item.value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
              style={styles.optionsContainer}
              scrollEnabled={filteredOptions.length > 4}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    position: "relative",
    overflow: "visible",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  selectArrow: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  searchContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 10,
    backgroundColor: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  dropdownWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 65,
    zIndex: 1000,
    elevation: 10,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
    maxHeight: 300,
    overflow: "hidden",
    zIndex: 1000,
    elevation: 10,
  },
  optionsContainer: {
    flexGrow: 0,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionSelected: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  optionHovered: {
    backgroundColor: "#e0e0e0",
  },
});
