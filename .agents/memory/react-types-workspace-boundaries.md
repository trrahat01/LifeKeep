---
name: React type boundaries in mixed workspace packages
description: How to handle duplicate React type versions across the mobile and web preview packages.
---

When a workspace package consumes React components typed by a different React type package version, refs can fail with misleading “two different types” errors even when runtime behavior is valid. Keep ref-bearing props out of wrapper prop types when possible, and cast only at the component boundary when the third-party contract is otherwise correct.

**Why:** The mobile and web preview packages resolve different React type versions through their dependency trees, so shared-looking `Ref` types are not always structurally compatible.

**How to apply:** For wrappers around third-party React components, prefer `ComponentPropsWithoutRef` when the wrapper does not intentionally expose refs; for library-provided refs, use a narrow cast at the DOM boundary rather than weakening unrelated types.