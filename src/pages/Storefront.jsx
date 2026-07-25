import { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import StockProductCard from "../components/StockProductCard";
import ProductModal from "../components/ProductModal";
import SizeGuideModal from "../components/SizeGuideModal";
import CartDrawer from "../components/CartDrawer";
import CheckoutModal from "../components/CheckoutModal";
import Footer from "../components/Footer";
import AboutSection from "../components/AboutSection";
import MeaningSection from "../components/MeaningSection";
import { store } from "../data/store";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";

function ProductSkeleton({ index }) {
  return (
    <article
      className={`product-card product-card-${index + 1} product-skeleton`}
      aria-hidden="true"
    >
      <div className="skeleton-block skeleton-image" />
      <div className="product-card-body">
        <div className="skeleton-block skeleton-line skeleton-line-small" />
        <div className="skeleton-block skeleton-line skeleton-line-title" />
        <div className="skeleton-block skeleton-line" />
        <div className="skeleton-block skeleton-line skeleton-line-short" />
      </div>
    </article>
  );
}

export default function Storefront() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { setIsCartOpen } = useCart();
  const {
    products,
    loading,
    error,
    usingFallback,
    retry,
  } = useProducts();

  const immediateProducts = products.filter((product) => product.isImmediateDelivery);
  const madeToOrderProducts = products.filter((product) => !product.isImmediateDelivery);

  const openCheckout = () => {
    setIsCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <Header />
      <main>
        <Hero />

        <section className="stock-section" id="stock">
          <div className="container stock-section-inner">
            <div className="stock-section-heading">
              <div>
                <span className="eyebrow">Listos para entregar</span>
                <h2>Productos en stock para entrega inmediata.</h2>
              </div>
              <p>
                Son prendas ya terminadas. Elegí la disponible y coordinamos el
                retiro en Tres Arroyos o el envío a cualquier parte del país.
              </p>
            </div>

            {loading ? (
              <div className="stock-products-grid" aria-busy="true">
                <div className="stock-card-skeleton" />
                <div className="stock-card-skeleton" />
              </div>
            ) : immediateProducts.length ? (
              <div className="stock-products-grid">
                {immediateProducts.map((product) => (
                  <StockProductCard
                    key={product.id}
                    product={product}
                    onOpen={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="stock-empty-note">
                <strong>Por el momento no hay prendas listas para entrega.</strong>
                <p>Podés elegir cualquiera de los modelos a pedido y personalizarlo.</p>
              </div>
            )}
          </div>
        </section>

        <section className="section collection-section" id="productos">
          <div className="container">
            <div className="collection-heading">
              <span className="section-number" aria-hidden="true">01</span>
              <div>
                <span className="eyebrow">Tejidos a pedido</span>
                <h2>Elegí una base. Después la hacemos única.</h2>
              </div>
              <p>
                Cada modelo se teje por encargo. Podés elegir talle, color y
                combinación antes de agregarlo al carrito.
              </p>
            </div>

            {error && (
              <div
                className={`catalog-notice ${usingFallback ? "is-warning" : ""}`}
                role="status"
              >
                <div>
                  <strong>La tienda continúa disponible.</strong>
                  <p>{error}</p>
                </div>
                <button className="text-button" type="button" onClick={retry}>
                  Reintentar conexión
                </button>
              </div>
            )}

            <div className="products-grid" aria-busy={loading}>
              {loading ? (
                <>
                  <ProductSkeleton index={0} />
                  <ProductSkeleton index={1} />
                </>
              ) : (
                madeToOrderProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    onOpen={setSelectedProduct}
                  />
                ))
              )}
            </div>

            {!loading && madeToOrderProducts.length === 0 && !error && (
              <div className="catalog-empty" role="status">
                <span aria-hidden="true">🧶</span>
                <h3>Estamos preparando nuevos tejidos.</h3>
                <p>Muy pronto vas a encontrar la colección disponible acá.</p>
              </div>
            )}
          </div>
        </section>

        <AboutSection />
        <MeaningSection />

        <section className="section size-section" id="talles">
          <div className="container size-grid">
            <div className="size-copy">
              <span className="section-number" aria-hidden="true">04</span>
              <span className="eyebrow">Guía de talles</span>
              <h2>Una referencia simple antes de elegir.</h2>
              <p>
                Medí una prenda que actualmente le quede cómoda al niño o niña
                y comparala con nuestra tabla.
              </p>
              <div className="size-table-wrap">
                <table>
                  <thead><tr><th>Talle</th><th>Largo B</th><th>Ancho A</th></tr></thead>
                  <tbody>
                    <tr><td>1</td><td>30 cm</td><td>27 cm</td></tr>
                    <tr><td>2</td><td>35 cm</td><td>30 cm</td></tr>
                    <tr><td>3</td><td>42 cm</td><td>35 cm</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="fine-print">
                Las medidas pueden presentar pequeñas variaciones porque cada
                prenda está realizada a mano.
              </p>
            </div>
            <div className="size-image-card">
              <img src="/assets/guia-talles.webp" alt="Tabla de medidas de los chalecos" loading="lazy" />
            </div>
          </div>
        </section>

        <section className="process-section" id="como-comprar">
          <div className="container process-inner">
            <div className="process-heading">
              <span className="section-number" aria-hidden="true">05</span>
              <span className="eyebrow">Cómo comprar</span>
              <h2>Del color que imaginás a una prenda terminada.</h2>
            </div>
            <div className="steps-grid">
              <article><span>01</span><h3>Personalizá</h3><p>Elegí producto, talle, colores, cantidad y detalles.</p></article>
              <article><span>02</span><h3>Señá</h3><p>Aboná el 50% por transferencia y enviá el comprobante.</p></article>
              <article><span>03</span><h3>Esperá el tejido</h3><p>La elaboración demora aproximadamente entre 7 y 10 días.</p></article>
              <article><span>04</span><h3>Recibilo</h3><p>Retirá en Tres Arroyos o coordiná el envío a cualquier punto del país.</p></article>
            </div>
          </div>
        </section>

        <section className="instagram-section">
          <div className="container instagram-inner">
            <div>
              <span className="eyebrow">El día a día del taller</span>
              <h2>Más tejidos, colores y procesos en Instagram.</h2>
            </div>
            <a className="button button-light" href={store.instagramUrl} target="_blank" rel="noreferrer">
              Visitar {store.instagramHandle}
            </a>
          </div>
        </section>
      </main>

      <Footer />

      <a
        className="floating-whatsapp"
        href={`https://wa.me/${store.whatsappInternational}?text=${encodeURIComponent("Hola, quería hacer una consulta sobre los tejidos de Trama Nido.")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Consultar por WhatsApp"
      >
        <span>WhatsApp</span>
      </a>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenSizeGuide={() => setSizeGuideOpen(true)}
        />
      )}
      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
      <CartDrawer onCheckout={openCheckout} />
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </>
  );
}
