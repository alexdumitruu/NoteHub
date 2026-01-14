import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Nav, Button } from 'react-bootstrap';
import { logout } from '../../features/auth/authSlice';
import { clearNotes } from '../../features/notes/notesSlice';
import { clearGroups } from '../../features/groups/groupsSlice';
import { clearCourses } from '../../features/courses/coursesSlice';
import { 
  FaMoon, 
  FaSun, 
  FaHome, 
  FaStickyNote, 
  FaUsers, 
  FaGlobe, 
  FaUser,
  FaSignOutAlt,
  FaCog
} from 'react-icons/fa';

function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    // Clear all Redux state before logging out to prevent data leakage
    dispatch(clearNotes());
    dispatch(clearGroups());
    dispatch(clearCourses());
    dispatch(logout());
    navigate('/login');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="brand d-flex justify-content-between align-items-center">
        <h4>
          <span style={{ 
            background: 'linear-gradient(135deg, #4F6BF6, #6366F1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
          NoteHub
          </span>
        </h4>
        <Button 
          variant="link"
          className="p-1"
          onClick={toggleDarkMode}
          style={{ color: 'var(--text-muted)' }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </Button>
      </div>

      {/* User Info */}
      <div 
        className="user-info" 
        onClick={() => navigate('/profile')}
        style={{ cursor: 'pointer' }}
        title="Go to Profile"
      >
        <div className="user-avatar">
          {getInitials(user?.full_name)}
        </div>
        <div className="user-details">
          <div className="user-name">{user?.full_name || 'User'}</div>
          <div className="user-email">{user?.email}</div>
        </div>
      </div>

      {/* Navigation */}
      <Nav className="flex-column">
        <Nav.Link 
          as={NavLink} 
          to="/dashboard"
          className="nav-link"
        >
          <FaHome className="nav-icon" />
          Dashboard
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/notes"
          className="nav-link"
        >
          <FaStickyNote className="nav-icon" />
          My Notes
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/groups"
          className="nav-link"
        >
          <FaUsers className="nav-icon" />
          Study Groups
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/community"
          className="nav-link"
        >
          <FaGlobe className="nav-icon" />
          Community
        </Nav.Link>
        <Nav.Link 
          as={NavLink} 
          to="/profile"
          className="nav-link"
        >
          <FaUser className="nav-icon" />
          Profile
        </Nav.Link>
      </Nav>

      {/* Logout Button */}
      <div className="logout-section">
        <button 
          className="btn-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
