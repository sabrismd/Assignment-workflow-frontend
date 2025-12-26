import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from '../../utils/dayjs';
import api from '../../services/api';

const AssignmentForm = ({ onClose, onSuccess, initialData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate ? dayjs(initialData.dueDate) : dayjs().add(7, 'day'),
    status: initialData?.status || 'draft'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dueDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.dueDate || formData.dueDate.isBefore(dayjs())) {
      setError('Due date must be in the future');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate.toISOString(),
        status: formData.status
      };

      let response;
      if (initialData) {
        // Update existing assignment
        response = await api.put(`/assignments/${initialData._id}`, payload);
      } else {
        // Create new assignment
        response = await api.post('/assignments', payload);
      }

      if (onSuccess) {
        onSuccess(response.data.data);
      } else {
        navigate('/teacher/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            {initialData ? 'Edit Assignment' : 'Create New Assignment'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            required
            multiline
            rows={4}
            disabled={loading}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  required
                  disabled={loading}
                />
              )}
              minDate={dayjs()}
            />
          </LocalizationProvider>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {onClose && (
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : initialData ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssignmentForm;