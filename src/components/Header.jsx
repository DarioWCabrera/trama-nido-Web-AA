import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totals, setIsCartOpen } = useCart();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="announcement-bar">
        Tejidos a pedido y prendas listas para entrega inmediata
      </div>
      <div className="container header-inner">
        <a className="brand" href="#inicio" aria-label="Ir al inicio">
          <img src="/assets/logo-trama-nido.webp" alt="Logo de Trama Nido" />
          <span className="brand-copy">
            <strong>TRAMA NIDO</strong>
            <small>tejidos artesanales</small>
          </span>
        </a>

        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
          <a href="#stock" onClick={closeMenu}>Entrega inmediata</a>
          <a href="#productos" onClick={closeMenu}>A pedido</a>
          <a href="#sobre-mi" onClick={closeMenu}>Sobre mí</a>
          <a href="#historia" onClick={closeMenu}>El nombre</a>
          <a href="#talles" onClick={closeMenu}>Talles</a>
          <a href="#como-comprar" onClick={closeMenu}>Cómo comprar</a>
        </nav>

        <div className="header-actions">
          <button
            className="menu-button"
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <button
            className="cart-button"
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Abrir carrito con ${totals.count} productos`}
          >
            <span aria-hidden="true">Bolsa</span>
            <strong>{totals.count}</strong>
          </button>
        </div>
      </div>
    </header>
  );
}
