import { StyleSheet } from "react-native-css-interop";

const flags = StyleSheet as typeof StyleSheet & {
  setFlag?: (name: string, value: string) => void;
};

flags.setFlag?.("darkMode", "class");
