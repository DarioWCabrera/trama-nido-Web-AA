import { useEffect } from "react";

export default function SizeGuideModal({ onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop elevated" role="presentation" onMouseDown={onClose}>
      <section
        className="modal size-guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">×</button>
        <div>
          <span className="eyebrow">Elegí con tranquilidad</span>
          <h2 id="size-guide-title">Guía de talles</h2>
          <p>Compará estas medidas con una prenda que actualmente le quede cómoda al niño o niña.</p>
        </div>
        <img src="/assets/guia-talles.webp" alt="Guía de talles de chalecos Trama Nido" />
        <table>
          <thead>
            <tr><th>Talle</th><th>Largo B</th><th>Ancho A</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>30 cm</td><td>27 cm</td></tr>
            <tr><td>2</td><td>35 cm</td><td>30 cm</td></tr>
            <tr><td>3</td><td>42 cm</td><td>35 cm</td></tr>
          </tbody>
        </table>
        <p className="fine-print">Al ser productos realizados a mano, las medidas pueden presentar pequeñas variaciones.</p>
      </section>
    </div>
  );
}
