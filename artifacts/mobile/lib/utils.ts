export const generateId = (): string =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const now = (): string => new Date().toISOString();

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatShortDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const getAge = (dateStr: string): number => {
  const today = new Date();
  const birth = new Date(dateStr);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const getDaysUntilBirthday = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birth = new Date(dateStr);
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const truncate = (str: string, max: number): string =>
  str.length > max ? str.slice(0, max) + "…" : str;

export const ITEM_COLORS: Record<
  string,
  { light: string; dark: string; gradient: [string, string] }
> = {
  purple: {
    light: "#EDE9FF",
    dark: "#2D1B69",
    gradient: ["#A29BFE", "#6C5CE7"],
  },
  blue: {
    light: "#E0F0FF",
    dark: "#1A3A5C",
    gradient: ["#74B9FF", "#0984E3"],
  },
  green: {
    light: "#D4F8EE",
    dark: "#1A4A3A",
    gradient: ["#55EFC4", "#00B894"],
  },
  yellow: {
    light: "#FFF8E0",
    dark: "#4A3B00",
    gradient: ["#FFEAA7", "#FDCB6E"],
  },
  red: {
    light: "#FFE5E7",
    dark: "#4A1A1A",
    gradient: ["#FF7675", "#D63031"],
  },
  pink: {
    light: "#FFE5F2",
    dark: "#4A1A3A",
    gradient: ["#FD79A8", "#E84393"],
  },
  orange: {
    light: "#FFF0E0",
    dark: "#4A2A00",
    gradient: ["#FDCB6E", "#E17055"],
  },
  teal: {
    light: "#E0F8F8",
    dark: "#0A3A3A",
    gradient: ["#81ECEC", "#00CEC9"],
  },
};

export const COLOR_KEYS = Object.keys(ITEM_COLORS) as Array<
  keyof typeof ITEM_COLORS
>;

export const PRIORITY_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  high: { bg: "#FF4757", text: "#FFFFFF", label: "High" },
  medium: { bg: "#FDCB6E", text: "#1A1A2E", label: "Medium" },
  low: { bg: "#55EFC4", text: "#1A1A2E", label: "Low" },
};

export const INFO_CATEGORIES = [
  { key: "passport", label: "Passport", icon: "book" },
  { key: "license", label: "Driver License", icon: "credit-card" },
  { key: "insurance", label: "Insurance", icon: "shield" },
  { key: "emergency", label: "Emergency Contact", icon: "phone" },
  { key: "other", label: "Other", icon: "lock" },
];
