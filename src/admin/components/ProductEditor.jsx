import { useEffect, useMemo, useState } from "react";
import ImageManager from "./ImageManager";
import {
  createCategory,
  createProduct,
  fetchProductSizes,
  replaceProductSizes,
  slugify,
  updateProduct,
} from "../services/adminService";

const EMPTY_PRODUCT = {
  category_id: "",
  name: "",
  slug: "",
  short_description: "",
  description: "",
  price: 0,
  deposit_percentage: 50,
  made_to_order: true,
  stock_quantity: 0,
  lead_time_min_days: 7,
  lead_time_max_days: 10,
  allows_size: false,
  allows_primary_color: true,
  allows_secondary_color: false,
  featured: false,
  published: true,
  sort_order: 0,
};

const EMPTY_SIZE = {
  label: "",
  length_cm: "",
  width_cm: "",
  active: true,
};

function mapProductToForm(product) {
  if (!product) return EMPTY_PRODUCT;

  return {
    category_id: product.category_id ?? "",
    name: product.name ?? "",
    slug: product.slug ?? "",
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    price: product.price ?? 0,
    deposit_percentage: product.deposit_percentage ?? 50,
    made_to_order: product.made_to_order ?? true,
    stock_quantity: product.stock_quantity ?? 0,
    lead_time_min_days: product.lead_time_min_days ?? 7,
    lead_time_max_days: product.lead_time_max_days ?? 10,
    allows_size: product.allows_size ?? false,
    allows_primary_color: product.allows_primary_color ?? true,
    allows_secondary_color: product.allows_secondary_color ?? false,
    featured: product.featured ?? false,
    published: product.published ?? true,
    sort_order: product.sort_order ?? 0,
  };
}

export default function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
  onCategoryCreated,
}) {
  const isEditing = Boolean(product?.id);
  const [values, setValues] = useState(() => mapProductToForm(product));
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [sizes, setSizes] = useState([]);
  const [loadingSizes, setLoadingSizes] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    setAvailableCategories(categories);
  }, [categories]);

  const selectedCategoryName = useMemo(
    () => availableCategories.find((category) => category.id === values.category_id)?.name,
    [availableCategories, values.category_id],
  );

  useEffect(() => {
    if (!isEditing) return;

    fetchProductSizes(product.id)
      .then((rows) => {
        setSizes(
          rows.map((size) => ({
            id: size.id,
            label: size.label,
            length_cm: size.length_cm ?? "",
            width_cm: size.width_cm ?? "",
            active: size.active,
          })),
        );
      })
      .catch((sizeError) => {
        setError(sizeError?.message || "No pudimos cargar los talles.");
      })
      .finally(() => setLoadingSizes(false));
  }, [isEditing, product?.id]);

  const setField = (field, value) => {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (field === "name" && !slugTouched) {
        next.slug = slugify(value);
      }

      return next;
    });
  };

  const setAvailabilityType = (type) => {
    setValues((current) => {
      if (type === "stock") {
        return {
          ...current,
          made_to_order: false,
          stock_quantity: Math.max(1, Number(current.stock_quantity || 0)),
          lead_time_min_days: 0,
          lead_time_max_days: 0,
        };
      }

      return {
        ...current,
        made_to_order: true,
        stock_quantity: 0,
        lead_time_min_days: Number(current.lead_time_min_days || 7) || 7,
        lead_time_max_days: Number(current.lead_time_max_days || 10) || 10,
      };
    });
  };

  const updateSize = (index, field, value) => {
    setSizes((current) =>
      current.map((size, sizeIndex) =>
        sizeIndex === index ? { ...size, [field]: value } : size,
      ),
    );
  };

  const removeSize = (index) => {
    setSizes((current) => current.filter((_, sizeIndex) => sizeIndex !== index));
  };

  const handleCreateCategory = async () => {
    setCategoryError("");
    if (!newCategoryName.trim()) {
      setCategoryError("Escribí el nombre de la nueva categoría.");
      return;
    }

    setCreatingCategory(true);
    try {
      const nextOrder = availableCategories.length
        ? Math.max(...availableCategories.map((category) => Number(category.sort_order || 0))) + 1
        : 1;
      const createdCategory = await createCategory(newCategoryName, nextOrder);
      setAvailableCategories((current) => [...current, createdCategory]);
      setField("category_id", createdCategory.id);
      setNewCategoryName("");
      setShowCategoryCreator(false);
      onCategoryCreated?.(createdCategory);
    } catch (createError) {
      setCategoryError(
        createError?.code === "23505"
          ? "Ya existe una categoría con ese nombre."
          : createError?.message || "No pudimos crear la categoría.",
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!values.name.trim()) {
      setError("Ingresá el nombre del producto.");
      return;
    }

    if (!values.slug.trim()) {
      setError("El identificador URL no puede quedar vacío.");
      return;
    }

    if (!values.category_id) {
      setError("Elegí una categoría.");
      return;
    }

    if (Number(values.price) <= 0) {
      setError("El precio debe ser mayor que cero.");
      return;
    }

    setSaving(true);

    try {
      const savedProduct = isEditing
        ? await updateProduct(product.id, values)
        : await createProduct(values);

      if (values.allows_size) {
        await replaceProductSizes(savedProduct.id, sizes);
      } else if (isEditing) {
        await replaceProductSizes(savedProduct.id, []);
      }

      onSaved(savedProduct);
    } catch (saveError) {
      const duplicateSlug = saveError?.code === "23505";
      setError(
        duplicateSlug
          ? "Ya existe otro producto con ese identificador URL. Cambialo y volvé a guardar."
          : saveError?.message || "No pudimos guardar el producto.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-editor-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-editor-title">
      <div className="admin-editor-panel">
        <header className="admin-editor-header">
          <div>
            <span className="admin-section-kicker">{isEditing ? "Editar producto" : "Nuevo producto"}</span>
            <h2 id="admin-editor-title">{isEditing ? product.name : "Agregar al catálogo"}</h2>
          </div>
          <button className="admin-icon-button" type="button" onClick={onClose} aria-label="Cerrar editor">×</button>
        </header>

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <section className="admin-editor-section">
            <div className="admin-editor-section-heading">
              <div>
                <span className="admin-section-kicker">Información</span>
                <h3>Datos principales</h3>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field admin-field-wide">
                <span>Nombre del producto</span>
                <input
                  value={values.name}
                  onChange={(event) => setField("name", event.target.value)}
                  required
                  placeholder="Ej.: Chaleco verde · Talle 2"
                />
              </label>

              <div className="admin-field">
                <span>Categoría</span>
                <div className="admin-category-selector">
                  <select
                    value={values.category_id}
                    onChange={(event) => setField("category_id", event.target.value)}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {availableCategories.filter((category) => category.active).map((category) => (
                      <option value={category.id} key={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <button
                    className="admin-category-add-button"
                    type="button"
                    onClick={() => {
                      setShowCategoryCreator((current) => !current);
                      setCategoryError("");
                    }}
                  >
                    + Nueva
                  </button>
                </div>
                {showCategoryCreator && (
                  <div className="admin-inline-category-form">
                    <input
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      placeholder="Ej.: Sweaters"
                      autoFocus
                    />
                    <button
                      className="admin-secondary-button admin-small-button"
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory}
                    >
                      {creatingCategory ? "Creando…" : "Crear"}
                    </button>
                    {categoryError && <small className="admin-inline-error">{categoryError}</small>}
                  </div>
                )}
              </div>

              <label className="admin-field">
                <span>Orden en la tienda</span>
                <input
                  type="number"
                  value={values.sort_order}
                  onChange={(event) => setField("sort_order", event.target.value)}
                />
              </label>

              <label className="admin-field admin-field-wide">
                <span>Identificador URL</span>
                <input
                  value={values.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setField("slug", slugify(event.target.value));
                  }}
                  required
                  placeholder="chaleco-verde-talle-2"
                />
                <small>Se genera automáticamente, pero podés modificarlo antes de guardar.</small>
              </label>

              <label className="admin-field admin-field-wide">
                <span>Descripción breve</span>
                <input
                  value={values.short_description}
                  onChange={(event) => setField("short_description", event.target.value)}
                  placeholder="Texto que se muestra en la tarjeta del catálogo"
                />
              </label>

              <label className="admin-field admin-field-wide">
                <span>Descripción completa</span>
                <textarea
                  rows="5"
                  value={values.description}
                  onChange={(event) => setField("description", event.target.value)}
                  placeholder="Contá cómo es la prenda, sus materiales y posibilidades de personalización."
                />
              </label>
            </div>
          </section>

          <section className="admin-editor-section">
            <div className="admin-editor-section-heading">
              <div>
                <span className="admin-section-kicker">Venta</span>
                <h3>Precio y disponibilidad</h3>
              </div>
            </div>

            <div className="admin-availability-grid">
              <label className={values.made_to_order ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="availability"
                  checked={values.made_to_order}
                  onChange={() => setAvailabilityType("order")}
                />
                <span>
                  <strong>Se realiza a pedido</strong>
                  <small>El cliente elige sus opciones y ve la demora de elaboración.</small>
                </span>
              </label>
              <label className={!values.made_to_order ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="availability"
                  checked={!values.made_to_order}
                  onChange={() => setAvailabilityType("stock")}
                />
                <span>
                  <strong>En stock · entrega inmediata</strong>
                  <small>Aparecerá en la sección especial de productos ya terminados.</small>
                </span>
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-three admin-sale-grid">
              <label className="admin-field">
                <span>Precio final</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={values.price}
                  onChange={(event) => setField("price", event.target.value)}
                  required
                />
              </label>

              <label className="admin-field">
                <span>Seña o pago inicial (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={values.deposit_percentage}
                  onChange={(event) => setField("deposit_percentage", event.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Vista previa</span>
                <div className="admin-readonly-field">
                  {selectedCategoryName || "Sin categoría"} · ${Number(values.price || 0).toLocaleString("es-AR")}
                </div>
              </label>

              {values.made_to_order ? (
                <>
                  <label className="admin-field">
                    <span>Demora mínima (días)</span>
                    <input
                      type="number"
                      min="0"
                      value={values.lead_time_min_days}
                      onChange={(event) => setField("lead_time_min_days", event.target.value)}
                    />
                  </label>

                  <label className="admin-field">
                    <span>Demora máxima (días)</span>
                    <input
                      type="number"
                      min="0"
                      value={values.lead_time_max_days}
                      onChange={(event) => setField("lead_time_max_days", event.target.value)}
                    />
                  </label>
                </>
              ) : (
                <label className="admin-field admin-stock-field">
                  <span>Unidades disponibles</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={values.stock_quantity}
                    onChange={(event) => setField("stock_quantity", event.target.value)}
                  />
                  <small>Cuando llegue a 0, dejará de mostrarse en la tienda pública.</small>
                </label>
              )}
            </div>

            <div className="admin-check-grid">
              <label><input type="checkbox" checked={values.featured} onChange={(event) => setField("featured", event.target.checked)} /><span>Producto destacado</span></label>
              <label><input type="checkbox" checked={values.published} onChange={(event) => setField("published", event.target.checked)} /><span>Visible en la tienda</span></label>
            </div>
          </section>

          <section className="admin-editor-section">
            <div className="admin-editor-section-heading">
              <div>
                <span className="admin-section-kicker">Opciones</span>
                <h3>{values.made_to_order ? "Personalización del pedido" : "Datos de la prenda disponible"}</h3>
                <p>
                  {values.made_to_order
                    ? "Activá solamente las opciones que podrá elegir el cliente."
                    : "Para una prenda ya terminada, podés cargar un único talle y desactivar los colores si ya son fijos."}
                </p>
              </div>
            </div>

            <div className="admin-check-grid">
              <label><input type="checkbox" checked={values.allows_size} onChange={(event) => setField("allows_size", event.target.checked)} /><span>Elegir talle</span></label>
              <label><input type="checkbox" checked={values.allows_primary_color} onChange={(event) => setField("allows_primary_color", event.target.checked)} /><span>Elegir color principal</span></label>
              <label><input type="checkbox" checked={values.allows_secondary_color} onChange={(event) => setField("allows_secondary_color", event.target.checked)} /><span>Elegir segundo color</span></label>
            </div>

            {values.allows_size && (
              <div className="admin-sizes-editor">
                <div className="admin-sizes-heading">
                  <div>
                    <strong>Talles disponibles</strong>
                    <p>Las medidas son opcionales y se muestran en centímetros.</p>
                  </div>
                  <button
                    className="admin-secondary-button admin-small-button"
                    type="button"
                    onClick={() => setSizes((current) => [...current, { ...EMPTY_SIZE }])}
                  >
                    Agregar talle
                  </button>
                </div>

                {loadingSizes ? (
                  <p className="admin-muted">Cargando talles…</p>
                ) : sizes.length ? (
                  <div className="admin-size-rows">
                    {sizes.map((size, index) => (
                      <div className="admin-size-row" key={size.id ?? `new-${index}`}>
                        <label>
                          <span>Nombre</span>
                          <input value={size.label} onChange={(event) => updateSize(index, "label", event.target.value)} placeholder="Talle 1" />
                        </label>
                        <label>
                          <span>Largo</span>
                          <input type="number" step="0.1" min="0" value={size.length_cm} onChange={(event) => updateSize(index, "length_cm", event.target.value)} placeholder="30" />
                        </label>
                        <label>
                          <span>Ancho</span>
                          <input type="number" step="0.1" min="0" value={size.width_cm} onChange={(event) => updateSize(index, "width_cm", event.target.value)} placeholder="27" />
                        </label>
                        <button type="button" onClick={() => removeSize(index)} aria-label={`Eliminar ${size.label || "talle"}`}>×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty-inline"><p>No hay talles cargados. Agregá el primero.</p></div>
                )}
              </div>
            )}
          </section>

          {isEditing ? (
            <ImageManager product={product} />
          ) : (
            <section className="admin-editor-section">
              <div className="admin-empty-inline">
                <strong>Primero guardá el producto.</strong>
                <p>Después podrás abrirlo nuevamente y cargar fotografías desde el celular o la computadora.</p>
              </div>
            </section>
          )}

          {error && <p className="admin-message is-error admin-editor-message">{error}</p>}

          <footer className="admin-editor-footer">
            <button className="admin-secondary-button" type="button" onClick={onClose} disabled={saving}>Cancelar</button>
            <button className="admin-primary-button" type="submit" disabled={saving}>
              {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear producto"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
