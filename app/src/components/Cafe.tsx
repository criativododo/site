const FOOTER_LINKS = [
  {
    label: "instagram,",
    href: "https://www.instagram.com/criativododo",
  },
  {
    label: "spotify,",
    href: "https://open.spotify.com/user/31qmdlo2bfpjyylv5jilzcjcpa7y?si=D5t2c7mIR2Wwl87swuF0jw",
  },
  {
    label: "pinterest,",
    href: "https://br.pinterest.com/criativododo",
  },
  {
    label: "contato",
    href: "https://api.whatsapp.com/send/?phone=5522936182313&text&type=phone_number&app_absent=0",
  },
];

export default function Cafe() {
  return (
    <section className="section-red tone-maroon" id="cafe">
      <div className="container container-footer relative-z">
        <h2 className="title-editorial gsap-fade">
          branding, direção criativa e gestão de marketing de influência para
          marcas
        </h2>
        <p className="cafe-texto gsap-fade">
          <strong className="acumin-bold">que tal um café?</strong> um
          convite simples para conversar sobre a sua marca, entender o
          momento e pensar juntos os próximos passos.{" "}
          <strong className="acumin-bold">
            conversa leve, com clareza e sem pressão.
          </strong>
        </p>

        <div className="cta-wrapper gsap-fade">
          <a
            href="https://api.whatsapp.com/send/?phone=5522936182313&text&type=phone_number&app_absent=0"
            className="btn-agendar chic-hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            agendar :)
          </a>
        </div>

        <p className="footer-links">
          <span className="footer-link-item">criativo dodô, 2022 &nbsp;|&nbsp;</span>
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link-item"
            >
              {link.label}&nbsp;
            </a>
          ))}
        </p>
      </div>
    </section>
  );
}
