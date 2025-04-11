// frontend/src/services/clientService.js
import api from './api';

// Add a simple caching mechanism
const cache = {
  clients: {
    data: null,
    timestamp: null
  }
};

// Cache validity duration (in milliseconds) - 1 minute
const CACHE_DURATION = 60000;

const clientService = {
  getClients: async () => {
    // Check cache first
    const now = Date.now();
    if (cache.clients.data && cache.clients.timestamp && 
        (now - cache.clients.timestamp < CACHE_DURATION)) {
      console.log('Using cached clients data');
      return cache.clients.data;
    }
    
    // If not in cache or cache expired, make the API call
    const response = await api.get('/clients');
    
    // Update cache
    cache.clients.data = response.data;
    cache.clients.timestamp = now;
    
    return response.data;
  },
  
  // Other methods remain the same...
  getClientById: async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },
  
  createClient: async (clientData) => {
    // Invalidate cache when creating
    cache.clients.data = null;
    cache.clients.timestamp = null;
    
    const response = await api.post('/clients', clientData);
    return response.data;
  },
  
  updateClient: async (id, clientData) => {
    // Invalidate cache when updating
    cache.clients.data = null;
    cache.clients.timestamp = null;
    
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },
  
  deleteClient: async (id) => {
    // Invalidate cache when deleting
    cache.clients.data = null;
    cache.clients.timestamp = null;
    
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
  
  getClientDocuments: async (id) => {
    const response = await api.get(`/clients/${id}/documents`);
    return response.data;
  },
  
  searchClients: async (query) => {
    const response = await api.get(`/clients/search?q=${query}`);
    return response.data;
  },
};

export default clientService;