import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

const ErrorAlert = ({ error, onClose, title = 'Error' }) => {
  if (!error) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity="error"
        onClose={onClose}
        icon={<ErrorIcon />}
        sx={{ width: '100%' }}
      >
        <AlertTitle>{title}</AlertTitle>
        {error}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;