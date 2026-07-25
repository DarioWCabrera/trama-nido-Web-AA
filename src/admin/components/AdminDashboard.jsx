import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import ProductEditor from "./ProductEditor";
import {
  fetchAdminProducts,
  fetchCategories,
  setProductPublished,
  signOutAdmin,
} from "../services/adminService";

export default function AdminDashboard({ session }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [editorProduct, setEditorProduct] = useState(undefined);
  const [signingOut, setSigningOut] = useState(false);
  const [workingProductId, setWorkingProductId] = useState(null);

  const loadData = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [productRows, categoryRows] = await Promise.all([
        fetchAdminProducts(),
        fetchCategories(),
      ]);
      setProducts(productRows);
      setCategories(categoryRows);
    } catch (loadError) {
      setError(loadError?.message || "No pudimos cargar el panel.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.slug, product.categories?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [products, search]);

  const visibleCount = products.filter((product) => product.published).length;
  const featuredCount = products.filter((product) => product.featured).length;
  const immediateStockCount = products
    .filter((product) => !product.made_to_order)
    .reduce((total, product) => total + Number(product.stock_quantity || 0), 0);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutAdmin();
    } catch (logoutError) {
      setError(logoutError?.message || "No pudimos cerrar la sesión.");
      setSigningOut(false);
    }
  };

  const handleTogglePublished = async (product) => {
    setWorkingProductId(product.id);
    setError("");
    setMessage("");

    try {
      await setProductPublished(product.id, !product.published);
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, published: !item.published }
            : item,
        ),
      );
      setMessage(
        product.published
          ? `${product.name} quedó oculto en la tienda.`
          : `${product.name} ya está visible en la tienda.`,
      );
    } catch (toggleError) {
      setError(toggleError?.message || "No pudimos cambiar la visibilidad.");
    } finally {
      setWorkingProductId(null);
    }
  };

  const handleCategoryCreated = (createdCategory) => {
    setCategories((current) =>
      [...current, createdCategory].sort(
        (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0),
      ),
    );
    setMessage(`La categoría ${createdCategory.name} fue creada correctamente.`);
  };

  const handleSaved = async (savedProduct) => {
    setEditorProduct(undefined);
    setMessage(
      products.some((product) => product.id === savedProduct.id)
        ? "Los cambios se guardaron correctamente."
        : "El producto fue creado correctamente.",
    );
    await loadData({ silent: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-sidebar-brand" href="/">
          <img src="/assets/logo-trama-nido.webp" alt="Trama Nido" />
          <div>
            <strong>Trama Nido</strong>
            <span>Administración</span>
          </div>
        </a>

        <nav className="admin-nav" aria-label="Navegación del panel">
          <a className="is-active" href="#productos-admin">
            <span aria-hidden="true">01</span>
            Productos
          </a>
          <a href="/" target="_blank" rel="noreferrer">
            <span aria-hidden="true">↗</span>
            Ver tienda
          </a>
        </nav>

        <div className="admin-sidebar-user">
          <span>Sesión iniciada como</span>
          <strong>{session.user.email}</strong>
          <button type="button" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? "Cerrando…" : "Cerrar sesión"}
          </button>
        </div>
      </aside>

      <main className="admin-main" id="productos-admin">
        <header className="admin-page-header">
          <div>
            <span className="admin-section-kicker">Panel autoadministrable</span>
            <h1>Productos</h1>
            <p>Modificá precios, categorías, disponibilidad, stock, talles y fotografías.</p>
          </div>
          <button
            className="admin-primary-button"
            type="button"
            onClick={() => setEditorProduct(null)}
          >
            + Agregar producto
          </button>
        </header>

        <section className="admin-stats-grid" aria-label="Resumen del catálogo">
          <article>
            <span>Productos totales</span>
            <strong>{products.length}</strong>
          </article>
          <article>
            <span>Visibles en la tienda</span>
            <strong>{visibleCount}</strong>
          </article>
          <article>
            <span>Destacados</span>
            <strong>{featuredCount}</strong>
          </article>
          <article>
            <span>Unidades listas</span>
            <strong>{immediateStockCount}</strong>
          </article>
        </section>

        {error && <p className="admin-message is-error">{error}</p>}
        {message && <p className="admin-message is-success">{message}</p>}

        <section className="admin-catalog-panel">
          <div className="admin-toolbar">
            <label className="admin-search">
              <span className="sr-only">Buscar productos</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o categoría…"
              />
            </label>
            <button
              className="admin-secondary-button admin-small-button"
              type="button"
              onClick={() => loadData({ silent: true })}
              disabled={refreshing}
            >
              {refreshing ? "Actualizando…" : "Actualizar"}
            </button>
          </div>

          {loading ? (
            <div className="admin-table-loading">
              <div className="admin-spinner" />
              <p>Cargando catálogo…</p>
            </div>
          ) : filteredProducts.length ? (
            <div className="admin-products-list">
              {filteredProducts.map((product) => (
                <article className="admin-product-row" key={product.id}>
                  <div className="admin-product-marker" aria-hidden="true">
                    {product.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="admin-product-info">
                    <div className="admin-product-title-line">
                      <h2>{product.name}</h2>
                      <span className={product.published ? "is-visible" : "is-hidden"}>
                        {product.published ? "Publicado" : "Oculto"}
                      </span>
                      {product.featured && <span className="is-featured">Destacado</span>}
                    </div>
                    <p>
                      {product.categories?.name ?? "Sin categoría"} · {product.made_to_order
                        ? "Hecho a pedido"
                        : `Entrega inmediata · Stock ${Number(product.stock_quantity || 0)}`}
                    </p>
                    <small>/{product.slug}</small>
                  </div>

                  <div className="admin-product-price">
                    <strong>{formatCurrency(Number(product.price))}</strong>
                    <span>Seña {product.deposit_percentage}%</span>
                  </div>

                  <div className="admin-product-actions">
                    <button
                      className="admin-secondary-button admin-small-button"
                      type="button"
                      onClick={() => setEditorProduct(product)}
                    >
                      Editar
                    </button>
                    <button
                      className="admin-text-button"
                      type="button"
                      onClick={() => handleTogglePublished(product)}
                      disabled={workingProductId === product.id}
                    >
                      {workingProductId === product.id
                        ? "Guardando…"
                        : product.published
                          ? "Ocultar"
                          : "Publicar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <span aria-hidden="true">🧶</span>
              <h2>No encontramos productos.</h2>
              <p>{search ? "Probá con otra búsqueda." : "Agregá el primer producto al catálogo."}</p>
            </div>
          )}
        </section>
      </main>

      {editorProduct !== undefined && (
        <ProductEditor
          product={editorProduct}
          categories={categories}
          onClose={() => setEditorProduct(undefined)}
          onSaved={handleSaved}
          onCategoryCreated={handleCategoryCreated}
        />
      )}
    </div>
  );
}
