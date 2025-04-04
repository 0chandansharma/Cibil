import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import documentService from '../../services/documentService';
import { setLoading } from './uiSlice';

// Async thunks
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (documentData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await documentService.uploadDocument(documentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Document upload failed');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const getDocuments = createAsyncThunk(
  'documents/getAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await documentService.getDocuments();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const getDocumentById = createAsyncThunk(
  'documents/getById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await documentService.getDocumentById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch document');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const processDocument = createAsyncThunk(
  'documents/process',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await documentService.processDocument(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Document processing failed');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await documentService.deleteDocument(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Document slice
const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    documents: [],
    currentDocument: null,
    analysisResults: null,
    error: null,
    loading: false,
  },
  reducers: {
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
      state.analysisResults = null;
    },
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.documents.push(action.payload);
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
        state.error = null;
      })
      .addCase(getDocuments.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getDocumentById.fulfilled, (state, action) => {
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(getDocumentById.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(processDocument.fulfilled, (state, action) => {
        state.analysisResults = action.payload;
        state.error = null;
        
        // Update document status in the documents array
        const index = state.documents.findIndex(doc => doc.id === action.payload.documentId);
        if (index !== -1) {
          state.documents[index].status = 'completed';
        }
        
        // Update current document status if it matches
        if (state.currentDocument && state.currentDocument.id === action.payload.documentId) {
          state.currentDocument.status = 'completed';
        }
      })
      .addCase(processDocument.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
        if (state.currentDocument && state.currentDocument.id === action.payload) {
          state.currentDocument = null;
          state.analysisResults = null;
        }
        state.error = null;
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCurrentDocument, setCurrentDocument, clearError } = documentSlice.actions;
export default documentSlice.reducer;