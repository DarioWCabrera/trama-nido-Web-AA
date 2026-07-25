import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "trama-nido-cart";

const readStoredCart = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, options, quantity) => {
    const key = `${product.id}-${JSON.stringify(options)}`;
    const maxQuantity = product.isImmediateDelivery
      ? Math.max(1, Number(product.stockQuantity || 1))
      : null;

    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity:
                  maxQuantity == null
                    ? item.quantity + quantity
                    : Math.min(maxQuantity, item.quantity + quantity),
                maxQuantity,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          key,
          productId: product.id,
          name: product.name,
          price: product.price,
          depositRate: product.depositRate ?? 0.5,
          image: product.mainImage,
          options,
          quantity: maxQuantity == null ? quantity : Math.min(maxQuantity, quantity),
          maxQuantity,
          immediateDelivery: Boolean(product.isImmediateDelivery),
        },
      ];
    });
    setIsCartOpen(true);
  };

  const changeQuantity = (key, nextQuantity) => {
    if (nextQuantity <= 0) {
      setItems((current) => current.filter((item) => item.key !== key));
      return;
    }
    setItems((current) =>
      current.map((item) => {
        if (item.key !== key) return item;
        const limitedQuantity = item.maxQuantity == null
          ? nextQuantity
          : Math.min(item.maxQuantity, nextQuantity);
        return { ...item, quantity: limitedQuantity };
      }),
    );
  };

  const removeItem = (key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const total = items.reduce(
      (accumulator, item) => accumulator + item.price * item.quantity,
      0,
    );
    const deposit = items.reduce(
      (accumulator, item) =>
        accumulator +
        item.price * item.quantity * (item.depositRate ?? 0.5),
      0,
    );
    const rates = [...new Set(items.map((item) => item.depositRate ?? 0.5))];

    return {
      count: items.reduce((accumulator, item) => accumulator + item.quantity, 0),
      total,
      deposit,
      balance: total - deposit,
      depositPercentage:
        rates.length === 1 ? Math.round(rates[0] * 100) : null,
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totals,
        isCartOpen,
        setIsCartOpen,
        addItem,
        changeQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
};
