import { useCallback, useEffect, useState } from "react";
import { fallbackProducts } from "../data/products";
import { fetchPublishedProducts } from "../services/productsService";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setLoading(true);
      setError("");
      setUsingFallback(false);

      try {
        const data = await fetchPublishedProducts();

        if (!isMounted) return;
        setProducts(data);
      } catch (requestError) {
        console.error("No se pudo cargar el catálogo desde Supabase:", requestError);

        if (!isMounted) return;
        setProducts(fallbackProducts);
        setUsingFallback(true);
        setError(
          "No pudimos actualizar el catálogo en este momento. Mostramos la versión guardada para que la tienda siga funcionando.",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  return {
    products,
    loading,
    error,
    usingFallback,
    retry,
  };
}
