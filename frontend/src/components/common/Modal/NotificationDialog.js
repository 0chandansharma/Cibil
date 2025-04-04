import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const NotificationDialog = ({
  open,
  onClose,
  title,
  content,
  buttonText,
  severity,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="notification-dialog-title"
      aria-describedby="notification-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="notification-dialog-title" sx={{ m: 0, p: 2 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="notification-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color={severity || 'primary'} autoFocus>
          {buttonText || 'OK'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NotificationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  severity: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
};

export default NotificationDialog;