import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  LinearProgress, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton,
  Paper
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { 
  CloudUpload as CloudUploadIcon, 
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { formatFileSize } from '../../../utils/formatters';

const DocumentUpload = ({ onUpload, maxFiles, acceptedFileTypes, maxFileSize }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedFileTypes || {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: maxFiles || 10,
    maxSize: maxFileSize || 10485760, // 10MB
    onDrop: (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
    },
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        const { file, errors } = rejection;
        
        errors.forEach((error) => {
          let message = '';
          
          switch (error.code) {
            case 'file-too-large':
              message = `File is too large. Max size is ${formatFileSize(maxFileSize || 10485760)}`;
              break;
            case 'file-invalid-type':
              message = 'Invalid file type. Only PDF and image files are allowed.';
              break;
            case 'too-many-files':
              message = `Too many files. Max ${maxFiles || 10} files allowed.`;
              break;
            default:
              message = error.message;
          }
          
          console.error(`Error with file ${file.name}: ${message}`);
        });
      });
    },
  });
  
  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const timer = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 500);
      
      // Call the onUpload callback with the files
      await onUpload(files);
      
      // Clear files after successful upload
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 1,
          p: 3,
          mb: 2,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to select files
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Supports PDF, JPG, PNG (max {formatFileSize(maxFileSize || 10485760)})
        </Typography>
      </Box>
      
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          <List dense>
            {files.map((file, index) => (
              <ListItem key={index}>
                <FileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveFile(index)} disabled={uploading}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          {uploading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            fullWidth
            sx={{ mt: 2 }}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

DocumentUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  acceptedFileTypes: PropTypes.object,
  maxFileSize: PropTypes.number,
};

export default DocumentUpload;