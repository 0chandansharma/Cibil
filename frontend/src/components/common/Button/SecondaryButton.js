import React from 'react';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

const SecondaryButton = ({ children, startIcon, endIcon, fullWidth, size, disabled, onClick, ...props }) => {
  return (
    <Button
      variant="outlined"
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

SecondaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

SecondaryButton.defaultProps = {
  fullWidth: false,
  size: 'medium',
  disabled: false,
};

export default SecondaryButton;