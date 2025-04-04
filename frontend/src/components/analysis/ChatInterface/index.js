import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import analysisService from '../../../services/analysisService';
import { formatDate } from '../../../utils/formatters';

const ChatInterface = ({ documentId }) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I've analyzed this document. Ask me anything about its contents.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // In a real implementation, this would send the message to the API
      const response = await analysisService.chatWithDocument(documentId, input);
      
      // For demo purposes, simulate a response
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: response?.message || generateDemoResponse(input),
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botResponse]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };
  
  const generateDemoResponse = (question) => {
    const responses = [
      "Based on the financial statements, the company's revenue increased by 16.3% compared to the previous year.",
      "The company's net profit margin is 20%, which is higher than the industry average of 15%.",
      "The current ratio is 2.5, indicating good short-term financial health.",
      "The debt-to-equity ratio is 0.6, which is lower than last year's 0.8, showing improved financial stability.",
      "The return on assets (ROA) is 12.5%, which is a positive indicator of efficient asset utilization.",
      "According to the income statement, operating expenses increased by 11.1% compared to the previous year.",
      "The company's cash flow from operations is positive, indicating healthy business operations.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Chat with Document
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Ask questions about the document content and get AI-powered responses.
      </Typography>
      
      <Paper
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          mb: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              {message.sender === 'bot' && (
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                    mr: 1,
                  }}
                >
                  <BotIcon fontSize="small" />
                </Avatar>
              )}
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: message.sender === 'user' ? 'primary.main' : 'background.default',
                  color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                  border: message.sender === 'bot' ? 1 : 0,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    textAlign: 'right',
                    color: message.sender === 'user' ? 'primary.light' : 'text.secondary',
                  }}
                >
                  {formatDate(message.timestamp, 'HH:mm')}
                </Typography>
              </Box>
              {message.sender === 'user' && (
                <Avatar
                  sx={{
                    ml: 1,
                    width: 32,
                    height: 32,
                  }}
                >
                  {message.sender.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </Box>
          ))}
          {loading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                mb: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 32,
                  height: 32,
                  mr: 1,
                }}
              >
                <BotIcon fontSize="small" />
              </Avatar>
              <CircularProgress size={20} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleSendMessage}>
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask a question about the document..."
                value={input}
                onChange={handleInputChange}
                disabled={loading}
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                disabled={loading || !input.trim()}
                sx={{ ml: 1 }}
              >
                Send
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

ChatInterface.propTypes = {
  documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ChatInterface;