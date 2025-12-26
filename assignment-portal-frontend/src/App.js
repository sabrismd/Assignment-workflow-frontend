import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/auth/Login';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import AssignmentForm from './components/teacher/AssignmentForm';
import AssignmentDetails from './components/teacher/AssignmentDetails';
import SubmissionList from './components/teacher/SubmissionList';
import EditAssignment from './components/teacher/EditAssignment';
import SubmissionForm from './components/student/SubmissionForm';
import MySubmissions from './components/student/MySubmissions';
import Header from './components/shared/Header';
import PrivateRoute from './components/auth/PrivateRoute';
import { Box, Container } from '@mui/material';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {user && <Header />}
      <Container component="main" sx={{ flex: 1, py: 3 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Redirect root to login or dashboard */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={`/${user.role}/dashboard`} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Teacher routes */}
          <Route element={<PrivateRoute roles={['teacher']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/assignments/new" element={<AssignmentForm />} />
            <Route path="/teacher/assignments/:id" element={<AssignmentDetails />} />
            <Route path="/teacher/assignments/:id/edit" element={<EditAssignment />} />
            <Route path="/teacher/assignments/:id/submissions" element={<SubmissionList />} />
          </Route>
          
          {/* Student routes */}
          <Route element={<PrivateRoute roles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/assignments/:id/submit" element={<SubmissionForm />} />
            <Route path="/student/submissions" element={<MySubmissions />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
      
      {/* Footer */}
      {user && (
        <Box 
          component="footer" 
          sx={{ 
            py: 2, 
            px: 2, 
            mt: 'auto', 
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              <small>Assignment Portal v1.0 • {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</small>
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
}

export default App;