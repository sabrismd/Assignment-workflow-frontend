import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleClose();
  };

  const handleDashboard = () => {
    navigate(`/${user.role}/dashboard`);
    handleClose();
  };

  const handleProfile = () => {
    // Navigate to profile page (to be implemented)
    handleClose();
  };

  const getDashboardTitle = () => {
    if (user.role === 'teacher') {
      return 'Teacher Dashboard';
    } else {
      return 'Student Dashboard';
    }
  };

  const getNavItems = () => {
    if (user.role === 'teacher') {
      return [
        { label: 'Dashboard', path: '/teacher/dashboard' },
        { label: 'New Assignment', path: '/teacher/assignments/new' },
      ];
    } else {
      return [
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'My Submissions', path: '/student/submissions' },
      ];
    }
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <AssignmentIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Assignment Portal
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          {getNavItems().map((item) => (
            <Button
              key={item.label}
              color="inherit"
              onClick={() => navigate(item.path)}
              startIcon={item.label === 'Dashboard' ? <DashboardIcon /> : <AssignmentIcon />}
            >
              {item.label}
            </Button>
          ))}
          
          <Chip
            label={user.role.toUpperCase()}
            color={user.role === 'teacher' ? 'primary' : 'secondary'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Tooltip title="Account settings">
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleDashboard}>
              <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
              {getDashboardTitle()}
            </MenuItem>
            <MenuItem onClick={handleProfile}>
              <PersonIcon sx={{ mr: 1 }} fontSize="small" />
              My Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;