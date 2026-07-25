export const fallbackProducts = [
  {
    id: "chaleco-infantil",
    slug: "chaleco-tejido-artesanal-infantil",
    name: "Chaleco tejido artesanal",
    category: "Chalecos",
    price: 40000,
    depositRate: 0.5,
    badge: "Hecho a pedido",
    isImmediateDelivery: false,
    stockQuantity: 0,
    shortDescription:
      "Para recién nacidos, bebés y niños de hasta 5 años. Colores y combinaciones a elección.",
    description:
      "Chaleco tejido artesanalmente para recién nacidos, bebés y niños de hasta 5 años. Cada prenda se realiza especialmente por encargo y puede personalizarse eligiendo el color o la combinación de colores.",
    productionTime: "7 a 10 días desde la acreditación de la seña",
    mainImage: "/assets/chaleco-azul-campo.webp",
    images: [
      "/assets/chaleco-azul-campo.webp",
      "/assets/chaleco-beige-bordo.webp",
      "/assets/chaleco-beige.webp",
      "/assets/chaleco-beige-verde-campo.webp",
      "/assets/chaleco-beige-verde.webp",
      "/assets/chaleco-azul-look.webp",
      "/assets/chaleco-beige-look.webp",
      "/assets/chaleco-gris.webp",
      "/assets/chaleco-verde.webp",
      "/assets/chaleco-detalle.webp",
    ],
    fields: [
      {
        id: "talle",
        label: "Talle",
        type: "select",
        required: true,
        options: ["Talle 1", "Talle 2", "Talle 3"],
      },
      {
        id: "colorPrincipal",
        label: "Color principal",
        type: "text",
        required: true,
        placeholder: "Ej.: beige",
      },
      {
        id: "colorSecundario",
        label: "Segundo color (opcional)",
        type: "text",
        required: false,
        placeholder: "Ej.: verde",
      },
    ],
    hasSizeGuide: true,
  },
  {
    id: "cuellito-soft",
    slug: "cuellito-tejido-soft-polar",
    name: "Cuellito tejido con soft polar",
    category: "Cuellitos",
    price: 25000,
    depositRate: 0.5,
    badge: "Hecho a pedido",
    isImmediateDelivery: false,
    stockQuantity: 0,
    shortDescription:
      "Tejido artesanal con interior de soft polar para mayor abrigo y suavidad.",
    description:
      "Cuellito tejido artesanalmente con interior de soft polar, pensado para brindar mayor abrigo, comodidad y suavidad durante los días fríos. Se realiza por encargo y permite elegir el color exterior.",
    productionTime: "7 a 10 días desde la acreditación de la seña",
    mainImage: "/assets/cuellito-general.webp",
    images: [
      "/assets/cuellito-general.webp",
      "/assets/cuellito-interior.webp",
      "/assets/cuellito-detalle.webp",
    ],
    fields: [
      {
        id: "edadOMedida",
        label: "Edad o medida aproximada",
        type: "text",
        required: true,
        placeholder: "Ej.: 3 años",
      },
      {
        id: "colorPrincipal",
        label: "Color exterior",
        type: "text",
        required: true,
        placeholder: "Ej.: beige",
      },
    ],
    hasSizeGuide: false,
  },
];

// Alias temporal para no romper importaciones anteriores.
export const products = fallbackProducts;
