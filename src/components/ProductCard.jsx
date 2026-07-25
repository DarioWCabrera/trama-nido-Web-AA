import { formatCurrency } from "../utils/formatCurrency";

export default function ProductCard({ product, onOpen, index }) {
  const depositRate = product.depositRate ?? 0.5;

  return (
    <article className={`product-card product-card-${index + 1}`}>
      <button
        className="product-image-button"
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver ${product.name}`}
      >
        <img src={product.mainImage} alt={product.name} loading="lazy" />
        <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="product-badge">{product.badge}</span>
      </button>

      <div className="product-card-body">
        <div className="product-heading-row">
          <div>
            <span className="product-category">{product.category}</span>
            <h3>{product.name}</h3>
          </div>
          <strong className="product-price">{formatCurrency(product.price)}</strong>
        </div>
        <p>{product.shortDescription}</p>
        <div className="product-card-bottom">
          <small>
            Seña para confirmar: {formatCurrency(product.price * depositRate)}
          </small>
          <button className="product-open-button" type="button" onClick={() => onOpen(product)}>
            Elegir opciones <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  );
}
