export interface User {
  id: string;
  name: string;
  age: number;
  major: string;
  interests: string;
  bio: string;
}

export interface MicroQuestTemplate {
  id: string;
  title: string;
  description: string;
  suggestedDurationMinutes: number;
  suggestedContext: string;
  reflectionPrompts: string[];
}

export interface MicroQuestFeedback {
  id: string;
  questSessionId: string;
  userId: string;
  completionTimestamp: string;
  chemistry: number;
  comfort: number;
  wouldDoRealDate: 'yes' | 'maybe' | 'no';
  comment?: string | null;
}

export interface DashboardSession {
  id: string;
  status: string;
  template: MicroQuestTemplate;
  myFeedback: MicroQuestFeedback | null;
  partnerFeedback: MicroQuestFeedback | null;
}

export interface DashboardMatch {
  id: string;
  partner: User;
  status: string;
  session: DashboardSession | null;
}

export interface DashboardData {
  user: User;
  matches: DashboardMatch[];
}

export interface InsightRow {
  templateId: string;
  title: string;
  suggestedContext: string;
  totalSessions: number;
  completedSessions: number;
  avgChemistry: number | null;
  avgComfort: number | null;
  bothPositivePercent: number | null;
}
