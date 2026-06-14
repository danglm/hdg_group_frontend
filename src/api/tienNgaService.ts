import { authService } from './auth';
import { getApiUrl } from './apiConfig';

export const tienNgaService = {
  async getCustomers(ingredient: string = 'cao su', collectionPointId?: string): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    let url = `${BASE_URL}/tien-nga/get-customers?ingredient=${encodeURIComponent(ingredient)}`;
    if (collectionPointId) {
      url += `&collection_point_id=${encodeURIComponent(collectionPointId)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getCustomers API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch customers`);
    }

    return await response.json();
  },

  async getCollectionPoints(ingredient: string = 'Cao su'): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/get-collection-points?ingredient=${encodeURIComponent(ingredient)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getCollectionPoints API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch collection points`);
    }

    return await response.json();
  },

  async addCustomers(customers: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/add-customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(customers)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('addCustomers API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to add customers`);
    }

    return await response.json();
  },

  async updateCustomers(customers: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/update-customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(customers)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('updateCustomers API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to update customers`);
    }

    return await response.json();
  },

  async deleteCustomers(customerIds: string[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/delete-customers`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(customerIds)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('deleteCustomers API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to delete customers`);
    }

    return await response.json();
  },

  async getDailyPurchases(params: {
    start_date?: string;
    end_date?: string;
    hoursehold_id?: string;
    product_code?: string;
    collection_point_id?: string;
  } = {}): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.hoursehold_id) queryParams.append('hoursehold_id', params.hoursehold_id);
    if (params.product_code) queryParams.append('product_code', params.product_code);
    if (params.collection_point_id) queryParams.append('collection_point_id', params.collection_point_id);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tien-nga/get-daily-purchases${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getDailyPurchases API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch daily purchases`);
    }

    return await response.json();
  },

  async addDailyPurchases(purchases: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/add-daily-purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(purchases)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('addDailyPurchases API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to add daily purchases`);
    }

    return await response.json();
  },

  async updateDailyPurchases(purchases: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/update-daily-purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(purchases)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('updateDailyPurchases API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to update daily purchases`);
    }

    return await response.json();
  },

  async deleteDailyPurchases(purchaseIds: string[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/delete-daily-purchases`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(purchaseIds)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('deleteDailyPurchases API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to delete daily purchases`);
    }

    return await response.json();
  },

  async getMaterialPurchases(params: {
    start_date?: string;
    end_date?: string;
    material_type?: string;
    storage_name?: string;
  } = {}): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.material_type) queryParams.append('material_type', params.material_type);
    if (params.storage_name) queryParams.append('storage_name', params.storage_name);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tien-nga/get-material-purchases${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getMaterialPurchases API Error:', response.status, errorData);
      
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

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch material purchases`);
    }

    return await response.json();
  },

  async addMaterialPurchases(purchases: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/add-material-purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(purchases)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('addMaterialPurchases API Error:', response.status, errorData);

      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }

      throw new Error(errorData.detail || `Error ${response.status}: Failed to add material purchases`);
    }

    return await response.json();
  },

  async getProductTransactions(params: {
    transaction_type?: string;
    material_type?: string;
    start_date?: string;
    end_date?: string;
    storage_name?: string;
  } = {}): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const queryParams = new URLSearchParams();
    if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
    if (params.material_type) queryParams.append('material_type', params.material_type);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.storage_name) queryParams.append('storage_name', params.storage_name);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tien-nga/get-product-transactions${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getProductTransactions API Error:', response.status, errorData);

      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }

      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch product transactions`);
    }

    return await response.json();
  },

  async addProductTransactions(transactions: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/add-product-transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(transactions)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('addProductTransactions API Error:', response.status, errorData);

      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }

      throw new Error(errorData.detail || `Error ${response.status}: Failed to add product transactions`);
    }

    return await response.json();
  },

  async deleteProductTransactions(transactionIds: string[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/delete-product-transactions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(transactionIds)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('deleteProductTransactions API Error:', response.status, errorData);

      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }

      throw new Error(errorData.detail || `Error ${response.status}: Failed to delete product transactions`);
    }

    return await response.json();
  },

  async getInventories(materialName?: string): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const queryParams = new URLSearchParams();
    if (materialName) queryParams.append('material_name', materialName);
    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tien-nga/get-inventories${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('getInventories API Error:', response.status, errorData);

      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }

      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch inventories`);
    }

    return await response.json();
  },

  async getInventoryExports(params: {
    storage_name?: string;
    material_type?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const queryParams = new URLSearchParams();
    if (params.storage_name) queryParams.append('storage_name', params.storage_name);
    if (params.material_type) queryParams.append('material_type', params.material_type);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tien-nga/get-inventory-exports${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getInventoryExports API Error:', response.status, errorData);

      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }

      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch inventory exports`);
    }

    return await response.json();
  },

  async addInventoryExports(exports: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/add-inventory-exports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(exports)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('addInventoryExports API Error:', response.status, errorData);

      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }

      throw new Error(errorData.detail || `Error ${response.status}: Failed to add inventory exports`);
    }

    return await response.json();
  },

  async deleteInventoryExports(exportIds: string[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/delete-inventory-exports`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(exportIds)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('deleteInventoryExports API Error:', response.status, errorData);

      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }

      throw new Error(errorData.detail || `Error ${response.status}: Failed to delete inventory exports`);
    }

    return await response.json();
  },

  async getPartners(): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/get-partners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getPartners API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch partners`);
    }

    return await response.json();
  },

  async addPartners(partners: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/add-partners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(partners)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('addPartners API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to add partners`);
    }

    return await response.json();
  },

  async updatePartners(partners: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/update-partners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(partners)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('updatePartners API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to update partners`);
    }

    return await response.json();
  },

  async deletePartners(partnerIds: string[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/delete-partners`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(partnerIds)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('deletePartners API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to delete partners`);
    }

    return await response.json();
  },

  async getPartnerBusinesses(params: {
    product_type?: string;
    transaction_type?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const queryParams = new URLSearchParams();
    if (params.product_type) queryParams.append('product_type', params.product_type);
    if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tien-nga/get-partner-businesses${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getPartnerBusinesses API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch partner businesses`);
    }

    return await response.json();
  },

  async addPartnerBusinesses(businesses: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/add-partner-businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(businesses)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('addPartnerBusinesses API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to add partner businesses`);
    }

    return await response.json();
  },

  async updatePartnerBusinesses(businesses: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/update-partner-businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(businesses)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('updatePartnerBusinesses API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to update partner businesses`);
    }

    return await response.json();
  },

  async deletePartnerBusinesses(businessIds: string[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/delete-partner-businesses`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(businessIds)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('deletePartnerBusinesses API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to delete partner businesses`);
    }

    return await response.json();
  },

  async getInvestments(params: { role?: string; parent_id?: string } = {}): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append('role', params.role);
    if (params.parent_id) queryParams.append('parent_id', params.parent_id);

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/tien-nga/get-investments${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getInvestments API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to fetch investments`);
    }

    return await response.json();
  },

  async addInvestments(investments: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/add-investments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(investments)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('addInvestments API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to add investments`);
    }

    return await response.json();
  },

  async updateInvestments(investments: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/update-investments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(investments)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('updateInvestments API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to update investments`);
    }

    return await response.json();
  },

  async getDailyPayments(params: {
    investment_id?: string;
    payment_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const queryParams = new URLSearchParams();
    if (params.investment_id) queryParams.append('investment_id', params.investment_id);
    if (params.payment_type) queryParams.append('payment_type', params.payment_type);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);

    const url = `${BASE_URL}/tien-nga/get-daily-payments?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('getDailyPayments API Error:', response.status, errorData);
      
      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to get daily payments`);
    }

    return await response.json();
  },

  async addDailyPayments(payments: any[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/add-daily-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(payments)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('addDailyPayments API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to add daily payments`);
    }

    return await response.json();
  },

  async deleteDailyPayments(paymentIds: string[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/delete-daily-payments`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(paymentIds)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('deleteDailyPayments API Error:', response.status, errorData);
      
      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: Failed to delete daily payments`);
    }

    return await response.json();
  },

  async deleteMaterialPurchases(purchaseIds: string[]): Promise<any[]> {
    const BASE_URL = await getApiUrl();
    const token = authService.getToken();
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const authHeader = `${tokenType} ${token}`;

    const response = await fetch(`${BASE_URL}/tien-nga/delete-material-purchases`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(purchaseIds)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('deleteMaterialPurchases API Error:', response.status, errorData);

      if (errorData.detail && Array.isArray(errorData.detail)) {
        const errorMsg = errorData.detail
          .map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : '';
            return `${field ? field + ': ' : ''}${err.msg}`;
          })
          .join(', ');
        throw new Error(errorMsg);
      }

      if (response.status === 401) {
        authService.handle401();
      }

      throw new Error(errorData.detail || `Error ${response.status}: Failed to delete material purchases`);
    }

    return await response.json();
  }
};



