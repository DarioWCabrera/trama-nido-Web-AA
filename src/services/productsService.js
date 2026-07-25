import { fallbackProducts } from "../data/products";
import { hasSupabaseConfig, supabase } from "../lib/supabase";

const BUCKET_NAME = "product-images";
const DEFAULT_IMAGE = "/assets/logo-trama-nido.webp";

const fallbackBySlug = new Map(
  fallbackProducts.map((product) => [product.slug, product]),
);

const resolveStorageImage = (storagePath) => {
  if (!storagePath) return null;
  if (/^https?:\/\//i.test(storagePath)) return storagePath;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return data.publicUrl;
};

const buildFields = ({ product, sizes, fallback }) => {
  const fields = [];

  if (product.allows_size) {
    const options = sizes.length
      ? sizes.map((size) => size.label)
      : fallback?.fields
          ?.find((field) => field.id === "talle")
          ?.options ?? [];

    fields.push({
      id: "talle",
      label: "Talle",
      type: "select",
      required: true,
      options,
    });
  } else if (product.slug === "cuellito-tejido-soft-polar") {
    fields.push({
      id: "edadOMedida",
      label: "Edad o medida aproximada",
      type: "text",
      required: true,
      placeholder: "Ej.: 3 años",
    });
  }

  if (product.allows_primary_color) {
    fields.push({
      id: "colorPrincipal",
      label:
        product.slug === "cuellito-tejido-soft-polar"
          ? "Color exterior"
          : "Color principal",
      type: "text",
      required: true,
      placeholder: "Ej.: beige",
    });
  }

  if (product.allows_secondary_color) {
    fields.push({
      id: "colorSecundario",
      label: "Segundo color (opcional)",
      type: "text",
      required: false,
      placeholder: "Ej.: verde",
    });
  }

  return fields;
};

const buildProductionTime = (minimum, maximum) => {
  if (minimum === maximum) {
    return `${minimum} días desde la acreditación de la seña`;
  }

  return `${minimum} a ${maximum} días desde la acreditación de la seña`;
};

const mapProduct = ({
  product,
  categoriesById,
  sizesByProduct,
  imagesByProduct,
}) => {
  const fallback = fallbackBySlug.get(product.slug);
  const sizes = (sizesByProduct.get(product.id) ?? []).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const storedImages = (imagesByProduct.get(product.id) ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      ...image,
      url: resolveStorageImage(image.storage_path),
    }))
    .filter((image) => image.url);

  const coverImage = storedImages.find((image) => image.is_cover)?.url;
  const isImmediateDelivery = !product.made_to_order;
  const stockQuantity = Math.max(0, Number(product.stock_quantity || 0));
  const images = storedImages.length
    ? storedImages.map((image) => image.url)
    : fallback?.images ?? [DEFAULT_IMAGE];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category:
      categoriesById.get(product.category_id)?.name ?? "Tejidos",
    price: Number(product.price),
    depositRate: Number(product.deposit_percentage ?? 50) / 100,
    badge: product.made_to_order
      ? "Hecho a pedido"
      : stockQuantity > 0
        ? "Entrega inmediata"
        : "Sin stock",
    shortDescription: product.short_description ?? "",
    description: product.description ?? product.short_description ?? "",
    productionTime: product.made_to_order
      ? buildProductionTime(
          product.lead_time_min_days,
          product.lead_time_max_days,
        )
      : "Entrega o envío a coordinar",
    isImmediateDelivery,
    stockQuantity,
    mainImage: coverImage ?? images[0] ?? DEFAULT_IMAGE,
    images,
    fields: buildFields({ product, sizes, fallback }),
    hasSizeGuide: product.allows_size && sizes.length > 0,
    sizes,
    featured: product.featured,
    sortOrder: product.sort_order,
  };
};

const groupByProductId = (rows) => {
  const grouped = new Map();

  rows.forEach((row) => {
    const current = grouped.get(row.product_id) ?? [];
    current.push(row);
    grouped.set(row.product_id, current);
  });

  return grouped;
};

export async function fetchPublishedProducts() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error(
      "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select(
      `
        id,
        category_id,
        name,
        slug,
        short_description,
        description,
        price,
        deposit_percentage,
        made_to_order,
        stock_quantity,
        lead_time_min_days,
        lead_time_max_days,
        allows_size,
        allows_primary_color,
        allows_secondary_color,
        featured,
        sort_order,
        created_at
      `,
    )
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (productsError) throw productsError;
  if (!productRows?.length) return [];

  const productIds = productRows.map((product) => product.id);

  const [categoriesResult, sizesResult, imagesResult] = await Promise.all([
    supabase.from("categories").select("id, name, slug").eq("active", true),
    supabase
      .from("product_sizes")
      .select("id, product_id, label, length_cm, width_cm, sort_order")
      .in("product_id", productIds)
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_images")
      .select(
        "id, product_id, storage_path, alt_text, is_cover, sort_order",
      )
      .in("product_id", productIds)
      .order("sort_order", { ascending: true }),
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (sizesResult.error) throw sizesResult.error;
  if (imagesResult.error) throw imagesResult.error;

  const categoriesById = new Map(
    (categoriesResult.data ?? []).map((category) => [category.id, category]),
  );
  const sizesByProduct = groupByProductId(sizesResult.data ?? []);
  const imagesByProduct = groupByProductId(imagesResult.data ?? []);

  return productRows
    .map((product) =>
      mapProduct({
        product,
        categoriesById,
        sizesByProduct,
        imagesByProduct,
      }),
    )
    .filter((product) => !product.isImmediateDelivery || product.stockQuantity > 0);
}
