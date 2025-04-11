import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientDocuments,
  clearCurrentClient,
  setCurrentClient,
  clearError,
} from '../store/slices/clientSlice';

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Track last call time to prevent frequent calls
let lastGetClientsCall = 0;
const CALL_THROTTLE = 2000; // 2 seconds

const useClients = () => {
  const dispatch = useDispatch();
  const { clients, currentClient, clientDocuments, error } = useSelector(
    (state) => state.clients
  );
  
  const handleGetClients = useCallback(async () => {
    const now = Date.now();
    if (now - lastGetClientsCall < CALL_THROTTLE) {
      console.log('Throttling getClients call');
      return Promise.resolve(clients);
    }
    
    lastGetClientsCall = now;
    return dispatch(getClients()).unwrap();
  }, [dispatch, clients]);
  
  // Debounce other functions that might be called frequently
  const debouncedGetClientById = useCallback(
    debounce((id) => dispatch(getClientById(id)), 300),
    [dispatch]
  );
  
  
  const handleGetClientById = async (id) => {
    return dispatch(getClientById(id)).unwrap();
  };
  
  const handleCreateClient = async (clientData) => {
    return dispatch(createClient(clientData)).unwrap();
  };
  
  const handleUpdateClient = async (id, clientData) => {
    return dispatch(updateClient({ id, clientData })).unwrap();
  };
  
  const handleDeleteClient = async (id) => {
    return dispatch(deleteClient(id)).unwrap();
  };
  
  const handleGetClientDocuments = async (id) => {
    return dispatch(getClientDocuments(id)).unwrap();
  };
  
  const handleClearCurrentClient = () => {
    dispatch(clearCurrentClient());
  };
  
  const handleSetCurrentClient = (client) => {
    dispatch(setCurrentClient(client));
  };
  
  const handleClearError = () => {
    dispatch(clearError());
  };
  
  return {
    clients,
    currentClient,
    clientDocuments,
    error,
    getClients: handleGetClients,
    getClientById: debouncedGetClientById,
    createClient: handleCreateClient,
    updateClient: handleUpdateClient,
    deleteClient: handleDeleteClient,
    getClientDocuments: handleGetClientDocuments,
    clearCurrentClient: handleClearCurrentClient,
    setCurrentClient: handleSetCurrentClient,
    clearError: handleClearError,
  };
};

export default useClients;