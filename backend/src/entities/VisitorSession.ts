export interface VisitorSessionEntity {
  session_id: string;
  inferred_persona: string;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  referrer: string | null;
  behavior_scores_json: string;
  updated_at: string;
}

export type VisitorSession = VisitorSessionEntity;
