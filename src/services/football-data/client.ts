// Cliente para football-data.org v4
// Docs: https://docs.football-data.org/general/v4/
// En desarrollo usa el proxy de Vite (/api/football → api.football-data.org/v4)
// En producción usará Supabase Edge Functions

const API_BASE = '/api/football';

let API_KEY = localStorage.getItem('football-data-key') || '6b3727136ba8497a8dbaa9b7c7033cd6';

export function setApiKey(key: string) {
  API_KEY = key;
  localStorage.setItem('football-data-key', key);
}

export function getApiKey(): string {
  return API_KEY;
}

export function hasApiKey(): boolean {
  return API_KEY.length > 0;
}

export async function fetchApi<T>(endpoint: string): Promise<T> {
  if (!API_KEY) {
    throw new Error('API key no configurada. Regístrate gratis en football-data.org');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: {
      'X-Auth-Token': API_KEY,
    },
  });

  if (response.status === 429) {
    throw new Error('Rate limit alcanzado (10 req/min). Espera un momento.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const msg = errorData?.message || `Error: ${response.status} ${response.statusText}`;
    throw new Error(msg);
  }

  return response.json() as Promise<T>;
}
