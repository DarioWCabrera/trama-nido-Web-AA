export default function AboutSection() {
  return (
    <section className="section about-section" id="sobre-mi">
      <div className="container about-grid">
        <div className="about-media">
          <img
            src="/assets/sobre-romina.webp"
            alt="Ovillos, agujas de crochet y materiales de trabajo de Trama Nido"
            loading="lazy"
          />
          <p className="about-caption">El espacio donde cada prenda empieza a tomar forma.</p>
        </div>

        <div className="about-copy">
          <span className="section-number" aria-hidden="true">02</span>
          <span className="eyebrow">Detrás de cada tejido</span>
          <h2>Hola, soy Romina.</h2>
          <p>
            Hace muchos años que el crochet forma parte de mi vida y hoy decidí
            compartirlo con ustedes.
          </p>
          <p>
            Creo prendas tejidas a mano, 100% artesanales, especialmente
            pensadas para recién nacidos, bebés y niños. Cada pieza se realiza
            por encargo, cuidando los colores, las terminaciones y cada pequeño
            detalle.
          </p>
          <blockquote>
            “Gracias por estar acá y acompañarme en este proyecto tejido con
            dedicación y amor.”
          </blockquote>
          <div className="about-signature">
            <strong>Romina</strong>
            <span>Creadora de Trama Nido</span>
          </div>
        </div>
      </div>
    </section>
  );
}
