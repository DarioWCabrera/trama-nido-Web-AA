import { formatCurrency } from "../utils/formatCurrency";

export default function StockProductCard({ product, onOpen }) {
  const unitsLabel = product.stockQuantity === 1 ? "1 unidad disponible" : `${product.stockQuantity} unidades disponibles`;

  return (
    <article className="stock-product-card">
      <button
        className="stock-product-image"
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver ${product.name}`}
      >
        <img src={product.mainImage} alt={product.name} loading="lazy" />
        <span>Entrega inmediata</span>
      </button>
      <div className="stock-product-copy">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.shortDescription}</p>
        <div className="stock-product-meta">
          <strong>{formatCurrency(product.price)}</strong>
          <small>{unitsLabel}</small>
        </div>
        <button className="product-open-button" type="button" onClick={() => onOpen(product)}>
          Ver producto <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}
