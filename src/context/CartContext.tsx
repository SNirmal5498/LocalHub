import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/index.js';
import { api } from '../services/api.js';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  businessId: string | null;
  businessName: string | null;
  itemCount: number;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, businessName?: string) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string; discount?: number }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('localhub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [businessId, setBusinessId] = useState<string | null>(() => {
    return localStorage.getItem('localhub_cart_business') || null;
  });

  const [businessName, setBusinessName] = useState<string | null>(() => {
    return localStorage.getItem('localhub_cart_business_name') || null;
  });

  const [couponCode, setCouponCode] = useState<string | null>(() => {
    return localStorage.getItem('localhub_cart_coupon') || null;
  });

  const [discount, setDiscount] = useState<number>(() => {
    const saved = localStorage.getItem('localhub_cart_discount');
    return saved ? parseFloat(saved) : 0;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('localhub_cart', JSON.stringify(items));
    if (items.length === 0) {
      setBusinessId(null);
      setBusinessName(null);
      setCouponCode(null);
      setDiscount(0);
      localStorage.removeItem('localhub_cart_business');
      localStorage.removeItem('localhub_cart_business_name');
      localStorage.removeItem('localhub_cart_coupon');
      localStorage.removeItem('localhub_cart_discount');
    } else {
      if (businessId) localStorage.setItem('localhub_cart_business', businessId);
      if (businessName) localStorage.setItem('localhub_cart_business_name', businessName);
    }
  }, [items, businessId, businessName]);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice !== null && item.product.discountPrice !== undefined
      ? item.product.discountPrice
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const total = Math.max(0, subtotal - discount);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, quantity = 1, bName?: string) => {
    if (!product.isAvailable) {
      return { success: false, message: 'This item is currently out of stock.' };
    }

    // Check if adding from another business
    if (businessId && businessId !== product.business && items.length > 0) {
      setItems([{ product, quantity }]);
      setBusinessId(product.business);
      setBusinessName(bName || 'Local Store');
      setCouponCode(null);
      setDiscount(0);
      setIsCartOpen(true);
      return { success: true, message: `Cart updated with items from ${bName || 'new store'}.` };
    }

    setBusinessId(product.business);
    if (bName) setBusinessName(bName);

    setItems(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (product.stock !== undefined && newQty > product.stock) {
          return prev;
        }
        return prev.map(item =>
          item.product._id === product._id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setIsCartOpen(true);
    return { success: true };
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.product._id === productId) {
          const maxStock = item.product.stock;
          if (maxStock !== undefined && quantity > maxStock) {
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product._id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setBusinessId(null);
    setBusinessName(null);
    setCouponCode(null);
    setDiscount(0);
    localStorage.removeItem('localhub_cart');
    localStorage.removeItem('localhub_cart_business');
    localStorage.removeItem('localhub_cart_business_name');
    localStorage.removeItem('localhub_cart_coupon');
    localStorage.removeItem('localhub_cart_discount');
  };

  const applyCoupon = async (code: string) => {
    if (!businessId) {
      return { success: false, message: 'Add items to your cart first.' };
    }

    const res = await api.validateCoupon(businessId, code, subtotal);
    if (res.success && res.data) {
      setCouponCode(res.data.couponCode);
      setDiscount(res.data.discount);
      localStorage.setItem('localhub_cart_coupon', res.data.couponCode);
      localStorage.setItem('localhub_cart_discount', String(res.data.discount));
      return { success: true, message: res.message, discount: res.data.discount };
    } else {
      return { success: false, message: res.message || 'Invalid coupon code.' };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscount(0);
    localStorage.removeItem('localhub_cart_coupon');
    localStorage.removeItem('localhub_cart_discount');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        businessId,
        businessName,
        itemCount,
        subtotal,
        discount,
        couponCode,
        total,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
