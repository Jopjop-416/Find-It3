type BrowseItem = {
  category?: string;
};

const categoryLabelById: Record<string, string> = {
  elektronik: "Elektronik",
  buku: "Buku",
  "kartu-identitas": "Kartu Identitas",
  dompet: "Dompet",
  tas: "Tas",
  kunci: "Kunci",
  aksesori: "Aksesori",
  pakaian: "Pakaian",
  lainnya: "Lainnya",
};

export function getBrowseCategoryItems<T extends BrowseItem>(
  items: T[],
  activeCategory: string | null,
): T[] {
  if (!activeCategory) {
    return items;
  }

  const categoryLabel = categoryLabelById[activeCategory];
  if (!categoryLabel) {
    return items;
  }

  return items.filter((item) => item.category === categoryLabel);
}
