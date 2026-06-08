import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { loadData, saveData, clearAllData, KEYS } from "@/lib/storage";
import { generateId, now } from "@/lib/utils";

export type ItemColor =
  | "purple"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "pink"
  | "orange"
  | "teal";

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  category: string;
  color: ItemColor;
  pinned: boolean;
  checklistMode: boolean;
  checklistItems: ChecklistItem[];
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  category: string;
  color: ItemColor;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

export interface ShoppingItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  category: string;
  color: ItemColor;
  checked: boolean;
  quantity: string;
}

export interface Birthday {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  category: string;
  color: ItemColor;
  date: string;
}

export interface ImportantInfo {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  category: string;
  color: ItemColor;
}

export interface Bookmark {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  category: string;
  color: ItemColor;
}

interface AppContextType {
  loaded: boolean;
  notes: Note[];
  todos: Todo[];
  shoppingItems: ShoppingItem[];
  birthdays: Birthday[];
  importantInfo: ImportantInfo[];
  bookmarks: Bookmark[];
  addNote: (n: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, n: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addTodo: (t: Omit<Todo, "id" | "createdAt" | "updatedAt">) => void;
  updateTodo: (id: string, t: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  addShoppingItem: (
    s: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateShoppingItem: (id: string, s: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  addBirthday: (b: Omit<Birthday, "id" | "createdAt" | "updatedAt">) => void;
  updateBirthday: (id: string, b: Partial<Birthday>) => void;
  deleteBirthday: (id: string) => void;
  addImportantInfo: (
    i: Omit<ImportantInfo, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateImportantInfo: (id: string, i: Partial<ImportantInfo>) => void;
  deleteImportantInfo: (id: string) => void;
  addBookmark: (b: Omit<Bookmark, "id" | "createdAt" | "updatedAt">) => void;
  updateBookmark: (id: string, b: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function makeItem<T extends { id: string; createdAt: string; updatedAt: string }>(
  data: Omit<T, "id" | "createdAt" | "updatedAt">
): T {
  const ts = now();
  return { ...data, id: generateId(), createdAt: ts, updatedAt: ts } as T;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [importantInfo, setImportantInfo] = useState<ImportantInfo[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    (async () => {
      const [n, t, s, b, i, bk] = await Promise.all([
        loadData(KEYS.NOTES, [] as Note[]),
        loadData(KEYS.TODOS, [] as Todo[]),
        loadData(KEYS.SHOPPING, [] as ShoppingItem[]),
        loadData(KEYS.BIRTHDAYS, [] as Birthday[]),
        loadData(KEYS.INFO, [] as ImportantInfo[]),
        loadData(KEYS.BOOKMARKS, [] as Bookmark[]),
      ]);
      setNotes(n);
      setTodos(t);
      setShoppingItems(s);
      setBirthdays(b);
      setImportantInfo(i);
      setBookmarks(bk);
      setLoaded(true);
    })();
  }, []);

  const addNote = useCallback(
    (data: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
      const item = makeItem<Note>(data);
      setNotes((prev) => {
        const next = [item, ...prev];
        saveData(KEYS.NOTES, next);
        return next;
      });
    },
    []
  );

  const updateNote = useCallback((id: string, data: Partial<Note>) => {
    setNotes((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, ...data, updatedAt: now() } : n
      );
      saveData(KEYS.NOTES, next);
      return next;
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveData(KEYS.NOTES, next);
      return next;
    });
  }, []);

  const addTodo = useCallback(
    (data: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
      const item = makeItem<Todo>(data);
      setTodos((prev) => {
        const next = [item, ...prev];
        saveData(KEYS.TODOS, next);
        return next;
      });
    },
    []
  );

  const updateTodo = useCallback((id: string, data: Partial<Todo>) => {
    setTodos((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: now() } : t
      );
      saveData(KEYS.TODOS, next);
      return next;
    });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveData(KEYS.TODOS, next);
      return next;
    });
  }, []);

  const addShoppingItem = useCallback(
    (data: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt">) => {
      const item = makeItem<ShoppingItem>(data);
      setShoppingItems((prev) => {
        const next = [item, ...prev];
        saveData(KEYS.SHOPPING, next);
        return next;
      });
    },
    []
  );

  const updateShoppingItem = useCallback(
    (id: string, data: Partial<ShoppingItem>) => {
      setShoppingItems((prev) => {
        const next = prev.map((s) =>
          s.id === id ? { ...s, ...data, updatedAt: now() } : s
        );
        saveData(KEYS.SHOPPING, next);
        return next;
      });
    },
    []
  );

  const deleteShoppingItem = useCallback((id: string) => {
    setShoppingItems((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveData(KEYS.SHOPPING, next);
      return next;
    });
  }, []);

  const addBirthday = useCallback(
    (data: Omit<Birthday, "id" | "createdAt" | "updatedAt">) => {
      const item = makeItem<Birthday>(data);
      setBirthdays((prev) => {
        const next = [item, ...prev];
        saveData(KEYS.BIRTHDAYS, next);
        return next;
      });
    },
    []
  );

  const updateBirthday = useCallback((id: string, data: Partial<Birthday>) => {
    setBirthdays((prev) => {
      const next = prev.map((b) =>
        b.id === id ? { ...b, ...data, updatedAt: now() } : b
      );
      saveData(KEYS.BIRTHDAYS, next);
      return next;
    });
  }, []);

  const deleteBirthday = useCallback((id: string) => {
    setBirthdays((prev) => {
      const next = prev.filter((b) => b.id !== id);
      saveData(KEYS.BIRTHDAYS, next);
      return next;
    });
  }, []);

  const addImportantInfo = useCallback(
    (data: Omit<ImportantInfo, "id" | "createdAt" | "updatedAt">) => {
      const item = makeItem<ImportantInfo>(data);
      setImportantInfo((prev) => {
        const next = [item, ...prev];
        saveData(KEYS.INFO, next);
        return next;
      });
    },
    []
  );

  const updateImportantInfo = useCallback(
    (id: string, data: Partial<ImportantInfo>) => {
      setImportantInfo((prev) => {
        const next = prev.map((i) =>
          i.id === id ? { ...i, ...data, updatedAt: now() } : i
        );
        saveData(KEYS.INFO, next);
        return next;
      });
    },
    []
  );

  const deleteImportantInfo = useCallback((id: string) => {
    setImportantInfo((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveData(KEYS.INFO, next);
      return next;
    });
  }, []);

  const addBookmark = useCallback(
    (data: Omit<Bookmark, "id" | "createdAt" | "updatedAt">) => {
      const item = makeItem<Bookmark>(data);
      setBookmarks((prev) => {
        const next = [item, ...prev];
        saveData(KEYS.BOOKMARKS, next);
        return next;
      });
    },
    []
  );

  const updateBookmark = useCallback((id: string, data: Partial<Bookmark>) => {
    setBookmarks((prev) => {
      const next = prev.map((b) =>
        b.id === id ? { ...b, ...data, updatedAt: now() } : b
      );
      saveData(KEYS.BOOKMARKS, next);
      return next;
    });
  }, []);

  const deleteBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      saveData(KEYS.BOOKMARKS, next);
      return next;
    });
  }, []);

  const resetAllData = useCallback(async () => {
    await clearAllData();
    setNotes([]);
    setTodos([]);
    setShoppingItems([]);
    setBirthdays([]);
    setImportantInfo([]);
    setBookmarks([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        loaded,
        notes,
        todos,
        shoppingItems,
        birthdays,
        importantInfo,
        bookmarks,
        addNote,
        updateNote,
        deleteNote,
        addTodo,
        updateTodo,
        deleteTodo,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        addBirthday,
        updateBirthday,
        deleteBirthday,
        addImportantInfo,
        updateImportantInfo,
        deleteImportantInfo,
        addBookmark,
        updateBookmark,
        deleteBookmark,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
