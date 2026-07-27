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
      )}
    </section>
  );
}
