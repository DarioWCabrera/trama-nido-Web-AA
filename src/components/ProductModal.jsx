import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

const buildInitialOptions = (product) =>
  product.fields.reduce((accumulator, field) => {
    accumulator[field.id] = "";
    return accumulator;
  }, { observaciones: "" });

export default function ProductModal({ product, onClose, onOpenSizeGuide }) {
  const depositRate = product.depositRate ?? 0.5;
  const depositPercentage = Math.round(depositRate * 100);
  const [activeImage, setActiveImage] = useState(product.mainImage);
  const [quantity, setQuantity] = useState(1);
  const maximumQuantity = product.isImmediateDelivery
    ? Math.max(1, Number(product.stockQuantity || 1))
    : null;
  const [options, setOptions] = useState(() => buildInitialOptions(product));
  const [error, setError] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  const requiredFields = useMemo(
    () => product.fields.filter((field) => field.required),
    [product.fields],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const missing = requiredFields.find((field) => !options[field.id]?.trim());
    if (missing) {
      setError(`Completá el campo “${missing.label}”.`);
      return;
    }
    setError("");
    addItem(product, options, quantity);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="product-modal-gallery">
          <img className="product-main-image" src={activeImage} alt={product.name} />
          <div className="product-thumbnails">
            {product.images.map((image, index) => (
              <button
                type="button"
                key={image}
                className={activeImage === image ? "is-active" : ""}
                onClick={() => setActiveImage(image)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        </div>

        <form className="product-modal-content" onSubmit={handleSubmit}>
          <span className="product-badge inline-badge">{product.badge}</span>
          <h2 id="product-modal-title">{product.name}</h2>
          <strong className="modal-price">{formatCurrency(product.price)}</strong>
          <p>{product.description}</p>
          <div className={`production-note ${product.isImmediateDelivery ? "is-stock" : ""}`}>
            {product.isImmediateDelivery ? (
              <>
                <strong>Entrega inmediata:</strong> {product.stockQuantity === 1
                  ? "queda 1 unidad disponible"
                  : `hay ${product.stockQuantity} unidades disponibles`}.
              </>
            ) : (
              <>
                <strong>Tiempo de elaboración:</strong> {product.productionTime}.
              </>
            )}
          </div>

          <div className="product-fields">
            {product.fields.map((field) => (
              <label key={field.id}>
                <span>{field.label}{field.required ? " *" : ""}</span>
                {field.type === "select" ? (
                  <select
                    value={options[field.id]}
                    onChange={(event) =>
                      setOptions((current) => ({ ...current, [field.id]: event.target.value }))
                    }
                  >
                    <option value="">Seleccionar</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={options[field.id]}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setOptions((current) => ({ ...current, [field.id]: event.target.value }))
                    }
                  />
                )}
              </label>
            ))}

            {product.hasSizeGuide && (
              <button className="text-button" type="button" onClick={onOpenSizeGuide}>
                Ver guía de talles y medidas
              </button>
            )}

            <label>
              <span>Observaciones</span>
              <textarea
                rows="3"
                value={options.observaciones}
                placeholder="Contanos cualquier detalle especial del pedido"
                onChange={(event) =>
                  setOptions((current) => ({ ...current, observaciones: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="quantity-row">
            <span>Cantidad</span>
            <div className="quantity-control">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
              <strong>{quantity}</strong>
              <button
                type="button"
                disabled={maximumQuantity != null && quantity >= maximumQuantity}
                onClick={() =>
                  setQuantity((value) =>
                    maximumQuantity == null ? value + 1 : Math.min(maximumQuantity, value + 1),
                  )
                }
              >+</button>
            </div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="button button-primary button-wide" type="submit">
            Agregar al carrito · {formatCurrency(product.price * quantity)}
          </button>
          <small className="deposit-caption">
            {product.isImmediateDelivery
              ? `Para reservar esta prenda se abona el ${depositPercentage}% indicado.`
              : `Para confirmar el encargo se abona una seña del ${depositPercentage}%.`}
          </small>
        </form>
      </section>
    </div>
  );
}
