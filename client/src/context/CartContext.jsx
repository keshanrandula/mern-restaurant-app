import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on init
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save cart to localStorage when changed
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item._id === product._id);
    if (existingItem) {
      saveCart(
        cartItems.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      saveCart([...cartItems, { ...product, quantity: 1 }]);
    }
    setIsCartOpen(true); // Auto-open cart when item is added
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      saveCart(cartItems.filter((item) => item._id !== productId));
    } else {
      saveCart(
        cartItems.map((item) =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    saveCart(cartItems.filter((item) => item._id !== productId));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
