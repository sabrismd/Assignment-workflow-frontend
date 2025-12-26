import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Done as DoneIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import dayjs from '../../utils/dayjs';
import api from '../../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assignments/student');
      setAssignments(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (tabValue === 0) return !assignment.hasSubmitted;
    if (tabValue === 1) return assignment.hasSubmitted;
    return true;
  });

  const getTimeRemaining = (dueDate) => {
    const now = dayjs();
    const due = dayjs(dueDate);
    const diffDays = due.diff(now, 'day');
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    return `Due ${due.format('MMM DD')}`;
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
      <Typography variant="h4" component="h1" gutterBottom>
        Student Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Available (${assignments.filter(a => !a.hasSubmitted).length})`} />
            <Tab label={`Submitted (${assignments.filter(a => a.hasSubmitted).length})`} />
            <Tab label={`All (${assignments.length})`} />
          </Tabs>
        </CardContent>
      </Card>

      {filteredAssignments.length === 0 ? (
        <Alert severity="info">
          {tabValue === 0 
            ? 'No available assignments at the moment.' 
            : tabValue === 1
            ? 'You haven\'t submitted any assignments yet.'
            : 'No assignments found.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredAssignments.map((assignment) => (
            <Grid item xs={12} md={6} lg={4} key={assignment._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {assignment.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={assignment.hasSubmitted ? 'Submitted' : 'Pending'}
                        color={assignment.hasSubmitted ? 'success' : 'warning'}
                        icon={assignment.hasSubmitted ? <DoneIcon /> : <AccessTimeIcon />}
                      />
                    </Box>
                    <AssignmentIcon color="action" />
                  </Box>

                  <Typography variant="body2" color="textSecondary" paragraph>
                    {assignment.description.substring(0, 100)}...
                  </Typography>

                  <Box sx={{ mt: 'auto' }}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      {getTimeRemaining(assignment.dueDate)}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Due: {dayjs(assignment.dueDate).format('MMM DD, YYYY hh:mm A')}
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  {assignment.hasSubmitted ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(`/student/submissions/${assignment.submissionId}`)}
                    >
                      View Submission
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/student/assignments/${assignment._id}/submit`)}
                      disabled={dayjs(assignment.dueDate).isBefore(dayjs())}
                    >
                      {dayjs(assignment.dueDate).isBefore(dayjs()) 
                        ? 'Submission Closed' 
                        : 'Submit Answer'}
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StudentDashboard;