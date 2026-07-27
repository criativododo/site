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

export function PendenciasPage() {
  const [resposta, setResposta] = useState<RespostaPendencias | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

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
          {resposta.itens.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                border: "1px solid rgba(27, 23, 23, 0.1)",
                borderRadius: 12,
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
