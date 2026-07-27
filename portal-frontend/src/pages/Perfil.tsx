import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../lib/api";

interface Endereco {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
  numero: string;
  complemento: string;
}

interface PerfilParceira {
  parceiraId: string;
  pix: string;
  email: string;
  endereco: Endereco | null;
}

function EditarContato({
  perfil,
  aoSalvarComSucesso,
}: {
  perfil: PerfilParceira;
  aoSalvarComSucesso: (perfil: PerfilParceira) => void;
}) {
  const [pix, setPix] = useState(perfil.pix);
  const [email, setEmail] = useState(perfil.email);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setSalvando(true);
    setErro(null);

    try {
      const atualizado = await apiFetch<PerfilParceira>("/api/portal/perfil/contato", {
        method: "PATCH",
        body: JSON.stringify({ pix, email }),
      });
      aoSalvarComSucesso(atualizado);
    } catch (erroCapturado) {
      setErro(
        erroCapturado instanceof ApiError ? erroCapturado.message : "Não foi possível salvar.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, marginTop: 24 }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
        PIX
        <input
          value={pix}
          onChange={(evento) => setPix(evento.target.value)}
          style={{ height: 40, borderRadius: 8, border: "1px solid rgba(27, 23, 23, 0.2)", padding: "0 12px", fontSize: 14, fontWeight: 400 }}
        />
      </label>
      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
        E-mail
        <input
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          style={{ height: 40, borderRadius: 8, border: "1px solid rgba(27, 23, 23, 0.2)", padding: "0 12px", fontSize: 14, fontWeight: 400 }}
        />
      </label>

      {erro && <p style={{ fontSize: 13, color: "var(--color-cherry)" }}>{erro}</p>}

      <button
        type="button"
        className="btn-primary"
        disabled={salvando}
        onClick={() => void salvar()}
        style={{ alignSelf: "flex-start", height: 40, padding: "0 24px", fontSize: 14 }}
      >
        {salvando ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}

export function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilParceira | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    apiFetch<PerfilParceira>("/api/portal/perfil/")
      .then((dados) => ativo && setPerfil(dados))
      .catch((erroCapturado) => {
        if (!ativo) return;
        setErro(
          erroCapturado instanceof ApiError
            ? erroCapturado.message
            : "Não foi possível carregar o perfil.",
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
        Perfil
      </h1>

      {carregando && <p style={{ fontSize: 15 }}>Carregando...</p>}

      {!carregando && erro && (
        <p style={{ fontSize: 15, color: "var(--color-cherry)" }}>{erro}</p>
      )}

      {!carregando && !erro && perfil && (
        <>
          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 20px", fontSize: 15, maxWidth: 480 }}>
            <dt style={{ fontWeight: 700 }}>PIX</dt>
            <dd>{perfil.pix}</dd>
            <dt style={{ fontWeight: 700 }}>E-mail</dt>
            <dd>{perfil.email}</dd>
            <dt style={{ fontWeight: 700 }}>Endereço</dt>
            <dd>
              {perfil.endereco
                ? `${perfil.endereco.rua}, ${perfil.endereco.numero} — ${perfil.endereco.bairro}, ${perfil.endereco.cidade}/${perfil.endereco.uf}`
                : "Não informado"}
            </dd>
          </dl>

          <EditarContato perfil={perfil} aoSalvarComSucesso={setPerfil} />
        </>
      )}
    </section>
  );
}
