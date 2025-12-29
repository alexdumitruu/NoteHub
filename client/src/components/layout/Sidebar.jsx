import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Nav, Button } from 'react-bootstrap';
import { logout } from '../../features/auth/authSlice';

function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#0d6efd' : '#6c757d',
    backgroundColor: isActive ? '#e7f1ff' : 'transparent',
  });

  return (
    <div 
      className="d-flex flex-column bg-light border-end" 
      style={{ width: '250px', minHeight: '100vh' }}
    >
      {/* Brand */}
      <div className="p-3 border-bottom">
        <h4 className="mb-0 text-primary">📚 NoteHub</h4>
      </div>

      {/* User Info */}
      <div className="p-3 border-bottom">
        <p className="mb-0 fw-bold">{user?.full_name || 'User'}</p>
        <small className="text-muted">{user?.email}</small>
      </div>

      {/* Navigation */}
      <Nav className="flex-column p-2 flex-grow-1">
        <Nav.Link 
          as={NavLink} 
          to="/dashboard" 
          style={navLinkStyle}
          className="rounded mb-1"
        >
          🏠 Dashboard
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/notes" 
          style={navLinkStyle}
          className="rounded mb-1"
        >
          📝 My Notes
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/groups" 
          style={navLinkStyle}
          className="rounded mb-1"
        >
          👥 Study Groups
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/profile" 
          style={navLinkStyle}
          className="rounded mb-1"
        >
          👤 Profile
        </Nav.Link>
      </Nav>

      {/* Logout Button */}
      <div className="p-3 border-top">
        <Button 
          variant="outline-danger" 
          className="w-100"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;
