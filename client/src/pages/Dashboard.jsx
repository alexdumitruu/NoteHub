import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { fetchNotes } from '../features/notes/notesSlice';
import { fetchGroups } from '../features/groups/groupsSlice';
import Loading from '../components/common/Loading';
import { FaPlus, FaUsers, FaFileUpload, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: notes, isLoading: notesLoading } = useSelector((state) => state.notes);
  const { memberOf, adminOf, isLoading: groupsLoading } = useSelector((state) => state.groups);

  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchGroups());
  }, [dispatch]);

  if (notesLoading || groupsLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  const recentNotes = notes.slice(0, 5);
  const allGroupIds = new Set([...memberOf.map(g => g.id), ...adminOf.map(g => g.id)]);
  const totalGroups = allGroupIds.size;
  const publicNotes = notes.filter(n => n.is_public).length;

  // Color variants for note cards
  const borderColors = ['primary', 'green', 'purple', 'coral', 'yellow'];
  const getBorderColor = (index) => borderColors[index % borderColors.length];

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="page-subtitle">Here's what's happening with your notes today.</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            className="d-flex align-items-center gap-2"
          >
            🔍 Search
          </Button>
          <Button 
            variant="primary" 
            className="d-flex align-items-center gap-2"
            onClick={() => navigate('/notes/new')}
          >
            <FaPlus /> New Note
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-4">
        <Col md={4}>
          <div className="stats-card primary">
            <div className="stats-number">{notes.length}</div>
            <div className="stats-label">Total Notes</div>
            <div className="stats-icon">📝</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="stats-card green">
            <div className="stats-number">{totalGroups}</div>
            <div className="stats-label">Study Groups</div>
            <div className="stats-icon">👥</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="stats-card yellow">
            <div className="stats-number">{adminOf.length}</div>
            <div className="stats-label">Groups You Admin</div>
            <div className="stats-icon">👑</div>
          </div>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="mb-4">
        <h5 className="mb-3">⚡ Quick Actions</h5>
        <div className="quick-actions">
          <Button 
            variant="primary" 
            className="quick-action-btn"
            onClick={() => navigate('/notes/new')}
          >
            <FaPlus /> Create Note
          </Button>
          <Button 
            variant="success" 
            className="quick-action-btn"
            onClick={() => navigate('/groups')}
          >
            <FaUsers /> View Groups
          </Button>
          <Button 
            variant="outline-secondary" 
            className="quick-action-btn"
            onClick={() => navigate('/notes/new')}
          >
            <FaFileUpload /> Upload PDF
          </Button>
        </div>
      </div>

      {/* Recent Notes */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Recent Notes</h5>
          <Link to="/notes" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="note-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              No notes yet. Create your first note!
            </p>
            <Button variant="primary" onClick={() => navigate('/notes/new')}>
              <FaPlus className="me-2" /> Create Note
            </Button>
          </div>
        ) : (
          recentNotes.map((note, index) => (
            <div 
              key={note.id} 
              className={`note-card ${getBorderColor(index)}`}
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="note-title">{note.title}</div>
                  <div className="note-meta">
                    Course: {note.Course?.name || 'None'} • Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-2">
                      {note.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className={`tag ${['primary', 'coral', 'green'][i % 3]}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="d-flex flex-column align-items-end gap-2">
                  {note.is_public && (
                    <span className="badge-public">Public</span>
                  )}
                  {note.Attachments && note.Attachments.length > 0 && (
                    <Badge bg="info" pill>
                      <FaEye className="me-1" /> {note.Attachments.length}
                    </Badge>
                  )}
                  <div className="d-flex gap-1">
                    <Button 
                      variant="link" 
                      size="sm" 
                      style={{ color: 'var(--text-muted)' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/notes/${note.id}`); }}
                    >
                      <FaEdit />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
