export default function MeaningSection() {
  return (
    <section className="meaning-section" id="historia">
      <div className="container meaning-inner">
        <div className="meaning-heading">
          <span className="section-number" aria-hidden="true">03</span>
          <div>
            <span className="eyebrow">El origen del nombre</span>
            <h2>¿Por qué Trama Nido?</h2>
            <p>
              Elegí este nombre porque representa lo que deseo transmitir con
              cada prenda.
            </p>
          </div>
        </div>

        <div className="meaning-words">
          <article>
            <span className="meaning-word">TRAMA</span>
            <p>
              El conjunto de emociones, pensamientos, sueños e historias que
              nos conforman y nos unen.
            </p>
          </article>
          <article>
            <span className="meaning-word">NIDO</span>
            <p>
              Hogar, calidez, cuidado y protección: ese lugar donde los más
              chicos se sienten acompañados.
            </p>
          </article>
        </div>

        <p className="meaning-closing">
          Cada chaleco busca ser un cálido abrigo, tejido artesanalmente con
          amor y pensado para formar parte de esa trama que nos sostiene.
        </p>
      </div>
    </section>
  );
}
