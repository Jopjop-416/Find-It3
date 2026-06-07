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
