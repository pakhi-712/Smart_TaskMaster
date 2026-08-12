import axios from "axios";
import { getToken } from "./authApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function getDailyBriefing(): Promise<{ briefing: string; cached: boolean }> {
  const token = getToken();
  const response = await axios.get<{ briefing: string; cached: boolean }>(
    `${API_BASE}/api/ai/daily-briefing`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );
  return response.data;
}