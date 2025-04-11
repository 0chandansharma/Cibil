import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import clientService from '../../services/clientService';
import { setLoading } from './uiSlice';

// Async thunks
// frontend/src/store/slices/clientSlice.js
export const getClients = createAsyncThunk(
  'clients/getAll',
  async (_, { dispatch, rejectWithValue, getState }) => {
    const state = getState();
    
    // If we already have clients data and it was fetched recently (within last minute),
    // don't fetch again
    const lastFetched = state.clients.lastFetched;
    if (lastFetched && Date.now() - lastFetched < 60000) {
      return state.clients.clients;
    }
    
    try {
      dispatch(setLoading(true));
      const response = await clientService.getClients();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const getClientById = createAsyncThunk(
  'clients/getById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await clientService.getClientById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch client');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/create',
  async (clientData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await clientService.createClient(clientData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create client');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/update',
  async ({ id, clientData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await clientService.updateClient(id, clientData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update client');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await clientService.deleteClient(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete client');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const getClientDocuments = createAsyncThunk(
  'clients/getDocuments',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await clientService.getClientDocuments(id);
      return { clientId: id, documents: response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch client documents');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Client slice
const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    clients: [],
    currentClient: null,
    clientDocuments: {},
    error: null,
    lastFetched: null,
  },
  reducers: {
    clearCurrentClient: (state) => {
      state.currentClient = null;
    },
    setCurrentClient: (state, action) => {
      state.currentClient = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(getClients.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getClientById.fulfilled, (state, action) => {
        state.currentClient = action.payload;
        state.error = null;
      })
      .addCase(getClientById.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.push(action.payload);
        state.currentClient = action.payload;
        state.error = null;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        state.currentClient = action.payload;
        state.error = null;
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(client => client.id !== action.payload);
        if (state.currentClient && state.currentClient.id === action.payload) {
          state.currentClient = null;
        }
        delete state.clientDocuments[action.payload];
        state.error = null;
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(getClientDocuments.fulfilled, (state, action) => {
        state.clientDocuments[action.payload.clientId] = action.payload.documents;
        state.error = null;
      })
      .addCase(getClientDocuments.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCurrentClient, setCurrentClient, clearError } = clientSlice.actions;
export default clientSlice.reducer;