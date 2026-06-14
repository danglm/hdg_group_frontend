import { authService } from './auth';
import { getApiUrl } from './apiConfig';

export const telegramService = {
  async getGroups() {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    
    // Use exactly what the server returned (e.g., 'bearer') or 'Bearer' as fallback
    const authHeader = `${tokenType} ${token}`;
    
    console.log('Fetching groups with header:', tokenType, token ? 'Token exists' : 'Token MISSING');

    const response = await fetch(`${BASE_URL}/telegram/get_telegram_groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch groups`);
    }

    return await response.json();
  },

  async addUsers(message: string, chatIds: string[]) {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/telegram/add_users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ message, chat_ids: chatIds }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Add Users Error:', response.status, errorData);
      throw new Error(errorData.detail || `Error ${response.status}: Failed to add users`);
    }

    return await response.json();
  }
};
