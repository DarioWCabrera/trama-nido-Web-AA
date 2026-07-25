import { supabase } from "../../lib/supabase";

const BUCKET_NAME = "product-images";

export function slugify(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;
  return data.session;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordResetEmail(email) {
  const cleanEmail = email.trim();
  if (!cleanEmail) throw new Error("Ingresá tu correo electrónico.");

  const redirectTo = `${window.location.origin}/admin/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo,
  });

  if (error) throw error;
}

export async function updateAdminPassword(password) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data.user;
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
}

export async function verifyAdminAccess(userId) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export function subscribeToAuthChanges(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session, event);
  });

  return () => subscription.unsubscribe();
}

export async function fetchAdminProducts() {
  const { data, error } = await supabase
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
        published,
        sort_order,
        created_at,
        updated_at,
        categories (id, name, slug)
      `,
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, active, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(name, sortOrder = 0) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Ingresá el nombre de la categoría.");

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: cleanName,
      slug: slugify(cleanName),
      active: true,
      sort_order: Math.round(Number(sortOrder || 0)),
    })
    .select("id, name, slug, active, sort_order")
    .single();

  if (error) throw error;
  return data;
}

export async function fetchProductSizes(productId) {
  if (!productId) return [];

  const { data, error } = await supabase
    .from("product_sizes")
    .select("id, product_id, label, length_cm, width_cm, active, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchProductImages(productId) {
  if (!productId) return [];

  const { data, error } = await supabase
    .from("product_images")
    .select("id, product_id, storage_path, alt_text, is_cover, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((image) => {
    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(image.storage_path);

    return {
      ...image,
      publicUrl: publicData.publicUrl,
    };
  });
}

function normalizeProductPayload(values) {
  const madeToOrder = Boolean(values.made_to_order);
  const minimumDays = madeToOrder
    ? Math.max(0, Number(values.lead_time_min_days || 0))
    : 0;
  const maximumDays = madeToOrder
    ? Math.max(minimumDays, Number(values.lead_time_max_days || minimumDays))
    : 0;

  return {
    category_id: values.category_id || null,
    name: values.name.trim(),
    slug: slugify(values.slug || values.name),
    short_description: values.short_description?.trim() || null,
    description: values.description?.trim() || null,
    price: Math.max(0, Math.round(Number(values.price || 0))),
    deposit_percentage: Math.min(
      100,
      Math.max(0, Math.round(Number(values.deposit_percentage ?? 50))),
    ),
    made_to_order: madeToOrder,
    stock_quantity: madeToOrder
      ? 0
      : Math.max(0, Math.round(Number(values.stock_quantity || 0))),
    lead_time_min_days: minimumDays,
    lead_time_max_days: maximumDays,
    allows_size: Boolean(values.allows_size),
    allows_primary_color: Boolean(values.allows_primary_color),
    allows_secondary_color: Boolean(values.allows_secondary_color),
    featured: Boolean(values.featured),
    published: Boolean(values.published),
    sort_order: Math.round(Number(values.sort_order || 0)),
  };
}

export async function createProduct(values) {
  const payload = normalizeProductPayload(values);

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(productId, values) {
  const payload = normalizeProductPayload(values);

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setProductPublished(productId, published) {
  const { error } = await supabase
    .from("products")
    .update({ published })
    .eq("id", productId);

  if (error) throw error;
}

export async function replaceProductSizes(productId, sizes) {
  const { error: deleteError } = await supabase
    .from("product_sizes")
    .delete()
    .eq("product_id", productId);

  if (deleteError) throw deleteError;

  const cleanSizes = sizes
    .filter((size) => size.label?.trim())
    .map((size, index) => ({
      product_id: productId,
      label: size.label.trim(),
      length_cm:
        size.length_cm === "" || size.length_cm == null
          ? null
          : Number(size.length_cm),
      width_cm:
        size.width_cm === "" || size.width_cm == null
          ? null
          : Number(size.width_cm),
      active: size.active !== false,
      sort_order: index + 1,
    }));

  if (!cleanSizes.length) return;

  const { error: insertError } = await supabase
    .from("product_sizes")
    .insert(cleanSizes);

  if (insertError) throw insertError;
}

function sanitizeFileName(fileName) {
  const extension = fileName.includes(".")
    ? `.${fileName.split(".").pop().toLowerCase()}`
    : "";
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const safeBase = slugify(baseName) || "imagen";
  return `${safeBase}${extension}`;
}

export async function uploadProductImages(productId, files, productName) {
  const currentImages = await fetchProductImages(productId);
  let nextSortOrder = currentImages.length + 1;
  let shouldSetCover = currentImages.length === 0;

  for (const file of files) {
    const safeFileName = sanitizeFileName(file.name);
    const uniquePart = crypto.randomUUID();
    const storagePath = `${productId}/${uniquePart}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) throw uploadError;

    const { error: rowError } = await supabase.from("product_images").insert({
      product_id: productId,
      storage_path: storagePath,
      alt_text: productName,
      is_cover: shouldSetCover,
      sort_order: nextSortOrder,
    });

    if (rowError) {
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      throw rowError;
    }

    shouldSetCover = false;
    nextSortOrder += 1;
  }
}

export async function setCoverImage(productId, imageId) {
  const { error: clearError } = await supabase
    .from("product_images")
    .update({ is_cover: false })
    .eq("product_id", productId);

  if (clearError) throw clearError;

  const { error: coverError } = await supabase
    .from("product_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  if (coverError) throw coverError;
}

export async function deleteProductImage(image) {
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([image.storage_path]);

  if (storageError) throw storageError;

  const { error: rowError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", image.id);

  if (rowError) throw rowError;
}
