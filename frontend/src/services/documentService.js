import api from './api';

const documentService = {
  uploadDocument: async (documentData) => {
    const formData = new FormData();
    formData.append('file', documentData.file);
    
    if (documentData.title) {
      formData.append('title', documentData.title);
    }
    
    if (documentData.clientId) {
      formData.append('client_id', documentData.clientId);
    }
    
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },
  
  getDocumentById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },
  
  processDocument: async (id) => {
    const response = await api.post(`/documents/${id}/process`);
    return response.data;
  },
  
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
  
  getDocumentStatus: async (id) => {
    const response = await api.get(`/documents/${id}/status`);
    return response.data;
  },
  
  getAnalysisResults: async (documentId) => {
    const response = await api.get(`/analysis/${documentId}`);
    return response.data;
  },
  
  getCibilScore: async (documentId) => {
    const response = await api.get(`/analysis/${documentId}/cibil`);
    return response.data;
  },
  
  getDocumentSummary: async (documentId) => {
    const response = await api.get(`/analysis/${documentId}/summary`);
    return response.data;
  },
  
  getExtractedTables: async (documentId) => {
    const response = await api.get(`/analysis/${documentId}/tables`);
    return response.data;
  },
  
  getOcrText: async (documentId) => {
    const response = await api.get(`/analysis/${documentId}/ocr`);
    return response.data;
  },

  processBankStatement: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/documents/process-bank-statement', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  chatWithDocument: async (documentId, message) => {
    const response = await api.post(`/analysis/${documentId}/chat`, { message });
    return response.data;
  },
};

export default documentService;