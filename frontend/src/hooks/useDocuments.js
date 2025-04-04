import { useSelector, useDispatch } from 'react-redux';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  processDocument,
  deleteDocument,
  clearCurrentDocument,
  setCurrentDocument,
  clearError,
} from '../store/slices/documentSlice';

const useDocuments = () => {
  const dispatch = useDispatch();
  const { documents, currentDocument, analysisResults, error } = useSelector((state) => state.documents);
  
  const handleUploadDocument = async (documentData) => {
    return dispatch(uploadDocument(documentData)).unwrap();
  };
  
  const handleGetDocuments = async () => {
    return dispatch(getDocuments()).unwrap();
  };
  
  const handleGetDocumentById = async (id) => {
    return dispatch(getDocumentById(id)).unwrap();
  };
  
  const handleProcessDocument = async (id) => {
    return dispatch(processDocument(id)).unwrap();
  };
  
  const handleDeleteDocument = async (id) => {
    return dispatch(deleteDocument(id)).unwrap();
  };
  
  const handleClearCurrentDocument = () => {
    dispatch(clearCurrentDocument());
  };
  
  const handleSetCurrentDocument = (document) => {
    dispatch(setCurrentDocument(document));
  };
  
  const handleClearError = () => {
    dispatch(clearError());
  };
  
  return {
    documents,
    currentDocument,
    analysisResults,
    error,
    uploadDocument: handleUploadDocument,
    getDocuments: handleGetDocuments,
    getDocumentById: handleGetDocumentById,
    processDocument: handleProcessDocument,
    deleteDocument: handleDeleteDocument,
    clearCurrentDocument: handleClearCurrentDocument,
    setCurrentDocument: handleSetCurrentDocument,
    clearError: handleClearError,
  };
};

export default useDocuments;