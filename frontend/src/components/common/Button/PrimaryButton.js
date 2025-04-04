import React from 'react';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

const PrimaryButton = ({ children, startIcon, endIcon, fullWidth, size, disabled, onClick, ...props }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={startIcon}
      endIcon={endIcon}
      fullWidth={fullWidth}
      size={size}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
};

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

PrimaryButton.defaultProps = {
  fullWidth: false,
  size: 'medium',
  disabled: false,
};

export default PrimaryButton;