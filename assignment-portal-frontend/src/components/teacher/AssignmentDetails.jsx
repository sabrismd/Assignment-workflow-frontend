import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Grid,
  Divider,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  DoneAll as DoneAllIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../../services/api';
import { ASSIGNMENT_STATUS_COLORS, ASSIGNMENT_STATUS_LABELS } from '../../utils/constants';

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assignments/${id}`);
      setAssignment(response.data.data);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load assignment';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      setActionLoading(true);
      await api.delete(`/assignments/${id}`);
      setSnackbar({ open: true, message: 'Assignment deleted successfully!', severity: 'success' });
      setTimeout(() => navigate('/teacher/dashboard'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete assignment';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
      setActionLoading(false);
    }
  };

const handleStatusChange = async (newStatus) => {
  try {
    setActionLoading(true);
    
    // Use the new status-only endpoint
    await api.put(`/assignments/${id}/status`, { status: newStatus });
    
    setSnackbar({ 
      open: true, 
      message: `Assignment ${newStatus} successfully!`, 
      severity: 'success' 
    });
    
    // Refresh assignment data
    fetchAssignment();
  } catch (err) {
    console.error('Status change error:', err);
    const errorMsg = err.response?.data?.message || `Failed to ${newStatus} assignment`;
    setSnackbar({ open: true, message: errorMsg, severity: 'error' });
  } finally {
    setActionLoading(false);
  }
};

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/teacher/dashboard')}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/teacher/dashboard')}
          sx={{ mb: 3 }}
        >
          Back to Dashboard
        </Button>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Assignment not found
        </Alert>
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
        onClick={() => navigate('/teacher/dashboard')}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {assignment.title}
              </Typography>
              <Chip
                label={ASSIGNMENT_STATUS_LABELS[assignment.status]}
                color={ASSIGNMENT_STATUS_COLORS[assignment.status]}
                size="medium"
                sx={{ fontSize: '0.9rem', fontWeight: 500 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {assignment.status === 'draft' && (
                <>
                  <Button
                    startIcon={<EditIcon />}
                    variant="outlined"
                    onClick={() => navigate(`/teacher/assignments/${id}/edit`)}
                    disabled={actionLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<PublishIcon />}
                    variant="contained"
                    color="success"
                    onClick={() => handleStatusChange('published')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <CircularProgress size={24} /> : 'Publish'}
                  </Button>
                  <Button
                    startIcon={<DeleteIcon />}
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                    disabled={actionLoading}
                  >
                    Delete
                  </Button>
                </>
              )}
              
              {assignment.status === 'published' && (
                <>
                  <Button
                    startIcon={<DoneAllIcon />}
                    variant="contained"
                    color="info"
                    onClick={() => handleStatusChange('completed')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <CircularProgress size={24} /> : 'Mark as Completed'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/teacher/assignments/${id}/submissions`)}
                  >
                    View Submissions
                  </Button>
                </>
              )}
              
              {assignment.status === 'completed' && (
                <Button
                  variant="outlined"
                  disabled
                >
                  Completed
                </Button>
              )}
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom fontWeight="500">
                Description
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {assignment.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom fontWeight="500">
                    📅 Due Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {dayjs(assignment.dueDate).format('dddd, MMMM DD, YYYY')}
                  </Typography>
                  <Typography variant="body2">
                    {dayjs(assignment.dueDate).format('hh:mm A')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom fontWeight="500">
                    📊 Timeline
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Created:</strong> {dayjs(assignment.createdAt).format('MMM DD, YYYY')}
                  </Typography>
                  {assignment.publishedAt && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Published:</strong> {dayjs(assignment.publishedAt).format('MMM DD, YYYY')}
                    </Typography>
                  )}
                  {assignment.completedAt && (
                    <Typography variant="body2">
                      <strong>Completed:</strong> {dayjs(assignment.completedAt).format('MMM DD, YYYY')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AssignmentDetails;