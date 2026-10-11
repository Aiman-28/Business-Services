const API_TOKEN = import.meta.env.VITE_KYB_API_TOKEN;
const PROXY_BASE = '/api-proxy';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'token': API_TOKEN || ''
  };
};

// export const KybApiService = {
//   // 1. Countries API
//   async getCountries() {
//     const res = await fetch(`${PROXY_BASE}/v2/countries`, {
//       method: 'GET',
//       headers: getHeaders()
//     });
//     if (!res.ok) throw new Error(`Countries Fetch Error: ${res.statusText}`);
//     return await res.json();
//   },

  // 2. Initial KYB Search API
  // async initiateKybCheck(payload) {
  //   const res = await fetch(`${PROXY_BASE}/v2/kyb`, {
  //     method: 'POST',
  //     headers: getHeaders(),
  //     body: JSON.stringify(payload)
  //   });
  //   if (!res.ok) throw new Error(`KYB Check Error: ${res.statusText}`);
  //   return await res.json();
  // },
  // src/services/kybApi.js

export const KybApiService = {
  // ... rest of methods ...

  async initiateKybCheck(params) {
    const payload = {};

    // 1. Country code (array format)
    if (params.country_code) {
      payload.country_codes = [params.country_code.toUpperCase()];
    }
    
    // 2. Exact field key expected by API is 'name'
    if (params.company_name) {
      payload.name = params.company_name;
    }
    
    // 3. Registration number
    if (params.registration_number) {
      payload.registration_number = params.registration_number;
    }
    
    // 4. Search type & pagination
    if (params.search_type) {
      payload.search_type = params.search_type;
    }
    if (params.page) {
      payload.page = params.page;
    }

    const res = await fetch(`${PROXY_BASE}/v2/kyb`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error (${res.status})`);
    }

    return await res.json();
  },
  // 3. Status Polling API
  async getKybStatus(kybResponseId) {
    const res = await fetch(`${PROXY_BASE}/v2/kyb?kyb_response_id=${kybResponseId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`KYB Status Error: ${res.statusText}`);
    return await res.json();
  },

  // 4. Details Resolution API
  async getKybDetails(kybResponseId) {
    const res = await fetch(`${PROXY_BASE}/v2/kyb/${kybResponseId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`KYB Details Error: ${res.statusText}`);
    return await res.json();
  }
};