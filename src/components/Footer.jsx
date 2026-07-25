import { store } from "../data/store";

export default function Footer() {
  return (
    <footer className="site-footer" id="contacto">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/assets/logo-trama-nido.webp" alt="Logo Trama Nido" />
          <div>
            <strong>TRAMA NIDO</strong>
            <span>tejidos artesanales</span>
          </div>
        </div>
        <div>
          <h3>Contacto</h3>
          <a href={`https://wa.me/${store.whatsappInternational}`} target="_blank" rel="noreferrer">WhatsApp: {store.whatsappDisplay}</a>
          <a href={store.instagramUrl} target="_blank" rel="noreferrer">Instagram: {store.instagramHandle}</a>
        </div>
        <div>
          <h3>Información</h3>
          <span>Elaboración: {store.productionTime}</span>
          <span>Envíos a todo el país</span>
          <span>Seña del 50% para confirmar</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Trama Nido</span>
        <span>Hecho con dedicación, punto por punto.</span>
      </div>
    </footer>
  );
}
