# Category Browse Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menampilkan card barang di bawah section `Browse By Category` dan memfilter card berdasarkan kategori aktif untuk item `lost` dan `found`.

**Architecture:** Tambahkan helper filter kategori yang bisa dites secara terpisah, lalu sambungkan helper itu ke `NewsCarousel` agar section kategori memiliki state filter dan grid hasil. `Dashboard` akan meneruskan `items` yang sudah visible ke `NewsCarousel` supaya hasil filter konsisten dengan daftar utama.

**Tech Stack:** React, TypeScript, Vitest, existing shadcn card primitives, lucide-react.

---

### Task 1: Tambah regression test untuk filter kategori

**Files:**
- Create: `src/app/components/newsCarouselState.test.ts`
- Test: `src/app/components/newsCarouselState.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getBrowseCategoryItems } from "./newsCarouselState";

const items = [
  { id: 1, title: "Laptop", category: "Elektronik", type: "lost" },
  { id: 2, title: "Dompet", category: "Dompet", type: "found" },
  { id: 3, title: "HP", category: "Elektronik", type: "found" },
];

describe("getBrowseCategoryItems", () => {
  it("returns all items when no category is selected", () => {
    expect(getBrowseCategoryItems(items, null)).toHaveLength(3);
  });

  it("returns lost and found items for the selected category label", () => {
    expect(
      getBrowseCategoryItems(items, "elektronik").map((item) => item.title),
    ).toEqual(["Laptop", "HP"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/components/newsCarouselState.test.ts`
Expected: FAIL karena `newsCarouselState` belum ada.

- [ ] **Step 3: Write minimal implementation**

```ts
export function getBrowseCategoryItems(items, activeCategory) {
  if (!activeCategory) return items;
  const categoryMap = { elektronik: "Elektronik" };
  return items.filter((item) => item.category === categoryMap[activeCategory]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/components/newsCarouselState.test.ts`
Expected: PASS.

### Task 2: Render card hasil filter di bawah kategori

**Files:**
- Modify: `src/app/components/NewsCarousel.tsx`
- Modify: `src/app/components/NewsCarousel.test.tsx`

- [ ] **Step 1: Write the failing render test**

```ts
it("renders filtered browse cards from provided items", () => {
  const markup = renderToStaticMarkup(
    <NewsCarousel
      items={[
        { id: 1, title: "Laptop Asus", category: "Elektronik", type: "lost", location: "Lab", date: "2026-06-07", image: "/a.jpg" },
      ]}
    />,
  );

  expect(markup).toContain("Laptop Asus");
  expect(markup).toContain("Semua Kategori");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/components/NewsCarousel.test.tsx`
Expected: FAIL karena `items` prop dan hasil card belum dirender.

- [ ] **Step 3: Write minimal implementation**

```tsx
interface NewsCarouselProps {
  items?: any[];
  onNavigate?: (view: string) => void;
}

const filteredItems = getBrowseCategoryItems(items, activeCategory);

{filteredItems.map((item) => (
  <Card key={item.id}>...</Card>
))}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/app/components/newsCarouselState.test.ts src/app/components/NewsCarousel.test.tsx`
Expected: PASS.

### Task 3: Sambungkan data dashboard ke kategori browse

**Files:**
- Modify: `src/app/components/Dashboard.tsx`

- [ ] **Step 1: Pass visible items into NewsCarousel**

```tsx
<NewsCarousel items={visibleItems} onNavigate={onNavigate} />
```

- [ ] **Step 2: Run full verification**

Run: `npm test`
Expected: PASS semua test.

Run: `npm run build`
Expected: Build sukses.
