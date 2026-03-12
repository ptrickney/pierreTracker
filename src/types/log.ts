export type LogRow = {
  id: string;
  created_at: string;
  action_type: "feed" | "sleep" | "diaper";
  amount: number;
  unit: string;
  details: string | null;
  timestamp: string;
};
