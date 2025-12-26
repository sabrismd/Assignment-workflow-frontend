import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Button,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import dayjs from '../../utils/dayjs';
import api from '../../services/api';

const MySubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/submissions/my');
      setSubmissions(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submissionId) => {
    navigate(`/student/submissions/${submissionId}`);
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
        onClick={() => navigate('/student/dashboard')}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        My Submissions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {submissions.length === 0 ? (
        <Alert severity="info">
          You haven't submitted any assignments yet.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Feedback</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {submission.assignment?.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {submission.assignment?.description?.substring(0, 50)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {dayjs(submission.submittedAt).format('MMM DD, YYYY hh:mm A')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={submission.reviewed ? 'Reviewed' : 'Pending Review'}
                          color={submission.reviewed ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          maxWidth: '200px', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {submission.feedback || 'No feedback yet'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewSubmission(submission._id)}
                          title="View Submission"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MySubmissions;