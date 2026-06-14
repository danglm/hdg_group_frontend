import { getApiUrl } from './apiConfig';


export const authService = {
  async login(username: string, password: string): Promise<any> {
    const baseUrl = await getApiUrl();
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
    }
    return data;
  },

  async register(params: { username: string; password?: string; employee_id: string; role?: string }): Promise<any> {
    const baseUrl = await getApiUrl();
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: params.username,
        password: params.password,
        employee_id: params.employee_id,
        role: params.role || 'employee'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Parse FastAPI validation errors
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }
      
      throw new Error(errorData.detail || 'Registration failed');
    }

    const data = await response.json();
    return data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

