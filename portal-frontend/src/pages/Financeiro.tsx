import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";

function labelPeriodo(mesReferencia: string): string {
  const [ano, mes] = mesReferencia.split("-");
  const nomes = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return `${nomes[Number(mes) - 1]}/${ano}`;
}

export function FinanceiroPage() {
  const [periodos, setPeriodos] = useState<string[] | null>(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    apiFetch<{ periodos: string[] }>("/api/portal/financeiro/periodos")
      .then((dados) => {
        if (!ativo) return;
        setPeriodos(dados.periodos);
        setPeriodoSelecionado(dados.periodos[0] ?? null);
      })
      .catch((erroCapturado) => {
        if (!ativo) return;
        setErro(
          erroCapturado instanceof ApiError
            ? erroCapturado.message
            : "Não foi possível carregar os períodos.",
        );
      })
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, []);

  return (
    <section>
      <h1 className="title-editorial" style={{ fontSize: 28, marginBottom: 16 }}>
        Financeiro e histórico
      </h1>

      {carregando && <p style={{ fontSize: 15 }}>Carregando...</p>}

      {!carregando && erro && (
        <p style={{ fontSize: 15, color: "var(--color-cherry)" }}>{erro}</p>
      )}

      {!carregando && !erro && periodos && periodos.length === 0 && (
        <p style={{ fontSize: 15 }}>Nenhum período com atividade ainda.</p>
      )}

      {!carregando && !erro && periodos && periodos.length > 0 && (
        <>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 240, marginBottom: 24 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Período</span>
            <select
              value={periodoSelecionado ?? ""}
              onChange={(evento) => setPeriodoSelecionado(evento.target.value)}
              style={{
                height: 40,
                borderRadius: 8,
                border: "1px solid rgba(27, 23, 23, 0.2)",
                padding: "0 12px",
                fontSize: 14,
              }}
            >
              {periodos.map((periodo) => (
                <option key={periodo} value={periodo}>
                  {labelPeriodo(periodo)}
                </option>
              ))}
            </select>
          </label>

          {periodoSelecionado && <p style={{ fontSize: 15 }}>Exibindo {labelPeriodo(periodoSelecionado)}.</p>}
        </>
      )}
    </section>
  );
}
