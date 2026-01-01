import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { fetchGroups, createGroup, clearError } from '../features/groups/groupsSlice';
import Loading from '../components/common/Loading';
import { FaPlus, FaArrowRight, FaCrown, FaUsers, FaEllipsisH } from 'react-icons/fa';

function GroupsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { memberOf, adminOf, isLoading, error } = useSelector((state) => state.groups);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const result = await dispatch(createGroup(formData));
    if (createGroup.fulfilled.match(result)) {
      setShowModal(false);
      setFormData({ name: '', description: '' });
    }
  };

  // Get initials for group avatar
  const getInitials = (name) => {
    if (!name) return 'G';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Color variants for group cards
  const avatarColors = ['purple', 'blue', 'green', 'coral'];
  const getAvatarColor = (index) => avatarColors[index % avatarColors.length];

  if (isLoading && memberOf.length === 0 && adminOf.length === 0) {
    return <Loading message="Loading groups..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="page-header">
          <h1 className="page-title">Study Groups</h1>
          <p className="page-subtitle">Manage your groups and collaborate with peers.</p>
        </div>
        <Button 
          variant="primary" 
          className="d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Create Group
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
          {error}
        </Alert>
      )}

      {/* Groups I Manage */}
      <div className="mb-4">
        <h5 className="mb-3">
          <FaCrown className="me-2" style={{ color: '#F59E0B' }} />
          Groups I Manage
        </h5>
        {adminOf.length === 0 ? (
          <div className="group-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>You don't manage any groups yet</p>
          </div>
        ) : (
          <Row className="g-3">
            {adminOf.map((group, index) => (
              <Col md={4} key={group.id}>
                <div className="group-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className={`group-avatar ${getAvatarColor(index)}`}>
                      {getInitials(group.name)}
                    </div>
                    <Badge bg="success" pill>Active</Badge>
                  </div>
                  <h5 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{group.name}</h5>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {group.description || 'No description'}
                  </p>
                  <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="d-flex align-items-center gap-1">
                      {/* Member avatars placeholder */}
                      <div className="d-flex" style={{ marginLeft: '-8px' }}>
                        {[0, 1, 2].map(i => (
                          <div 
                            key={i} 
                            className={`member-avatar gradient-${(i % 5) + 1}`}
                            style={{ width: '28px', height: '28px', fontSize: '0.6rem', marginLeft: '-8px', border: '2px solid var(--bg-secondary)' }}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>+3</span>
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Groups I'm In */}
      <div className="mb-4">
        <h5 className="mb-3">
          <FaUsers className="me-2" style={{ color: 'var(--primary)' }} />
          Groups I'm In
        </h5>
        {memberOf.length === 0 ? (
          <div className="group-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>You haven't joined any groups yet</p>
          </div>
        ) : (
          <Row className="g-3">
            {memberOf.map((group, index) => (
              <Col md={4} key={group.id}>
                <div className="group-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className={`group-avatar ${getAvatarColor(index + 2)}`}>
                      {getInitials(group.name)}
                    </div>
                    <Button variant="link" size="sm" style={{ color: 'var(--text-muted)', padding: 0 }}>
                      <FaEllipsisH />
                    </Button>
                  </div>
                  <h5 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{group.name}</h5>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {group.description || 'No description'}
                  </p>
                  <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', marginRight: '6px' }}></span>
                      Online
                    </span>
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="d-flex align-items-center gap-1"
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      Enter <FaArrowRight />
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
            
            {/* Join New Group Card */}
            <Col md={4}>
              <div 
                className="group-card" 
                style={{ 
                  border: '2px dashed var(--border-color)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '180px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowModal(true)}
              >
                <div 
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: 'var(--border-radius-sm)', 
                    background: 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}
                >
                  <FaPlus style={{ color: 'var(--text-muted)' }} />
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Join new group</span>
              </div>
            </Col>
          </Row>
        )}
      </div>

      {/* Create Group Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Study Group</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateGroup}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Web Technologies Study Group"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What is this group about?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Group'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default GroupsPage;
