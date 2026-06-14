let cachedApiUrl: string | null = null;

export async function getApiUrl(): Promise<string> {
  if (cachedApiUrl) return cachedApiUrl;

  // Use Vite proxy in development to avoid CORS issues
  if (import.meta.env.DEV) {
    cachedApiUrl = '/api';
    return cachedApiUrl;
  }

  try {
    const response = await fetch('/appsettings.json');
    if (response.ok) {
      const config = await response.json();
      if (config?.Backend) {
        const { Addresss, HttpPort, HttpsPort, APIPrefix } = config.Backend;
        const protocol = HttpsPort ? 'https' : 'http';
        const port = HttpsPort || HttpPort;
        const host = port ? `${Addresss}:${port}` : Addresss;
        cachedApiUrl = `${protocol}://${host}${APIPrefix}`;
        return cachedApiUrl;
      }
    }
  } catch (error) {
    console.warn('Failed to load appsettings.json, falling back to /api', error);
  }

  cachedApiUrl = '/api';
  return cachedApiUrl;
}
