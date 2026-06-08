import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import baseColors from "@/constants/colors";

export type AccentKey = "purple" | "coral" | "blue" | "green" | "orange";

const ACCENT_PRIMARIES: Record<AccentKey, { light: string; dark: string }> = {
  purple: { light: "#6C5CE7", dark: "#A29BFE" },
  coral: { light: "#E84393", dark: "#FD79A8" },
  blue: { light: "#0984E3", dark: "#74B9FF" },
  green: { light: "#00B894", dark: "#55EFC4" },
  orange: { light: "#E17055", dark: "#FDCB6E" },
};

interface ThemeColors {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  radius: number;
}

interface ThemeContextType {
  isDark: boolean;
  accentKey: AccentKey;
  colors: ThemeColors;
  toggleTheme: () => void;
  setAccentKey: (k: AccentKey) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY_THEME = "@lifevault_theme";
const STORAGE_KEY_ACCENT = "@lifevault_accent";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");
  const [accentKey, setAccentKeyState] = useState<AccentKey>("purple");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, a] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_THEME),
        AsyncStorage.getItem(STORAGE_KEY_ACCENT),
      ]);
      if (t !== null) setIsDark(t === "dark");
      else setIsDark(systemScheme === "dark");
      if (a) setAccentKeyState(a as AccentKey);
      setLoaded(true);
    })();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY_THEME, next ? "dark" : "light");
      return next;
    });
  };

  const setAccentKey = (k: AccentKey) => {
    setAccentKeyState(k);
    AsyncStorage.setItem(STORAGE_KEY_ACCENT, k);
  };

  const scheme = isDark ? baseColors.dark : baseColors.light;
  const accentColors = ACCENT_PRIMARIES[accentKey];

  const colors: ThemeColors = {
    ...scheme,
    primary: isDark ? accentColors.dark : accentColors.light,
    tint: isDark ? accentColors.dark : accentColors.light,
    radius: baseColors.radius,
  };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, accentKey, colors, toggleTheme, setAccentKey }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { ACCENT_PRIMARIES };
