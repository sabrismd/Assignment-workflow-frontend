import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AssignmentForm from './AssignmentForm';
import { ASSIGNMENT_STATUS_COLORS, ASSIGNMENT_STATUS_LABELS } from '../../utils/constants';

const TeacherDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const statusFilters = ['draft', 'published', 'completed'];

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const status = statusFilters[tabValue];
      const response = await api.get(`/assignments/teacher${status ? `?status=${status}` : ''}`);
      setAssignments(response.data.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showSnackbar('Failed to load assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [tabValue]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAssignmentCreated = () => {
    setShowForm(false);
    showSnackbar('Assignment created successfully!');
    fetchAssignments();
  };

  const handleStatusChange = async (assignmentId, newStatus) => {
  try {
    setActionLoading(assignmentId);
    
    // Use the new status-only endpoint
    await api.put(`/assignments/${assignmentId}/status`, { status: newStatus });
    
    showSnackbar(`Assignment ${newStatus} successfully!`);
    fetchAssignments();
  } catch (error) {
    console.error('Status change error:', error);
    const errorMsg = error.response?.data?.message || `Failed to ${newStatus} assignment`;
    showSnackbar(errorMsg, 'error');
  } finally {
    setActionLoading(null);
  }
};
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      setActionLoading(assignmentId);
      await api.delete(`/assignments/${assignmentId}`);
      showSnackbar('Assignment deleted successfully!');
      fetchAssignments();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete assignment';
      showSnackbar(errorMsg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getActionButtons = (assignment) => {
    const isLoading = actionLoading === assignment._id;

    switch (assignment.status) {
      case 'draft':
        return (
          <>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/teacher/assignments/${assignment._id}`)}
              disabled={isLoading}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => handleStatusChange(assignment._id, 'published')}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Publish'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => handleDeleteAssignment(assignment._id)}
              disabled={isLoading}
            >
              Delete
            </Button>
          </>
        );
      
      case 'published':
        return (
          <>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/teacher/assignments/${assignment._id}`)}
              disabled={isLoading}
            >
              View
            </Button>
            <Button
              size="small"
              variant="contained"
              color="info"
              onClick={() => handleStatusChange(assignment._id, 'completed')}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Complete'}
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => navigate(`/teacher/assignments/${assignment._id}/submissions`)}
              disabled={isLoading}
            >
              Submissions ({assignment.submissionCount || 0})
            </Button>
          </>
        );
      
      case 'completed':
        return (
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`/teacher/assignments/${assignment._id}`)}
          >
            View
          </Button>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Teacher Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
        >
          New Assignment
        </Button>
      </Box>

      {showForm && (
        <Box sx={{ mb: 3 }}>
          <AssignmentForm
            onClose={() => setShowForm(false)}
            onSuccess={handleAssignmentCreated}
          />
        </Box>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
            <Tab label={`Draft (${assignments.filter(a => a.status === 'draft').length})`} />
            <Tab label={`Published (${assignments.filter(a => a.status === 'published').length})`} />
            <Tab label={`Completed (${assignments.filter(a => a.status === 'completed').length})`} />
          </Tabs>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent>
            <Typography textAlign="center" color="textSecondary" py={3}>
              No {statusFilters[tabValue]} assignments found.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {assignments.map((assignment) => (
            <Grid item xs={12} md={6} lg={4} key={assignment._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1, mr: 1, fontWeight: 600 }}>
                      {assignment.title}
                    </Typography>
                    <Chip
                      label={ASSIGNMENT_STATUS_LABELS[assignment.status]}
                      color={ASSIGNMENT_STATUS_COLORS[assignment.status]}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" paragraph sx={{ mb: 2 }}>
                    {assignment.description.length > 100 
                      ? `${assignment.description.substring(0, 100)}...` 
                      : assignment.description}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Typography variant="caption" display="block" gutterBottom>
                      <strong>Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()}
                    </Typography>
                    {assignment.status === 'published' && (
                      <Typography variant="caption" display="block" color="primary">
                        <strong>Submissions:</strong> {assignment.submissionCount || 0}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                
                <CardContent sx={{ pt: 0 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {getActionButtons(assignment)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TeacherDashboard;