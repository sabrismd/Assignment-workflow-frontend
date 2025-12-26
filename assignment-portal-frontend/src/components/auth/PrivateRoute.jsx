import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ roles }) => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;