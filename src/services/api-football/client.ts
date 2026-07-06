// Cliente para API-Football v3
// Docs: https://www.api-football.com/documentation-v3

const API_BASE = 'https://v3.football.api-sports.io';

let API_KEY = localStorage.getItem('api-football-key') || '';

export function setApiKey(key: string) {
  API_KEY = key;
  localStorage.setItem('api-football-key', key);
}

export function getApiKey(): string {
  return API_KEY;
}

export function hasApiKey(): boolean {
  return API_KEY.length > 0;
}

async function fetchApi<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!API_KEY) {
    throw new Error('API key no configurada');
  }

  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.errors && Object.keys(data.errors).length > 0) {
    const errorMsg = Object.values(data.errors).join(', ');
    throw new Error(`API-Football: ${errorMsg}`);
  }

  return data.response as T;
}

export { fetchApi };
