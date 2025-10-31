'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: string | number;
  image: string;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  price: number | string;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  getTotalPrice: () => number;
  cartCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // LocalStorage'dan sepeti yükle
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('notouchness_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      setIsLoaded(true);
    };
    
    loadCart();
  }, []);

  // Sepet değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (isLoaded) {
      if (cartItems.length > 0) {
        localStorage.setItem('notouchness_cart', JSON.stringify(cartItems));
      } else {
        localStorage.removeItem('notouchness_cart');
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'string' 
        ? parseInt(item.price.replace(/[₺,.]/g, ''))
        : item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      getTotalPrice,
      cartCount,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
