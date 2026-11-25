export type PersonaSlug =
  | 'organico'
  | 'imobiliario'
  | 'familia'
  | 'trabalhista'
  | 'previdenciario'
  | 'consumidor'
  | (string & {});

export interface LeadPersonaEntity {
  id: number;
  slug: PersonaSlug;
  label: string;
  keywords_json: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  authority_statement: string;
  pain_points_json: string;
  cta_label: string;
  whatsapp_prefill: string;
  display_order: number;
}

export type LeadPersona = LeadPersonaEntity;
