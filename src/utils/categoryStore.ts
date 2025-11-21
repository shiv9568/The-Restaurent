import { FoodItem } from "@/types";

// Category interface
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOnHomepage: boolean;
  items: FoodItem[];
}

// Event name used to notify listeners that categories changed
export const CATEGORIES_UPDATED_EVENT = "categoriesUpdated";

const STORAGE_KEY = "menuCategories";

// Default Indian restaurant categories
export const defaultCategories: Category[] = [
  {
    id: 'appetizers',
    name: 'Appetizers',
    description: 'Starters & Snacks',
    icon: '🍤',
    displayOnHomepage: true,
    items: []
  },
  {
    id: 'main-course',
    name: 'Main Course',
    description: 'Rice, Roti & Curries',
    icon: '🍛',
    displayOnHomepage: true,
    items: []
  },
  {
    id: 'fast-food',
    name: 'Fast Food',
    description: 'Burgers, Pizza & More',
    icon: '🍔',
    displayOnHomepage: true,
    items: []
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Drinks & Juices',
    icon: '🥤',
    displayOnHomepage: true,
    items: []
  },
  {
    id: 'desserts',
    name: 'Desserts',
    description: 'Sweet Treats',
    icon: '🍰',
    displayOnHomepage: true,
    items: []
  },
  {
    id: 'breads',
    name: 'Breads',
    description: 'Naan, Roti & Paratha',
    icon: '🥖',
    displayOnHomepage: true,
    items: []
  },
  {
    id: 'soups',
    name: 'Soups',
    description: 'Hot & Healthy Soups',
    icon: '🍲',
    displayOnHomepage: false,
    items: []
  },
  {
    id: 'salads',
    name: 'Salads',
    description: 'Fresh & Healthy',
    icon: '🥗',
    displayOnHomepage: false,
    items: []
  }
];

export function getCategories(): Category[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Initialize with default categories
      setCategories(defaultCategories);
      return defaultCategories;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Category[];
    // If empty array, return defaults
    setCategories(defaultCategories);
    return defaultCategories;
  } catch (e) {
    console.error("Failed to parse categories from storage", e);
    return defaultCategories;
  }
}

export function setCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  // Dispatch a custom event for same-tab listeners
  window.dispatchEvent(new CustomEvent(CATEGORIES_UPDATED_EVENT));
}

export function subscribeCategories(cb: () => void): () => void {
  const handler = () => cb();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener(CATEGORIES_UPDATED_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(CATEGORIES_UPDATED_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

// Helper functions
export function addItemToCategory(categoryId: string, item: FoodItem): void {
  const categories = getCategories();
  const updated = categories.map(cat => {
    if (cat.id === categoryId) {
      return {
        ...cat,
        items: [...cat.items.filter(i => i.id !== item.id), item]
      };
    }
    return cat;
  });
  setCategories(updated);
}

export function removeItemFromCategory(categoryId: string, itemId: string): void {
  const categories = getCategories();
  const updated = categories.map(cat => {
    if (cat.id === categoryId) {
      return {
        ...cat,
        items: cat.items.filter(i => i.id !== itemId)
      };
    }
    return cat;
  });
  setCategories(updated);
}

export function toggleCategoryHomepage(categoryId: string, display: boolean): void {
  const categories = getCategories();
  const updated = categories.map(cat => {
    if (cat.id === categoryId) {
      return { ...cat, displayOnHomepage: display };
    }
    return cat;
  });
  setCategories(updated);
}

