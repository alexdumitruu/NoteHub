import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'react-bootstrap';
import { logout } from '../features/auth/authSlice';
import { clearNotes } from '../features/notes/notesSlice';
import { clearGroups } from '../features/groups/groupsSlice';
import { clearCourses } from '../features/courses/coursesSlice';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaEnvelope, FaCalendar, FaUser } from 'react-icons/fa';

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <div>
      <div className="page-header mb-4">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      <Row>
        <Col md={6}>
          <div className="profile-card">
            {/* Avatar */}
            <div className="text-center mb-4">
              <div className="profile-avatar mx-auto">
                {getInitials(user?.full_name)}
              </div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {user?.full_name}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Student
              </p>
            </div>

            <hr style={{ borderColor: 'var(--border-color)' }} />

            {/* Account Info */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '8px',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}
                >
                  <FaUser />
                </div>
                <div>
                  <div className="profile-label">Full Name</div>
                  <div className="profile-value" style={{ marginBottom: 0 }}>{user?.full_name}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mb-3">
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-green)'
                  }}
                >
                  <FaEnvelope />
                </div>
                <div>
                  <div className="profile-label">Email Address</div>
                  <div className="profile-value" style={{ marginBottom: 0 }}>{user?.email}</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-purple)'
                  }}
                >
                  <FaCalendar />
                </div>
                <div>
                  <div className="profile-label">Member Since</div>
                  <div className="profile-value" style={{ marginBottom: 0 }}>
                    {user?.createdAt || user?.created_at 
                      ? new Date(user.createdAt || user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-color)' }} />
            
            <Button 
              variant="outline-danger" 
              onClick={handleLogout} 
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              style={{ padding: '0.75rem' }}
            >
              <FaSignOutAlt />
              Log Out
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default ProfilePage;
