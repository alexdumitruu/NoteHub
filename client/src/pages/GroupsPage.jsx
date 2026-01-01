import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, ListGroup, Modal, Form, Alert } from 'react-bootstrap';
import { fetchGroups, createGroup, clearError } from '../features/groups/groupsSlice';
import Loading from '../components/common/Loading';

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

  if (isLoading && memberOf.length === 0 && adminOf.length === 0) {
    return <Loading message="Loading groups..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Study Groups</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          ➕ Create Group
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        {/* Groups I Admin */}
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">👑 Groups I Manage</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {adminOf.length === 0 ? (
                <ListGroup.Item className="text-muted">
                  You don't manage any groups yet
                </ListGroup.Item>
              ) : (
                adminOf.map((group) => (
                  <ListGroup.Item 
                    key={group.id} 
                    className="d-flex justify-content-between align-items-center"
                    action
                    onClick={() => navigate(`/groups/${group.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <h6 className="mb-0">{group.name}</h6>
                      <small className="text-muted">{group.description || 'No description'}</small>
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/groups/${group.id}`); }}
                    >
                      Manage
                    </Button>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Groups I'm Member Of */}
        <Col md={6}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">👥 Groups I'm In</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {memberOf.length === 0 ? (
                <ListGroup.Item className="text-muted">
                  You haven't joined any groups yet
                </ListGroup.Item>
              ) : (
                memberOf.map((group) => (
                  <ListGroup.Item 
                    key={group.id}
                    action
                    onClick={() => navigate(`/groups/${group.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h6 className="mb-0">{group.name}</h6>
                    <small className="text-muted">{group.description || 'No description'}</small>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>

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
            <Button variant="secondary" onClick={() => setShowModal(false)}>
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
