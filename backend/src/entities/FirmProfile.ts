export interface FirmProfileEntity {
  id: number;
  lawyer_name: string;
  firm_name: string;
  oab: string;
  whatsapp: string;
  primary_area: string;
  photo_data_url: string | null;
  city: string;
  years_experience: number;
  cases_solved_count: number;
  updated_at: string;
}

export type FirmProfile = FirmProfileEntity;
