import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchNotes } from '../features/notes/notesSlice';
import { fetchGroups } from '../features/groups/groupsSlice';
import Loading from '../components/common/Loading';

function Dashboard() {
  const dispatch = useDispatch();
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
  const totalGroups = memberOf.length + adminOf.length;

  return (
    <div>
      <h1 className="mb-4">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋</h1>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <h2 className="text-primary">{notes.length}</h2>
              <p className="text-muted mb-0">Total Notes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <h2 className="text-success">{totalGroups}</h2>
              <p className="text-muted mb-0">Study Groups</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <h2 className="text-info">{adminOf.length}</h2>
              <p className="text-muted mb-0">Groups You Admin</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">Quick Actions</h5>
              <div className="d-flex gap-2">
                <Button as={Link} to="/notes/new" variant="primary">
                  ➕ Create Note
                </Button>
                <Button as={Link} to="/groups" variant="outline-primary">
                  👥 View Groups
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Notes */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Recent Notes</h5>
                <Link to="/notes">View all →</Link>
              </div>
              
              {recentNotes.length === 0 ? (
                <p className="text-muted">No notes yet. Create your first note!</p>
              ) : (
                <div className="list-group list-group-flush">
                  {recentNotes.map((note) => (
                    <Link 
                      key={note.id} 
                      to={`/notes/${note.id}`}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-0">{note.title}</h6>
                        <small className="text-muted">
                          {note.Course?.name || 'No course'} • {new Date(note.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      {note.is_public && (
                        <span className="badge bg-success">Public</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
