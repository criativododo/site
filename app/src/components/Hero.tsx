import logoPrincipal from "../assets/brand/principal-cherry.svg";

const NAV_ITEMS = [
  { href: "#sobre-nos", label: "sobre nós" },
  { href: "#arquitetura", label: "o que fazemos" },
  { href: "#metodologia", label: "metodologia" },
  { href: "#cafe", label: "que tal um\ncafé?" },
  {
    href: "https://portal.criativododo.com.br",
    label: "área do cliente",
    external: true,
  },
];

function handleScrollDown() {
  document.getElementById("sobre-nos")?.scrollIntoView({ behavior: "smooth" });
}

export default function Hero() {
  return (
    <section className="hero">
      <video
        className="hero-bg"
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-poster.jpg"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      <header className="header">
        <div className="container header-container">
          <a href="#" aria-label="Voltar ao topo - Criativo Dodô" className="logo-link">
            <img src={logoPrincipal} alt="Criativo Dodô" className="logo" />
          </a>

          <nav className="nav-menu" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="nav-link"
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                style={{ whiteSpace: "pre-line" }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div
        className="scroll-indicator gsap-fade"
        id="scroll-down"
        role="button"
        tabIndex={0}
        aria-label="Rolar para baixo"
        onClick={handleScrollDown}
        onKeyDown={(e) => e.key === "Enter" && handleScrollDown()}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1b1717"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
