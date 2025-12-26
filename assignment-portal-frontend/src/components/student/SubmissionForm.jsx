import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon
} from '@mui/icons-material';
import dayjs from '../../utils/dayjs';
import api from '../../services/api';

const SubmissionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assignments/${id}`);
      setAssignment(response.data.data);
      
      // Check if already submitted
      const submissionsRes = await api.get('/submissions/my');
      const existingSubmission = submissionsRes.data.data.find(
        sub => sub.assignment._id === id
      );
      if (existingSubmission) {
        setHasSubmitted(true);
        setAnswer(existingSubmission.answer);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError('Please write your answer');
      return;
    }
    
    if (answer.trim().length < 10) {
      setError('Answer should be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      await api.post('/submissions', {
        assignmentId: id,
        answer: answer.trim()
      });
      
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
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

  if (error && !assignment) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!assignment) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Assignment not found
      </Alert>
    );
  }

  const isPastDue = dayjs(assignment.dueDate).isBefore(dayjs());

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/student/dashboard')}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {assignment.title}
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Assignment Description:
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {assignment.description}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Due: {dayjs(assignment.dueDate).format('MMMM DD, YYYY hh:mm A')}
              </Typography>
              {isPastDue && (
                <Typography variant="caption" color="error">
                  Submission Closed (Past due date)
                </Typography>
              )}
            </Box>
          </Paper>

          {hasSubmitted ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              You have already submitted this assignment. Here's your submission:
            </Alert>
          ) : isPastDue ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              This assignment is past its due date. Submissions are no longer accepted.
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Your Answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={hasSubmitted || isPastDue || submitting}
              placeholder="Type your answer here..."
              sx={{ mb: 2 }}
              required
            />
            
            <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
              {answer.length} characters (Minimum: 10)
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/student/dashboard')}
                disabled={submitting}
              >
                Cancel
              </Button>
              {!hasSubmitted && !isPastDue && (
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SendIcon />}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit Answer'}
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubmissionForm;