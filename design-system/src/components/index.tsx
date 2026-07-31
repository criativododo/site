import type { ReactNode, ReactElement, ButtonHTMLAttributes, InputHTMLAttributes, AnchorHTMLAttributes } from "react";

/** Botão de ação. `primary` = ação principal (Cherry sólido); `outline-cherry`/`outline-neutral`
 * consolidam os 5 objetos de estilo inline duplicados em Admin* (DESIGN.md §34.7). */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline-cherry" | "outline-neutral";
  children: ReactNode;
}
export function Button({ variant = "primary", className, children, ...rest }: ButtonProps): ReactElement {
  const cls =
    variant === "primary"
      ? "dodo-btn-primary"
      : variant === "outline-cherry"
        ? "dodo-btn-outline-cherry"
        : "dodo-btn-outline-neutral";
  return (
    <button className={[cls, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </button>
  );
}

/** Card genérico: borda + raio + sombra. */
export interface CardProps { children: ReactNode; className?: string }
export function Card({ children, className }: CardProps): ReactElement {
  return <div className={["dodo-card", className].filter(Boolean).join(" ")}>{children}</div>;
}

/** Aviso. `gap` marca decisão pendente sem inventar regra (padrão editorial da Dodô). */
export interface CalloutProps { variant?: "default" | "gap"; children: ReactNode }
export function Callout({ variant = "default", children }: CalloutProps): ReactElement {
  return <div className={variant === "gap" ? "dodo-callout is-gap" : "dodo-callout"}>{children}</div>;
}

/** Chip/tag pequeno. */
export interface ChipProps { children: ReactNode }
export function Chip({ children }: ChipProps): ReactElement {
  return <span className="dodo-chip">{children}</span>;
}

/** Campo de formulário com label — consolida `estiloInput`/`estiloLabel` (DESIGN.md §17). */
export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}
export function TextField({ label, id, className, ...rest }: TextFieldProps): ReactElement {
  return (
    <div>
      <label className="dodo-field-label" htmlFor={id}>{label}</label>
      <input id={id} className={["dodo-field", className].filter(Boolean).join(" ")} {...rest} />
    </div>
  );
}

/** Badge de status — real em produção (`.pendencia-status-badge`). */
export interface StatusBadgeProps { children: ReactNode }
export function StatusBadge({ children }: StatusBadgeProps): ReactElement {
  return <span className="pendencia-status-badge">{children}</span>;
}

/** Tile de KPI — real em produção (`.financeiro-kpi`). `destaque` deixa o valor em Cherry. */
export interface KpiTileProps { label: string; value: string; destaque?: boolean }
export function KpiTile({ label, value, destaque }: KpiTileProps): ReactElement {
  return (
    <div className={destaque ? "financeiro-kpi is-destaque" : "financeiro-kpi"}>
      <div className="financeiro-kpi-label">{label}</div>
      <div className="financeiro-kpi-value">{value}</div>
    </div>
  );
}

/** Linha de lista — real em produção (`.portal-list-row`). */
export interface ListRowProps { children: ReactNode }
export function ListRow({ children }: ListRowProps): ReactElement {
  return <div className="portal-list-row">{children}</div>;
}

/** Item de pendência com estado — real em produção (`.pendencia-item`). */
export interface PendenciaItemProps { overdue?: boolean; children: ReactNode }
export function PendenciaItem({ overdue, children }: PendenciaItemProps): ReactElement {
  return <div className={overdue ? "pendencia-item is-overdue" : "pendencia-item"}>{children}</div>;
}

/** Link de navegação com sublinhado animado — real em produção (`.portal-nav-link`). */
export interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  children: ReactNode;
}
export function NavLink({ active, className, children, ...rest }: NavLinkProps): ReactElement {
  return (
    <a className={["portal-nav-link", active ? "is-active" : "", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </a>
  );
}

/** Container editorial — real em produção (`.container`, max-width 1026px). */
export interface ContainerProps { children: ReactNode }
export function Container({ children }: ContainerProps): ReactElement {
  return <div className="container">{children}</div>;
}

/** Overline/eyebrow em maiúscula — real em produção (`.portal-eyebrow`). */
export interface EyebrowProps { children: ReactNode }
export function Eyebrow({ children }: EyebrowProps): ReactElement {
  return <p className="portal-eyebrow">{children}</p>;
}

/** Título editorial 38.4/28.8px, peso 800 — real em produção (`.title-editorial`). */
export interface PageTitleProps { as?: "h1" | "h2"; children: ReactNode }
export function PageTitle({ as = "h1", children }: PageTitleProps): ReactElement {
  const Tag = as;
  return <Tag className="title-editorial">{children}</Tag>;
}
