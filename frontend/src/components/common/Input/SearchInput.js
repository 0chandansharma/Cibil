import React from 'react';
import { InputBase, Paper, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const SearchInput = ({ value, onChange, onClear, placeholder, fullWidth }) => {
  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 400,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      }}
    >
      <IconButton sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {value && (
        <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={onClear}>
          <ClearIcon />
        </IconButton>
      )}
    </Paper>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  fullWidth: PropTypes.bool,
};

SearchInput.defaultProps = {
  placeholder: 'Search...',
  fullWidth: false,
};

export default SearchInput;