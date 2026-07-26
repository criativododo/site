import { useEffect, useRef, useState } from "react";

const SERVICOS = [
  {
    titulo: "branding",
    descricao:
      "uma marca forte não se reconhece pelo logo. se reconhece pela coerência entre o que diz, o que vende e como aparece. começamos com imersão: contexto, produto, público e o valor que a marca já carrega sem saber nomear. dali, estruturamos posicionamento, narrativa e identidade visual com clareza suficiente para que cada decisão futura tenha onde se apoiar. o entregável é um sistema vivo, não um manual engessado.",
  },
  {
    titulo: "direção criativa e produção de campanhas",
    descricao:
      "uma campanha não começa na produção. começa na pergunta certa: o que essa coleção quer dizer e para quem ela fala. lemos a coleção, o momento e o que o mercado ainda não disse. dali encontramos o fio que orienta cada escolha criativa, do naming ao conceito visual. a produção carrega essa direção até o final, campanha completa, lookbook, qualquer que seja o formato. imagem sem direção é apenas registro.",
  },
  {
    titulo: "gestão de marketing de influência",
    descricao:
      "influência que constrói marca não é questão de volume, é questão de fit. a maioria das ativações falha antes de começar, no momento em que o perfil é escolhido pelo alcance e não pelo que representa. cuidamos de todo o ciclo, da curadoria ao resultado final. cada escolha passa por critério, contexto e pela leitura do que aquela marca específica precisa dizer naquele momento.",
  },
];

function AccordionItem({
  titulo,
  descricao,
  isOpen,
  onToggle,
}: {
  titulo: string;
  descricao: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : "0";
  }, [isOpen]);

  return (
    <div className={`accordion-item stagger-item${isOpen ? " active" : ""}`}>
      <div className="accordion-header" onClick={onToggle}>
        <h3 className="accordion-title">{titulo}</h3>
        <span className="accordion-icon">{isOpen ? "−" : "+"}</span>
      </div>
      <div className="accordion-content" ref={contentRef}>
        <p>{descricao}</p>
      </div>
    </div>
  );
}

export default function Servicos() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section-red" id="arquitetura">
      <div className="container relative-z">
        <h2 className="title-editorial titulo-arquitetura gsap-fade">
          o que fazemos
        </h2>

        <div className="accordion-wrapper gsap-fade stagger-group">
          {SERVICOS.map((servico, index) => (
            <AccordionItem
              key={servico.titulo}
              titulo={servico.titulo}
              descricao={servico.descricao}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
