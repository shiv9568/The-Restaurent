import { CartItem } from '@/types';

const CART_KEY = 'foodDeliveryCart';

export const getCart = (): CartItem[] => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: CartItem[]): void => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addToCart = (item: CartItem): void => {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(
    (i) => i.id === item.id && i.restaurantId === item.restaurantId
  );

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
};

export const updateCartItemQuantity = (itemId: string, quantity: number): void => {
  const cart = getCart();
  const itemIndex = cart.findIndex((i) => i.id === itemId);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    saveCart(cart);
  }
};

export const removeFromCart = (itemId: string): void => {
  const cart = getCart().filter((item) => item.id !== itemId);
  saveCart(cart);
};

export const clearCart = (): void => {
  localStorage.removeItem(CART_KEY);
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartItemsCount = (): number => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};
