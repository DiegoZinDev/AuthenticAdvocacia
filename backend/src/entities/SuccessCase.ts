export interface SuccessCaseEntity {
  id: number;
  persona_slug: string;
  title: string;
  situation: string;
  outcome: string;
  metric_badge: string;
  timeframe: string;
  court_ref: string;
}

export type SuccessCase = SuccessCaseEntity;
