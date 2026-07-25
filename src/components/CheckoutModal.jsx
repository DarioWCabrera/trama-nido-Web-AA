import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { store } from "../data/store";
import { formatCurrency } from "../utils/formatCurrency";
import { buildWhatsAppMessage, createOrderNumber } from "../utils/order";

const initialCustomer = {
  fullName: "",
  whatsapp: "",
  deliveryType: "retiro",
  province: "",
  locality: "",
  postalCode: "",
  address: "",
  notes: "",
};

export default function CheckoutModal({ onClose }) {
  const { items, totals, clearCart, setIsCartOpen } = useCart();
  const [customer, setCustomer] = useState(initialCustomer);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.classList.add("modal-open");
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const whatsappUrl = useMemo(() => {
    if (!order) return "";
    const message = buildWhatsAppMessage({ order, store });
    return `https://wa.me/${store.whatsappInternational}?text=${encodeURIComponent(message)}`;
  }, [order]);

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    if (!customer.fullName.trim()) return "Ingresá tu nombre y apellido.";
    if (!customer.whatsapp.trim()) return "Ingresá un número de WhatsApp.";
    if (customer.deliveryType === "envio") {
      if (!customer.province.trim()) return "Ingresá la provincia.";
      if (!customer.locality.trim()) return "Ingresá la localidad.";
      if (!customer.postalCode.trim()) return "Ingresá el código postal.";
      if (!customer.address.trim()) return "Ingresá la dirección de entrega.";
    }
    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const createdOrder = {
      number: createOrderNumber(),
      createdAt: new Date().toISOString(),
      customer,
      items,
      total: totals.total,
      deposit: totals.deposit,
      balance: totals.balance,
      status: "Esperando seña",
    };

    try {
      const previousOrders = JSON.parse(localStorage.getItem("trama-nido-orders") || "[]");
      localStorage.setItem("trama-nido-orders", JSON.stringify([createdOrder, ...previousOrders]));
    } catch {
      // El pedido igualmente puede continuar por WhatsApp aunque localStorage no esté disponible.
    }

    setError("");
    setOrder(createdOrder);
  };

  const copyAlias = async () => {
    try {
      await navigator.clipboard.writeText(store.alias);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const finishOrder = () => {
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <div className="modal-backdrop elevated" role="presentation" onMouseDown={onClose}>
      <section
        className="modal checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>

        {!order ? (
          <>
            <div className="checkout-heading">
              <span className="eyebrow">Último paso</span>
              <h2 id="checkout-title">Datos para el pedido</h2>
              <p>Al confirmar, te mostraremos el alias para abonar el pago inicial indicado.</p>
            </div>

            <div className="checkout-layout">
              <form className="checkout-form" onSubmit={handleSubmit}>
                <div className="field-grid">
                  <label className="field-full">
                    <span>Nombre y apellido *</span>
                    <input value={customer.fullName} onChange={(event) => updateCustomer("fullName", event.target.value)} />
                  </label>
                  <label className="field-full">
                    <span>WhatsApp *</span>
                    <input inputMode="tel" placeholder="Ej.: 2983 123456" value={customer.whatsapp} onChange={(event) => updateCustomer("whatsapp", event.target.value)} />
                  </label>
                </div>

                <fieldset className="delivery-options">
                  <legend>Forma de entrega</legend>
                  <label>
                    <input type="radio" name="delivery" checked={customer.deliveryType === "retiro"} onChange={() => updateCustomer("deliveryType", "retiro")} />
                    <span><strong>Retiro a coordinar</strong><small>En Tres Arroyos</small></span>
                  </label>
                  <label>
                    <input type="radio" name="delivery" checked={customer.deliveryType === "envio"} onChange={() => updateCustomer("deliveryType", "envio")} />
                    <span><strong>Envío a domicilio</strong><small>A cargo del comprador</small></span>
                  </label>
                </fieldset>

                {customer.deliveryType === "envio" && (
                  <div className="field-grid">
                    <label><span>Provincia *</span><input value={customer.province} onChange={(event) => updateCustomer("province", event.target.value)} /></label>
                    <label><span>Localidad *</span><input value={customer.locality} onChange={(event) => updateCustomer("locality", event.target.value)} /></label>
                    <label><span>Código postal *</span><input value={customer.postalCode} onChange={(event) => updateCustomer("postalCode", event.target.value)} /></label>
                    <label><span>Dirección *</span><input value={customer.address} onChange={(event) => updateCustomer("address", event.target.value)} /></label>
                  </div>
                )}

                <label>
                  <span>Observaciones generales</span>
                  <textarea rows="3" value={customer.notes} onChange={(event) => updateCustomer("notes", event.target.value)} placeholder="Detalles de entrega o del pedido" />
                </label>

                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="button button-primary button-wide" type="submit">Confirmar pedido</button>
              </form>

              <aside className="checkout-summary">
                <h3>Resumen</h3>
                {items.map((item) => (
                  <div className="checkout-line" key={item.key}>
                    <span>{item.quantity} × {item.name}</span>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))}
                <hr />
                <div className="checkout-line total"><span>Total</span><strong>{formatCurrency(totals.total)}</strong></div>
                <div className="checkout-line deposit"><span>{totals.depositPercentage ? `Seña del ${totals.depositPercentage}%` : "Seña requerida"}</span><strong>{formatCurrency(totals.deposit)}</strong></div>
                <div className="checkout-line"><span>Saldo pendiente</span><strong>{formatCurrency(totals.balance)}</strong></div>
              </aside>
            </div>
          </>
        ) : (
          <div className="order-success">
            <div className="success-icon" aria-hidden="true">✓</div>
            <span className="eyebrow">Pedido registrado</span>
            <h2 id="checkout-title">¡Gracias, {order.customer.fullName.split(" ")[0]}!</h2>
            <p>Tu número de pedido es <strong>{order.number}</strong>.</p>

            <div className="payment-card">
              <span>Transferí la seña de</span>
              <strong className="payment-amount">{formatCurrency(order.deposit)}</strong>
              <div className="payment-data">
                <div><small>Alias</small><strong>{store.alias}</strong></div>
                <div><small>Titular</small><strong>{store.accountHolder}</strong></div>
              </div>
              <button className="button button-secondary button-wide" type="button" onClick={copyAlias}>
                {copied ? "Alias copiado" : "Copiar alias"}
              </button>
            </div>

            <p className="receipt-note">
              Después de transferir, abrí WhatsApp y adjuntá manualmente el comprobante para reservar la prenda o comenzar la elaboración.
            </p>
            <a className="button button-whatsapp button-wide" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={finishOrder}>
              Enviar comprobante por WhatsApp
            </a>
            <button className="text-button" type="button" onClick={() => { finishOrder(); onClose(); }}>
              Cerrar y volver a la tienda
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
