import api from './api';

const analysisService = {
  getAnalysisResults: async (documentId) => {
    const response = await api.get(`/analysis/${documentId}`);
    return response.data;
  },
  
  getCibilScore: async (documentId) => {
    const response = await api.get(`/analysis/${documentId}/cibil`);
    return response.data;
  },
  
  updateCibilData: async (documentId, cibilData) => {
    const response = await api.put(`/analysis/${documentId}/cibil`, cibilData);
    return response.data;
  },
  
  getDocumentSummary: async (documentId) => {
    const response = await api.get(`/analysis/${documentId}/summary`);
    return response.data;
  },
  
  // Add this method to the existing analysisService
    getBankStatementAnalysis: async (documentId) => {
        const response = await api.get(`/analysis/${documentId}/bank-statement`);
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
  
  chatWithDocument: async (documentId, message) => {
    const response = await api.post(`/analysis/${documentId}/chat`, { message });
    return response.data;
  },
  
  downloadAnalysisReport: async (documentId, format = 'pdf') => {
    const response = await api.get(`/analysis/${documentId}/download?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default analysisService;