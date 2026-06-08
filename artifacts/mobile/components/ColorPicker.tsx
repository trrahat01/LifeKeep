import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ITEM_COLORS, COLOR_KEYS } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {COLOR_KEYS.map((key) => {
        const c = ITEM_COLORS[key];
        const dot = c.gradient[0];
        const isSelected = selected === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.dot,
              { backgroundColor: dot },
              isSelected && styles.selected,
            ]}
            onPress={() => onSelect(key)}
          >
            {isSelected && <Feather name="check" size={12} color="#FFFFFF" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 4,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
