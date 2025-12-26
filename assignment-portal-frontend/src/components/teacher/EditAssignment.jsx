import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import api from '../../services/api';

const EditAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: null
  });

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assignments/${id}`);
      const assignment = response.data.data;
      
      setFormData({
        title: assignment.title,
        description: assignment.description,
        dueDate: dayjs(assignment.dueDate)
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

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
    
    if (!formData.dueDate) {
      setError('Due date is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const payload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate.toISOString()
      };

      await api.put(`/assignments/${id}`, payload);
      
      setSnackbar({ 
        open: true, 
        message: 'Assignment updated successfully!', 
        severity: 'success' 
      });
      
      setTimeout(() => {
        navigate(`/teacher/assignments/${id}`);
      }, 1000);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update assignment';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/teacher/assignments/${id}`)}
        sx={{ mb: 3 }}
      >
        Back to Assignment
      </Button>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" gutterBottom>
              Edit Assignment
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
              disabled={submitting}
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
              rows={6}
              disabled={submitting}
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
                    disabled={submitting}
                  />
                )}
                minDate={dayjs()}
              />
            </LocalizationProvider>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/teacher/assignments/${id}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Update Assignment'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditAssignment;