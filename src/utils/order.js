import { formatCurrency } from "./formatCurrency";

export const createOrderNumber = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `TN-${datePart}-${randomPart}`;
};

export const buildWhatsAppMessage = ({ order, store }) => {
  const productLines = order.items
    .map((item) => {
      const options = Object.entries(item.options)
        .filter(([, value]) => value)
        .map(([key, value]) => {
          const labels = {
            talle: "Talle",
            colorPrincipal: "Color principal",
            colorSecundario: "Segundo color",
            edadOMedida: "Edad o medida",
            observaciones: "Observaciones",
          };
          return `${labels[key] || key}: ${value}`;
        })
        .join("\n");

      return `${item.name}\n${options}\nCantidad: ${item.quantity}\nSubtotal: ${formatCurrency(
        item.price * item.quantity,
      )}`;
    })
    .join("\n\n");

  const shipping =
    order.customer.deliveryType === "envio"
      ? `Envío a: ${order.customer.address}, ${order.customer.locality}, ${order.customer.province} (${order.customer.postalCode})`
      : "Entrega: retiro a coordinar en Tres Arroyos";

  return [
    "Hola, realicé un pedido en la tienda online de Trama Nido.",
    "",
    `Pedido: ${order.number}`,
    `Nombre: ${order.customer.fullName}`,
    "",
    productLines,
    "",
    `Total del pedido: ${formatCurrency(order.total)}`,
    `Seña abonada: ${formatCurrency(order.deposit)}`,
    `Saldo pendiente: ${formatCurrency(order.balance)}`,
    "",
    shipping,
    order.customer.notes ? `Observaciones: ${order.customer.notes}` : "",
    "",
    `Transferí la seña al alias ${store.alias}. Adjunto el comprobante.`,
  ]
    .filter(Boolean)
    .join("\n");
};
