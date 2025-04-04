import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import PropTypes from 'prop-types';
import api from '../../../services/api';
import { isPdfFile, isImageFile } from '../../../utils/helpers';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentViewer = ({ document }) => {
  const [numPages, setNumPages] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDocumentUrl = async () => {
      if (!document) return;
      
      try {
        setLoading(true);
        // In a real implementation, this would fetch the document URL from the API
        // For demo purposes, we'll use a placeholder URL
        if (isPdfFile(document.title)) {
          setDocumentUrl('https://arxiv.org/pdf/2104.13478.pdf');
        } else if (isImageFile(document.title)) {
          setDocumentUrl('https://via.placeholder.com/800x1000');
        } else {
          setDocumentUrl(null);
          setError('Unsupported file format');
        }
      } catch (error) {
        console.error('Error fetching document URL:', error);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentUrl();
  }, [document]);
  
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  if (!documentUrl) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>No document available</Typography>
      </Box>
    );
  }
  
  if (isPdfFile(document.title)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Document
          file={documentUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          }
          error={
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Typography color="error">Failed to load PDF</Typography>
            </Box>
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Box key={`page_${index + 1}`} sx={{ mb: 2 }}>
              <Page
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={600}
              />
            </Box>
          ))}
        </Document>
      </Box>
    );
  }
  
  if (isImageFile(document.title)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <img
          src={documentUrl}
          alt={document.title}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Typography>Unsupported file format</Typography>
    </Box>
  );
};

DocumentViewer.propTypes = {
  document: PropTypes.object.isRequired,
};

export default DocumentViewer;