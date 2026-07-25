export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="container hero-shell">
        <div className="hero-meta" aria-label="Información de la marca">
          <span>Tejidos infantiles · Hechos en Tres Arroyos</span>
          <span>Envíos a todo el país</span>
        </div>

        <div className="hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">Prendas tejidas a mano</span>
            <h1>
              Abrigo, color y una historia <em>punto por punto.</em>
            </h1>
            <p>
              Chalecos y cuellitos artesanales para recién nacidos, bebés y
              niños. Elegí el talle y los colores; Romina crea cada pieza
              especialmente para ese pedido.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#productos">
                Explorar la colección
              </a>
              <a className="hero-text-link" href="#sobre-mi">
                Conocer a Romina <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>

          <div className="hero-collage" aria-label="Prendas de Trama Nido">
            <figure className="hero-photo hero-photo-primary">
              <img
                src="/assets/chaleco-azul-campo.webp"
                alt="Chaleco azul tejido a mano en un entorno natural"
              />
            </figure>
            <figure className="hero-photo hero-photo-secondary">
              <img
                src="/assets/chaleco-beige-look.webp"
                alt="Conjunto infantil con chaleco beige tejido a mano"
              />
            </figure>
            <div className="hero-seal" aria-label="Elaboración artesanal">
              <strong>100%</strong>
              <span>artesanal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="craft-ribbon" aria-hidden="true">
        <span>Hecho a pedido</span>
        <i>•</i>
        <span>Colores a elección</span>
        <i>•</i>
        <span>Seña del 50%</span>
        <i>•</i>
        <span>7 a 10 días</span>
      </div>
    </section>
  );
}
