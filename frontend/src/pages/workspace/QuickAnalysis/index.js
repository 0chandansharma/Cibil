import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Divider,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Upload as UploadIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import DocumentViewer from '../../../components/analysis/DocumentViewer';
import CibilCalculator from '../../../components/analysis/CibilCalculator';
import Summary from '../../../components/analysis/Summary';
import TableView from '../../../components/analysis/TableView';
import ChatInterface from '../../../components/analysis/ChatInterface';
import useDocuments from '../../../hooks/useDocuments';

const QuickAnalysis = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const documentIdParam = queryParams.get('documentId');
  
  const {
    uploadDocument,
    getDocumentById,
    processDocument,
    currentDocument,
    analysisResults,
    setCurrentDocument,
    clearCurrentDocument,
  } = useDocuments();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  useEffect(() => {
    if (documentIdParam) {
      getDocumentById(documentIdParam);
    } else {
      clearCurrentDocument();
    }
    
    return () => {
      clearCurrentDocument();
    };
  }, [documentIdParam, getDocumentById, clearCurrentDocument]);
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
    },
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleFileSelect = (file) => {
    // Set the selected file as the current document
  };
  
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;
    
    try {
      const response = await uploadDocument({
        file: uploadedFiles[0],
        title: uploadedFiles[0].name,
      });
      
      // Clear uploaded files after successful upload
      setUploadedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  const handleProcess = async () => {
    if (!currentDocument) return;
    
    try {
      setIsProcessing(true);
      await processDocument(currentDocument.id);
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const renderTabContent = () => {
    if (!analysisResults) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No analysis results available
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {currentDocument
              ? 'Please process the document to view analysis results.'
              : 'Please upload and process a document to view analysis results.'}
          </Typography>
        </Box>
      );
    }
    
    switch (activeTab) {
      case 0:
        return <CibilCalculator documentId={currentDocument.id} />;
      case 1:
        return <Summary documentId={currentDocument.id} />;
      case 2:
        return <TableView documentId={currentDocument.id} />;
      case 3:
        return <ChatInterface documentId={currentDocument.id} />;
      default:
        return null;
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quick Analysis
      </Typography>
      
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 180px)' }}>
        {/* Left Sidebar */}
        <Grid
          item
          xs={sidebarOpen ? 3 : 1}
          sx={{
            transition: 'all 0.3s ease',
            height: '100%',
          }}
        >
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: 0,
                transform: 'translateY(-50%)',
                zIndex: 10,
              }}
            >
              <IconButton onClick={handleToggleSidebar}>
                {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </Box>
            
            {sidebarOpen && (
              <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Documents
                </Typography>
                
                {/* Dropzone */}
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 3,
                    mb: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <input {...getInputProps()} />
                  <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2">
                    Drag & drop files here, or click to select files
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports PDF, JPG, PNG
                  </Typography>
                </Box>
                
                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Uploaded Files ({uploadedFiles.length})
                    </Typography>
                    {uploadedFiles.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: 'background.default',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                          {file.name}
                        </Typography>
                      </Box>
                    ))}
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={handleUpload}
                      fullWidth
                    >
                      Upload
                    </Button>
                  </Box>
                )}
                
                {/* Document Thumbnails */}
                {currentDocument && (
                  <Box
                    sx={{
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {currentDocument.title}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Document Viewer */}
        <Grid
          item
          xs={sidebarOpen ? 5 : 6}
          sx={{
            transition: 'all 0.3s ease',
            height: '100%',
          }}
        >
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {currentDocument ? (
              <>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" noWrap>
                    {currentDocument.title}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  <DocumentViewer document={currentDocument} />
                </Box>
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Button
                    variant="contained"
                    startIcon={isProcessing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                    onClick={handleProcess}
                    disabled={isProcessing || currentDocument.status === 'processing' || currentDocument.status === 'completed'}
                    fullWidth
                  >
                    {isProcessing
                      ? 'Processing...'
                      : currentDocument.status === 'completed'
                      ? 'Processed'
                      : currentDocument.status === 'processing'
                      ? 'Processing...'
                      : 'Process Document'}
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  p: 3,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No document selected
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Please upload a document or select one from the sidebar.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Analysis Results */}
        <Grid
          item
          xs={sidebarOpen ? 4 : 5}
          sx={{
            transition: 'all 0.3s ease',
            height: '100%',
          }}
        >
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="CIBIL Score" />
                <Tab label="Summary" />
                <Tab label="Tables" />
                <Tab label="Chat" />
              </Tabs>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              {renderTabContent()}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuickAnalysis;