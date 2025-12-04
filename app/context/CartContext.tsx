'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CardData } from '../components/ProductModal';

export interface CartItem {
  id: number;
  name: string;
  price: string | number;
  image: string;
  quantity: number;
  cardsData?: CardData[]; // Her ürün için kart verileri
}

interface Product {
  id: number;
  name: string;
  price: number | string;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, cardsData?: CardData[]) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  updateCartItemCardsData: (productId: number, cardsData: CardData[]) => void;
  getTotalPrice: () => number;
  cartCount: number;
  clearCart: () => void;
  isLoaded: boolean;
  lastAddedProductId: number | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState<number | null>(null);

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

  const addToCart = (product: Product, quantity: number = 1, cardsData?: CardData[]) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    // Son eklenen ürün ID'sini set et
    setLastAddedProductId(product.id);
    // 2 saniye sonra temizle
    setTimeout(() => setLastAddedProductId(null), 1000);
    
    if (existingItem) {
      // Mevcut item varsa, mevcut cardsData'yı koru ve yeni kartları ekle
      const existingCardsData = existingItem.cardsData || [];
      const newCardsData = cardsData || [];
      
      // Mevcut kartları koru, yeni kartları sonuna ekle
      const mergedCardsData = [...existingCardsData, ...newCardsData];
      
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { 
              ...item, 
              quantity: item.quantity + quantity, 
              cardsData: mergedCardsData.length > 0 ? mergedCardsData : item.cardsData 
            }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        cardsData: cardsData
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

  const updateCartItemCardsData = (productId: number, cardsData: CardData[]) => {
    setCartItems(cartItems.map(item =>
      item.id === productId
        ? { ...item, cardsData: cardsData }
        : item
    ));
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
      updateCartItemCardsData,
      getTotalPrice,
      cartCount,
      clearCart,
      isLoaded,
      lastAddedProductId
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
