import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';
import dayjs from '../../utils/dayjs';
import api from '../../services/api';

const SubmissionList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewDialog, setReviewDialog] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch assignment details
      const assignmentRes = await api.get(`/assignments/${id}`);
      setAssignment(assignmentRes.data.data);
      
      // Fetch submissions
      const submissionsRes = await api.get(`/assignments/${id}/submissions`);
      setSubmissions(submissionsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewToggle = (submission) => {
    setReviewDialog(submission);
    setFeedback(submission.feedback || '');
  };

  const handleReviewSubmit = async () => {
    if (!reviewDialog) return;

    try {
      setActionLoading(true);
      
      await api.put(`/submissions/${reviewDialog._id}`, {
        reviewed: !reviewDialog.reviewed,
        feedback: feedback
      });
      
      setReviewDialog(null);
      setFeedback('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewSubmission = (submissionId) => {
    navigate(`/teacher/submissions/${submissionId}`);
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
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/teacher/assignments/${id}`)}
        sx={{ mb: 3 }}
      >
        Back to Assignment
      </Button>

      {assignment && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {assignment.title} - Submissions ({submissions.length})
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Due: {dayjs(assignment.dueDate).format('MMMM DD, YYYY')}
            </Typography>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Answer Preview</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary" sx={{ py: 3 }}>
                        No submissions yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>
                        <Typography variant="body2">
                          {submission.student?.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {submission.student?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {dayjs(submission.submittedAt).format('MMM DD, hh:mm A')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {submission.answer.substring(0, 100)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={submission.reviewed ? 'Reviewed' : 'Pending'}
                          color={submission.reviewed ? 'success' : 'warning'}
                          icon={submission.reviewed ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewSubmission(submission._id)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant={submission.reviewed ? "outlined" : "contained"}
                            color={submission.reviewed ? "secondary" : "primary"}
                            onClick={() => handleReviewToggle(submission)}
                          >
                            {submission.reviewed ? 'Unmark' : 'Mark Reviewed'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog 
        open={Boolean(reviewDialog)} 
        onClose={() => setReviewDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {reviewDialog && (
          <>
            <DialogTitle>
              Review Submission - {reviewDialog.student?.name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Submitted Answer:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {reviewDialog.answer}
                  </Typography>
                </Paper>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Feedback (Optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={actionLoading}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReviewDialog(null)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button 
                onClick={handleReviewSubmit} 
                variant="contained"
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={24} /> : reviewDialog.reviewed ? 'Mark as Pending' : 'Mark as Reviewed'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SubmissionList;