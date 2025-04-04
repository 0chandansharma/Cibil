import React from 'react';
import { TextField as MuiTextField, FormHelperText } from '@mui/material';
import PropTypes from 'prop-types';

const TextField = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  type,
  fullWidth,
  required,
  disabled,
  placeholder,
  multiline,
  rows,
  variant,
  ...props
}) => {
  return (
    <>
      <MuiTextField
        id={id}
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={Boolean(error)}
        type={type}
        fullWidth={fullWidth}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        multiline={multiline}
        rows={rows}
        variant={variant}
        {...props}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
    </>
  );
};

TextField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  type: PropTypes.string,
  fullWidth: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
};

TextField.defaultProps = {
  type: 'text',
  fullWidth: true,
  required: false,
  disabled: false,
  multiline: false,
  variant: 'outlined',
};

export default TextField;