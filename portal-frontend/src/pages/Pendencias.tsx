import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";

type Formato = "Reel" | "Carrossel" | "Stories1" | "Stories2";
type EstadoEntrega = "AGUARDANDO_MATERIAL" | "EM_REVISAO" | "APROVADO" | "PUBLICADO";

interface ItemDePendencia {
  id: string;
  mesReferencia: string;
  formato: Formato;
  estado: EstadoEntrega;
  dataEntrega: string;
}

interface RespostaPendencias {
  mesReferencia: string;
  itens: ItemDePendencia[];
}

interface BlocoBriefing {
  look: string;
  dataEntrega: string;
  dataPostagem: string;
  orientacao: string;
}

interface RespostaBriefing {
  entrega: ItemDePendencia;
  briefing: BlocoBriefing | null;
}

const LABEL_FORMATO: Record<Formato, string> = {
  Reel: "Reel",
  Carrossel: "Carrossel",
  Stories1: "Stories 1",
  Stories2: "Stories 2",
};

const LABEL_ESTADO: Record<EstadoEntrega, string> = {
  AGUARDANDO_MATERIAL: "Aguardando material",
  EM_REVISAO: "Em revisão",
  APROVADO: "Aprovado",
  PUBLICADO: "Publicado",
};

function formatarData(dataEntrega: string): string {
  const [ano, mes, dia] = dataEntrega.split("-");
  return `${dia}/${mes}/${ano}`;
}

function BriefingDoItem({ entregaId }: { entregaId: string }) {
  const [resposta, setResposta] = useState<RespostaBriefing | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    apiFetch<RespostaBriefing>(`/api/portal/entregas/${entregaId}/briefing`)
      .then((dados) => ativo && setResposta(dados))
      .catch((erroCapturado) => {
        if (!ativo) return;
        setErro(
          erroCapturado instanceof ApiError
            ? erroCapturado.message
            : "Não foi possível carregar o briefing.",
        );
      })
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, [entregaId]);

  if (carregando) {
    return <p style={{ fontSize: 14 }}>Carregando briefing...</p>;
  }

  if (erro) {
    return <p style={{ fontSize: 14, color: "var(--color-cherry)" }}>{erro}</p>;
  }

  if (!resposta?.briefing) {
    return <p style={{ fontSize: 14 }}>Briefing ainda não publicado para esta Entrega.</p>;
  }

  const { look, dataEntrega, dataPostagem, orientacao } = resposta.briefing;

  return (
    <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 14 }}>
      <dt style={{ fontWeight: 700 }}>Look</dt>
      <dd>{look}</dd>
      <dt style={{ fontWeight: 700 }}>Data de entrega</dt>
      <dd>{formatarData(dataEntrega)}</dd>
      <dt style={{ fontWeight: 700 }}>Data de postagem</dt>
      <dd>{formatarData(dataPostagem)}</dd>
      <dt style={{ fontWeight: 700 }}>Orientação</dt>
      <dd>{orientacao}</dd>
    </dl>
  );
}

export function PendenciasPage() {
  const [resposta, setResposta] = useState<RespostaPendencias | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [itemAberto, setItemAberto] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await apiFetch<RespostaPendencias>("/api/portal/pendencias");
        if (ativo) {
          setResposta(dados);
        }
      } catch (erroCapturado) {
        if (!ativo) return;
        setErro(
          erroCapturado instanceof ApiError
            ? erroCapturado.message
            : "Não foi possível carregar as pendências.",
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <section>
      <h1 className="title-editorial" style={{ fontSize: 28, marginBottom: 16 }}>
        Pendências do mês
      </h1>

      {carregando && <p style={{ fontSize: 15 }}>Carregando...</p>}

      {!carregando && erro && (
        <p style={{ fontSize: 15, color: "var(--color-cherry)" }}>{erro}</p>
      )}

      {!carregando && !erro && resposta && resposta.itens.length === 0 && (
        <p style={{ fontSize: 15 }}>Sem pendências nesta competência ({resposta.mesReferencia}).</p>
      )}

      {!carregando && !erro && resposta && resposta.itens.length > 0 && (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {resposta.itens.map((item) => {
            const aberto = itemAberto === item.id;
            return (
              <li
                key={item.id}
                style={{
                  padding: "16px 20px",
                  border: "1px solid rgba(27, 23, 23, 0.1)",
                  borderRadius: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setItemAberto(aberto ? null : item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  <div>
                    <strong style={{ fontFamily: "var(--font-display)" }}>
                      {LABEL_FORMATO[item.formato]}
                    </strong>
                    <p style={{ fontSize: 14, opacity: 0.8 }}>
                      Entrega prevista em {formatarData(item.dataEntrega)}
                    </p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-cherry)" }}>
                    {LABEL_ESTADO[item.estado]}
                  </span>
                </button>

                {aberto && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(27, 23, 23, 0.1)" }}>
                    <BriefingDoItem entregaId={item.id} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
