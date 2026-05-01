// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { useState } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import {
  TextBox,
  Checkbox,
  RadioGroup,
  TextArea,
  Button,
  Select,
  Section,
} from "./index";

export default function Preview() {
  const [textValue, setTextValue] = useState("");
  const [textAreaValue, setTextAreaValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  const radioOptions = [
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2" },
    { label: "Option 3", value: "opt3" },
  ];

  const selectOptions = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Orange", value: "orange" },
    { label: "Mango", value: "mango" },
    { label: "Pineapple", value: "pineapple" },
    { label: "Grapes", value: "grapes" },
    { label: "Strawberry", value: "strawberry" },
    { label: "Blueberry", value: "blueberry" },
    { label: "Raspberry", value: "raspberry" },
    { label: "Blackberry", value: "blackberry" },
    { label: "Kiwi", value: "kiwi" },
    { label: "Peach", value: "peach" },
    { label: "Pear", value: "pear" },
    { label: "Plum", value: "plum" },
    { label: "Cherry", value: "cherry" },
    { label: "Lemon", value: "lemon" },
    { label: "Lime", value: "lime" },
    { label: "Watermelon", value: "watermelon" },
    { label: "Cantaloupe", value: "cantaloupe" },
    { label: "Honeydew", value: "honeydew" },
    { label: "Papaya", value: "papaya" },
    { label: "Guava", value: "guava" },
    { label: "Passionfruit", value: "passionfruit" },
    { label: "Dragonfruit", value: "dragonfruit" },
  ];

  const sections = [
    {
      id: "title",
      type: "title",
      title: "UI Components Demo",
    },
    {
      id: "textbox",
      type: "textbox",
      title: "TextBox",
      value: textValue,
    },
    {
      id: "textarea",
      type: "textarea",
      title: "TextArea",
      value: textAreaValue,
    },
    {
      id: "checkbox",
      type: "checkbox",
      title: "Checkbox",
    },
    {
      id: "radiobutton",
      type: "radiobutton",
      title: "Radio Button",
    },
    {
      id: "select",
      type: "select",
      title: "Select / Dropdown",
    },
    {
      id: "button",
      type: "button",
      title: "Buttons",
    },
  ];

  const renderSection = ({ item }) => {
    switch (item.type) {
      case "title":
        return <Text style={styles.title}>{item.title}</Text>;

      case "textbox":
        return (
          <Section title="TextBox">
            <TextBox
              label="Enter your name"
              placeholder="John Doe"
              value={textValue}
              onChangeText={setTextValue}
            />
            {textValue && (
              <Text style={styles.output}>You entered: {textValue}</Text>
            )}
          </Section>
        );

      case "textarea":
        return (
          <Section title="TextArea">
            <TextArea
              label="Enter your message"
              placeholder="Type your message here..."
              value={textAreaValue}
              onChangeText={setTextAreaValue}
              rows={4}
            />
            {textAreaValue && (
              <Text style={styles.output}>Message: {textAreaValue}</Text>
            )}
          </Section>
        );

      case "checkbox":
        return (
          <Section title="Checkbox">
            <Checkbox label="I agree to the terms" />
            <Checkbox label="Subscribe to newsletter" />
            <Checkbox label="Remember me" defaultValue={true} />
          </Section>
        );

      case "radiobutton":
        return (
          <Section title="Radio Button">
            <RadioGroup
              options={radioOptions}
              onSelect={(value) => console.log("Selected:", value)}
            />
          </Section>
        );

      case "select":
        return (
          <Section title="Select / Dropdown">
            <Select
              label="Choose a fruit"
              options={selectOptions}
              placeholder="Select a fruit..."
              enableSearch
            />
            {selectedOption && (
              <Text style={styles.output}>Selected: {selectedOption}</Text>
            )}
          </Section>
        );

      case "button":
        return (
          <Section title="Buttons">
            <Button
              title="Primary Button"
              variant="primary"
              onPress={() => console.log("Primary button pressed")}
            />
            <Button
              title="Secondary Button"
              variant="secondary"
              onPress={() => console.log("Secondary button pressed")}
            />
            <Button
              title="Danger Button"
              variant="danger"
              onPress={() => console.log("Danger button pressed")}
            />
            <Button
              title="Disabled Button"
              disabled
              onPress={() => console.log("This won't trigger")}
            />
          </Section>
        );

      default:
        return null;
    }
  };

  return (
    <FlatList
      data={sections}
      renderItem={renderSection}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#333",
  },
  output: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    color: "#333",
    fontSize: 13,
  },
});
