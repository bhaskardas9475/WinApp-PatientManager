import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { Col, Row } from "./Grid";

interface TableAction<T> {
  title: string;
  onClick: (item: T) => void;
  variant?: "primary" | "secondary" | "danger";
}

interface TableProps<T> {
  data: T[];
  cols: string[];
  itemActions?: TableAction<T>[];
}

const getCellValue = (item: object, col: string) => {
  const record = item as Record<string, unknown>;
  const exactValue = record[col];
  if (exactValue !== undefined) {
    return exactValue;
  }

  const normalizedCol = col.toLowerCase().replace(/\s+/g, "");
  const matchingKey = Object.keys(record).find(
    (key) => key.toLowerCase().replace(/\s+/g, "") === normalizedCol,
  );

  return matchingKey ? record[matchingKey] : undefined;
};

export const Table = <T extends object>({
  data,
  cols,
  itemActions = [],
}: TableProps<T>) => {
  const renderItem = ({ item, index }: { item: T; index: number }) => (
    <Row style={styles.tableRow}>
      <Col style={styles.serialColumn}>
        <Text style={styles.tableCellText}>{index + 1}</Text>
      </Col>

      {cols.map((col) => (
        <Col key={col} style={styles.dataColumn}>
          <Text style={styles.tableCellText}>
            {String(getCellValue(item, col) ?? "-")}
          </Text>
        </Col>
      ))}

      {itemActions.length > 0 && (
        <Col style={styles.actionsColumn}>
          <View style={styles.tableActions}>
            {itemActions.map((action) => (
              <Button
                key={action.title}
                small
                title={action.title}
                variant={action.variant ?? "secondary"}
                onPress={() => action.onClick(item)}
                style={styles.tableActionButton}
              />
            ))}
          </View>
        </Col>
      )}
    </Row>
  );

  return (
    <View style={styles.container}>
      <Row style={styles.tableHeader}>
        <Col style={styles.serialColumn}>
          <Text style={styles.tableHeaderText}>#</Text>
        </Col>

        {cols.map((col) => (
          <Col key={col} style={styles.dataColumn}>
            <Text style={styles.tableHeaderText}>{col}</Text>
          </Col>
        ))}

        {itemActions.length > 0 && (
          <Col style={styles.actionsColumn}>
            <Text style={styles.actionsHeaderText}>Actions</Text>
          </Col>
        )}
      </Row>

      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={
          data.length === 0 ? styles.emptyListContent : undefined
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No records found.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  tableHeader: {
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#d7e4ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2457a5",
  },
  actionsHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2457a5",
    textAlign: "center",
  },
  tableRow: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginBottom: 5,
    backgroundColor: "#fafafa",
    alignItems: "center",
  },
  dataColumn: {
    flex: 1,
    paddingRight: 12,
  },
  serialColumn: {
    flex: 0.35,
    paddingRight: 12,
  },
  actionsColumn: {
    flex: 1.1,
  },
  tableCellText: {
    fontSize: 13,
    color: "#333",
  },
  tableActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  tableActionButton: {
    minWidth: 78,
    marginBottom: 0,
    marginLeft: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    fontSize: 14,
  },
});
