import logoWordmark from "../../assets/brand/principal.svg";

const LOJAS = [
  {
    nome: "friburgo",
    endereco: "av julius arp, 80, centro, nova friburgo, rj",
    whatsapp: "https://api.whatsapp.com/send?phone=5522992880532",
  },
  {
    nome: "copacabana",
    endereco: "av nossa senhora de copacabana, 680, copacabana, rio de janeiro, rj",
    whatsapp: "https://api.whatsapp.com/send?phone=5522992626429",
  },
  {
    nome: "niterói",
    endereco: "plaza shopping niterói, niterói, rj",
    whatsapp: "https://api.whatsapp.com/send?phone=5522992069839",
  },
];

const GALERIA = [
  { base: "linha-1", alt: "robe jescri em algodão claro, detalhe do tecido e do caimento" },
  { base: "linha-2", alt: "camisola jescri em tom neutro, detalhe do acabamento em renda" },
  { base: "linha-3", alt: "conjunto jescri da linha noiva, foto conceito em duotone" },
  { base: "linha-4", alt: "detalhe de toque e caimento de peça da linha noiva jescri" },
];

function PhotoJpg({
  base,
  alt,
  className,
  sizes,
  loading = "lazy",
}: {
  base: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <picture className={["ln-photo", className].filter(Boolean).join(" ")}>
      <source
        type="image/webp"
        srcSet={`/jescri/linha-noiva/${base}-800.webp 800w, /jescri/linha-noiva/${base}-1200.webp 1200w, /jescri/linha-noiva/${base}-1600.webp 1600w`}
        sizes={sizes}
      />
      <img
        src={`/jescri/linha-noiva/${base}-1200.jpg`}
        srcSet={`/jescri/linha-noiva/${base}-800.jpg 800w, /jescri/linha-noiva/${base}-1200.jpg 1200w, /jescri/linha-noiva/${base}-1600.jpg 1600w`}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
}

export default function LinhaNoiva() {
  return (
    <main className="linha-noiva">
      <section className="ln-hero">
        <PhotoJpg base="hero" alt="noiva jescri, foto conceito em duotone cherry" className="ln-hero-bg" loading="eager" />
        <div className="ln-hero-tint" />
        <div className="ln-hero-scrim" />
        <div className="container ln-hero-content">
          <p className="ln-hero-subtitulo">a linha noiva jescri</p>
          <h1 className="ln-hero-titulo">antes do sim</h1>
        </div>
      </section>

      <section className="section-light ln-section">
        <div className="container ln-bloco ln-bloco-centro">
          <h2 className="title-editorial ln-titulo">
            a linha subiu, e o calendário não espera
          </h2>
          <p className="ln-corpo">
            casamentos concentram de setembro a dezembro. quem casa nesses meses
            está comprando enxoval agora.
          </p>
        </div>
      </section>

      <section className="section-red ln-section">
        <div className="container ln-bloco ln-bloco-centro">
          <h2 className="title-editorial ln-titulo ln-titulo-grande">
            a noiva decide a lingerie por último, e decide rápido
          </h2>
          <p className="ln-corpo">
            quando ela pensa na noite de núpcias e na lua de mel, a jescri
            precisa estar na frente dela.
          </p>
        </div>
      </section>

      <section className="section-light ln-section">
        <div className="container">
          <div className="ln-bloco ln-bloco-centro">
            <h2 className="title-editorial ln-titulo">
              robes, camisolas e conjuntos para as noites que importam
            </h2>
            <p className="ln-corpo">
              toque em algodão pima, caimento que acompanha o corpo e
              acabamento pensado peça a peça.
            </p>
          </div>
          <div className="ln-galeria">
            {GALERIA.map((foto) => (
              <PhotoJpg
                key={foto.base}
                base={foto.base}
                alt={foto.alt}
                sizes="(max-width: 768px) 90vw, 45vw"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-light ln-section">
        <div className="container ln-bloco ln-bloco-centro">
          <h2 className="title-editorial ln-titulo">
            a marca na pele, não no folheto
          </h2>
          <p className="ln-corpo">
            peça na mão, prova no provador, atendimento sem fila. um kit em
            bag de cetim com essência exclusiva da linha e algo azul.
          </p>
        </div>
      </section>

      <section className="section-light ln-section">
        <div className="container">
          <div className="ln-bloco ln-bloco-centro">
            <h2 className="title-editorial ln-titulo">
              friburgo, copacabana e niterói
            </h2>
          </div>
          <div className="ln-lojas">
            {LOJAS.map((loja) => (
              <div className="ln-loja" key={loja.nome}>
                <h3 className="ln-loja-nome">{loja.nome}</h3>
                <p className="ln-loja-endereco">{loja.endereco}</p>
                <a
                  href={loja.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ln-loja-link"
                >
                  falar no whatsapp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-red ln-section ln-fecho">
        <div className="container ln-bloco ln-bloco-centro">
          <h2 className="title-editorial ln-titulo">conheça a linha</h2>
          <div className="ln-fecho-ctas">
            <a
              href="https://api.whatsapp.com/send?phone=5522992880532"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-agendar chic-hover"
            >
              falar com a loja de friburgo
            </a>
            <a
              href="https://jescri.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="ln-fecho-link"
            >
              conhecer o jescri.com.br
            </a>
          </div>
          <div
            className="ln-assinatura"
            role="img"
            aria-label="criativo dodô"
            style={{
              WebkitMaskImage: `url(${logoWordmark})`,
              maskImage: `url(${logoWordmark})`,
            }}
          />
        </div>
      </section>
    </main>
  );
}
