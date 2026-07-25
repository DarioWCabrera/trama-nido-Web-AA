import { useEffect, useRef, useState } from "react";
import {
  deleteProductImage,
  fetchProductImages,
  setCoverImage,
  uploadProductImages,
} from "../services/adminService";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ImageManager({ product }) {
  const inputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadImages = async () => {
    setLoading(true);
    setError("");

    try {
      const rows = await fetchProductImages(product.id);
      setImages(rows);
    } catch (loadError) {
      setError(loadError?.message || "No pudimos cargar las imágenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [product.id]);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError("");
    setMessage("");

    if (!files.length) return;

    const invalidType = files.find((file) => !ACCEPTED_TYPES.includes(file.type));
    if (invalidType) {
      setError("Usá imágenes JPG, PNG o WebP.");
      return;
    }

    const oversized = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setError(`La imagen ${oversized.name} supera el límite de 5 MB.`);
      return;
    }

    setWorking(true);
    try {
      await uploadProductImages(product.id, files, product.name);
      setMessage(
        files.length === 1
          ? "Imagen cargada correctamente."
          : `${files.length} imágenes cargadas correctamente.`,
      );
      await loadImages();
    } catch (uploadError) {
      setError(uploadError?.message || "No pudimos subir las imágenes.");
    } finally {
      setWorking(false);
    }
  };

  const handleCover = async (image) => {
    if (image.is_cover || working) return;
    setWorking(true);
    setError("");
    setMessage("");

    try {
      await setCoverImage(product.id, image.id);
      setMessage("La portada del producto fue actualizada.");
      await loadImages();
    } catch (coverError) {
      setError(coverError?.message || "No pudimos cambiar la portada.");
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = async (image) => {
    const confirmed = window.confirm(
      "¿Eliminar esta fotografía definitivamente?",
    );
    if (!confirmed) return;

    setWorking(true);
    setError("");
    setMessage("");

    try {
      await deleteProductImage(image);
      setMessage("Imagen eliminada.");
      await loadImages();
    } catch (deleteError) {
      setError(deleteError?.message || "No pudimos eliminar la imagen.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="admin-editor-section">
      <div className="admin-editor-section-heading">
        <div>
          <span className="admin-section-kicker">Galería</span>
          <h3>Fotografías del producto</h3>
          <p>La imagen marcada como portada será la primera que verá el cliente.</p>
        </div>
        <button
          className="admin-secondary-button"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={working}
        >
          {working ? "Procesando…" : "Subir fotografías"}
        </button>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
        />
      </div>

      {error && <p className="admin-message is-error">{error}</p>}
      {message && <p className="admin-message is-success">{message}</p>}

      {loading ? (
        <p className="admin-muted">Cargando fotografías…</p>
      ) : images.length ? (
        <div className="admin-images-grid">
          {images.map((image) => (
            <article className={`admin-image-card ${image.is_cover ? "is-cover" : ""}`} key={image.id}>
              <div className="admin-image-preview">
                <img src={image.publicUrl} alt={image.alt_text || product.name} />
                {image.is_cover && <span>Portada</span>}
              </div>
              <div className="admin-image-actions">
                <button
                  type="button"
                  onClick={() => handleCover(image)}
                  disabled={working || image.is_cover}
                >
                  {image.is_cover ? "Portada actual" : "Usar de portada"}
                </button>
                <button
                  className="is-danger"
                  type="button"
                  onClick={() => handleDelete(image)}
                  disabled={working}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty-inline">
          <strong>Todavía no hay fotografías en Supabase.</strong>
          <p>Mientras tanto, la tienda seguirá mostrando las imágenes locales de respaldo.</p>
        </div>
      )}
    </section>
  );
}
