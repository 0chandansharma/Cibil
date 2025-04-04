import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const FormDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  submitText,
  cancelText,
  maxWidth,
  fullWidth,
  disabled,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogTitle id="form-dialog-title" sx={{ m: 0, p: 2 }}>
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
      <form onSubmit={onSubmit}>
        <DialogContent dividers>{children}</DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            {cancelText}
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={disabled}>
            {submitText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

FormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
};

FormDialog.defaultProps = {
  submitText: 'Submit',
  cancelText: 'Cancel',
  maxWidth: 'sm',
  fullWidth: true,
  disabled: false,
};

export default FormDialog;