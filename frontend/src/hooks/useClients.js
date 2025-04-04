import { useSelector, useDispatch } from 'react-redux';
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

const useClients = () => {
  const dispatch = useDispatch();
  const { clients, currentClient, clientDocuments, error } = useSelector((state) => state.clients);
  
  const handleGetClients = async () => {
    return dispatch(getClients()).unwrap();
  };
  
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
    getClientById: handleGetClientById,
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