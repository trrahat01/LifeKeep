# LifeKeep

An offline-first personal organizer built with Expo React Native — notes, tasks, shopping lists, birthdays, secure vault, and bookmarks, all stored locally on-device.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — start the Expo dev server
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000, not used by app)
- `pnpm run typecheck` — full typecheck across all packages
- Scan QR code from Expo Go on device to test natively

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, Expo Router, React Native
- State: React Context + AsyncStorage (fully offline)
- Animations: react-native-reanimated
- Gradients: expo-linear-gradient
- Icons: @expo/vector-icons (Feather, Ionicons)
- Fonts: Inter (400/500/600/700)

## Where things live

- `artifacts/mobile/app/(tabs)/` — all 5 tab screens (Home, Notes, Tasks, Vault, Settings)
- `artifacts/mobile/app/notes/[id].tsx` — note editor (create/edit with checklist mode)
- `artifacts/mobile/app/search.tsx` — universal search across all data types
- `artifacts/mobile/context/AppContext.tsx` — all CRUD data operations + AsyncStorage persistence
- `artifacts/mobile/context/ThemeContext.tsx` — dark/light mode + accent color picker
- `artifacts/mobile/lib/storage.ts` — AsyncStorage helpers (load, save, export, import, clear)
- `artifacts/mobile/lib/utils.ts` — ID generation, date utils, color constants
- `artifacts/mobile/constants/colors.ts` — design tokens (light + dark, indigo/purple palette)
- `artifacts/mobile/components/` — GradientCard, FAB, EmptyState, NoteCard, StatCard, SwipeableRow, ColorPicker, AnimatedListItem, SearchBar

## Architecture decisions

- **No backend** — everything stored locally via AsyncStorage. No network calls except external bookmark links.
- **ThemeContext over useColors()** — components use `useTheme()` from ThemeContext (not `useColors()`) to get user-controlled dark/light + accent color preference that persists across restarts.
- **Context-based CRUD** — AppContext exposes typed add/update/delete for all 6 data types; each operation immediately persists to AsyncStorage.
- **5-tab max** — Android enforces 5 tabs max per Material Design; tabs are Home, Notes, Tasks, Vault, Settings.
- **NativeTabs for iOS 26+** — uses `isLiquidGlassAvailable()` to conditionally render liquid glass tab bar.

## Product

- **Home** — animated greeting, 6 colorful stat cards, quick-action grid, recent items list, task progress bar
- **Notes** — create/edit rich notes with color tags, pin, favorite, checklist mode; search + filter
- **Tasks** — To-Do (priority + completion animation) and Shopping list (check-off + swipe-to-delete) in one tab-switched screen
- **Vault** — 3 sections: Birthdays (countdown + age calc), Important Info (masked secrets, reveal-on-tap), Bookmarks (open externally)
- **Search** — universal search across all data types with category filters
- **Settings** — dark/light toggle, 5 accent colors, export data (Share), reset all data

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT use `uuid` package — crashes on iOS/Android. Use `Date.now().toString() + Math.random().toString(36).substr(2, 9)` (see `lib/utils.ts`).
- ThemeContext wraps the entire app in `_layout.tsx` — must be inside QueryClientProvider and outside AppProvider.
- `useAnimatedStyle` must never be called inside `.map()` — extract animated items to their own components.
- `Animated.createAnimatedComponent(TouchableOpacity)` must be declared at module scope, not inside a component function.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo-specific guidelines and pitfalls
