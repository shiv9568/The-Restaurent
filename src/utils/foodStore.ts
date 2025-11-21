import { FoodItem } from "@/types";

// Event name used to notify listeners that food items changed
export const FOOD_ITEMS_UPDATED_EVENT = "foodItemsUpdated";

// Shape used in admin for local persistence
// Using shared FoodItem type from src/types

const STORAGE_KEY = "foodItems";

export function getFoodItems(): FoodItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) return parsed as FoodItem[];
  } catch (e) {
    console.error("Failed to parse food items from storage", e);
  }
  return [];
}

export function setFoodItems(items: FoodItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Dispatch a custom event for same-tab listeners
  window.dispatchEvent(new CustomEvent(FOOD_ITEMS_UPDATED_EVENT));
}

export function subscribeFoodItems(cb: () => void): () => void {
  const handler = () => cb();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener(FOOD_ITEMS_UPDATED_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(FOOD_ITEMS_UPDATED_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}
