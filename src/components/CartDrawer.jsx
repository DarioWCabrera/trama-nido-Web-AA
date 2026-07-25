import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

const optionLabels = {
  talle: "Talle",
  colorPrincipal: "Color principal",
  colorSecundario: "Segundo color",
  edadOMedida: "Edad o medida",
  observaciones: "Observaciones",
};

export default function CartDrawer({ onCheckout }) {
  const {
    items,
    totals,
    isCartOpen,
    setIsCartOpen,
    changeQuantity,
    removeItem,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={() => setIsCartOpen(false)}>
      <aside
        className="cart-drawer"
        aria-label="Carrito de compras"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <span className="eyebrow">Tu selección</span>
            <h2>Carrito</h2>
          </div>
          <button type="button" className="modal-close static" onClick={() => setIsCartOpen(false)} aria-label="Cerrar">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <span aria-hidden="true">🧶</span>
            <h3>Tu carrito está vacío</h3>
            <p>Elegí una prenda y personalizala con los colores que más te gusten.</p>
            <button className="button button-primary" type="button" onClick={() => setIsCartOpen(false)}>
              Ver productos
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.key}>
                  <img src={item.image} alt="" />
                  <div className="cart-item-copy">
                    <div className="cart-item-title-row">
                      <h3>{item.name}</h3>
                      <button type="button" className="remove-button" onClick={() => removeItem(item.key)} aria-label={`Eliminar ${item.name}`}>
                        Eliminar
                      </button>
                    </div>
                    <div className="cart-options">
                      {Object.entries(item.options)
                        .filter(([, value]) => value)
                        .map(([key, value]) => (
                          <span key={key}><strong>{optionLabels[key] || key}:</strong> {value}</span>
                        ))}
                    </div>
                    {item.immediateDelivery && item.maxQuantity != null && (
                      <small className="cart-stock-note">
                        Entrega inmediata · stock disponible: {item.maxQuantity}
                      </small>
                    )}
                    <div className="cart-item-bottom">
                      <div className="quantity-control compact">
                        <button type="button" onClick={() => changeQuantity(item.key, item.quantity - 1)}>−</button>
                        <strong>{item.quantity}</strong>
                        <button
                          type="button"
                          disabled={item.maxQuantity != null && item.quantity >= item.maxQuantity}
                          onClick={() => changeQuantity(item.key, item.quantity + 1)}
                        >+</button>
                      </div>
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <div><span>Total del pedido</span><strong>{formatCurrency(totals.total)}</strong></div>
              <div className="highlight"><span>{totals.depositPercentage ? `Seña para confirmar (${totals.depositPercentage}%)` : "Seña para confirmar"}</span><strong>{formatCurrency(totals.deposit)}</strong></div>
              <div><span>Saldo pendiente</span><strong>{formatCurrency(totals.balance)}</strong></div>
              <p>El costo del envío se coordina según el destino y está a cargo del comprador.</p>
              <button className="button button-primary button-wide" type="button" onClick={onCheckout}>
                Finalizar pedido
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
