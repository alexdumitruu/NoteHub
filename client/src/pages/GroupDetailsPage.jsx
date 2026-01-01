import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card, 
  Button, 
  ListGroup, 
  Badge, 
  Modal, 
  Form, 
  Alert,
  Row,
  Col,
  Spinner
} from 'react-bootstrap';
import { 
  fetchGroupDetails, 
  fetchGroupNotes, 
  inviteMember, 
  removeMember,
  clearError,
  clearSelectedGroup
} from '../features/groups/groupsSlice';
import Loading from '../components/common/Loading';
import YouTubeCard from '../components/common/YouTubeCard';
import { marked } from 'marked';

/**
 * GroupDetailsPage - View and manage a study group
 */
function GroupDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedGroup, groupNotes, isLoading, error } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroupDetails(id));
      dispatch(fetchGroupNotes(id));
    }
    
    return () => {
      dispatch(clearSelectedGroup());
    };
  }, [id, dispatch]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    
    const result = await dispatch(inviteMember({ groupId: id, email: inviteEmail }));
    
    if (inviteMember.fulfilled.match(result)) {
      setShowInviteModal(false);
      setInviteEmail('');
    } else {
      setInviteError(result.payload || 'Failed to invite member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await dispatch(removeMember({ groupId: id, memberId }));
    }
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  const parseYouTubeFromContent = (content) => {
    const youtubeRegex = /\[YOUTUBE:(\{.*?\})\]/g;
    const matches = [];
    let match;
    while ((match = youtubeRegex.exec(content)) !== null) {
      try {
        matches.push(JSON.parse(match[1]));
      } catch (e) {
        console.error('Failed to parse YouTube reference', e);
      }
    }
    return matches;
  };

  const getCleanContent = (content) => {
    return content?.replace(/\[YOUTUBE:\{.*?\}\]\n?/g, '') || '';
  };

  const getMarkdownPreview = (content) => {
    try {
      marked.setOptions({ breaks: true, gfm: true });
      return { __html: marked(getCleanContent(content)) };
    } catch {
      return { __html: content || '' };
    }
  };

  if (isLoading && !selectedGroup) {
    return <Loading message="Loading group details..." />;
  }

  if (error && !selectedGroup) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/groups')}>
          Back to Groups
        </Button>
      </div>
    );
  }

  if (!selectedGroup) {
    return null;
  }

  const isAdmin = selectedGroup.isAdmin;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button 
            variant="link" 
            className="p-0 mb-2"
            onClick={() => navigate('/groups')}
          >
            ← Back to Groups
          </Button>
          <h1>{selectedGroup.name}</h1>
          {selectedGroup.description && (
            <p className="text-muted">{selectedGroup.description}</p>
          )}
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowInviteModal(true)}>
            ➕ Invite Member
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
          {error}
        </Alert>
      )}

      <Row>
        {/* Members Section */}
        <Col md={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">👥 Members</h5>
              <Badge bg="secondary">{selectedGroup.Members?.length || 0}</Badge>
            </Card.Header>
            <ListGroup variant="flush">
              {/* Admin */}
              {selectedGroup.Admin && (
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{selectedGroup.Admin.full_name}</strong>
                    <br />
                    <small className="text-muted">{selectedGroup.Admin.email}</small>
                  </div>
                  <Badge bg="warning">Admin</Badge>
                </ListGroup.Item>
              )}
              
              {/* Other Members */}
              {selectedGroup.Members?.filter(m => m.id !== selectedGroup.admin_user_id).map((member) => (
                <ListGroup.Item key={member.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <span>{member.full_name}</span>
                    <br />
                    <small className="text-muted">{member.email}</small>
                  </div>
                  {isAdmin && member.id !== user?.id && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        {/* Group Notes Section */}
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📝 Shared Notes</h5>
              <Badge bg="info">{groupNotes.length}</Badge>
            </Card.Header>
            <Card.Body>
              {groupNotes.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <p>No notes shared with this group yet.</p>
                  <p className="small">Share notes with this group from the Notes page!</p>
                </div>
              ) : (
                <Row xs={1} md={2} className="g-3">
                  {groupNotes.map((note) => (
                    <Col key={note.id}>
                      <Card 
                        className="h-100 border" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleNoteClick(note)}
                      >
                        <Card.Body>
                          <Card.Title className="h6">{note.title}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted small">
                            by {note.User?.full_name || 'Unknown'}
                          </Card.Subtitle>
                          <Card.Text className="small text-truncate">
                            {getCleanContent(note.content).substring(0, 100)}...
                          </Card.Text>
                          <div>
                            {note.tags?.slice(0, 2).map((tag, i) => (
                              <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
                            ))}
                            {note.Attachments?.length > 0 && (
                              <Badge bg="info">📎 {note.Attachments.length}</Badge>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Invite Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite Member</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInvite}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="student@stud.ase.ro"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Enter the email of the student you want to invite
              </Form.Text>
            </Form.Group>
            {inviteError && (
              <Alert variant="danger" className="mt-3 mb-0">
                {inviteError}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Inviting...
                </>
              ) : (
                'Send Invite'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Note Detail Modal */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)} size="lg">
        {selectedNote && (
          <>
            <Modal.Header closeButton>
              <div>
                <Modal.Title>{selectedNote.title}</Modal.Title>
                <small className="text-muted">
                  by {selectedNote.User?.full_name || 'Unknown'} • 
                  {selectedNote.Course?.name || 'General'} • 
                  {new Date(selectedNote.createdAt).toLocaleDateString()}
                </small>
              </div>
            </Modal.Header>
            <Modal.Body>
              {/* YouTube References */}
              {parseYouTubeFromContent(selectedNote.content || '').map((video, index) => (
                <YouTubeCard key={video.videoId || index} video={video} />
              ))}

              {/* Attachments */}
              {selectedNote.Attachments && selectedNote.Attachments.length > 0 && (
                <div className="mb-3">
                  <h6>📎 Attachments</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedNote.Attachments.map((att) => (
                      <div key={att.id}>
                        {att.file_type === 'image' ? (
                          <a 
                            href={`http://localhost:3000${att.file_url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <img 
                              src={`http://localhost:3000${att.file_url}`} 
                              alt={att.original_name}
                              style={{ maxHeight: '100px', maxWidth: '150px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          </a>
                        ) : (
                          <a 
                            href={`http://localhost:3000${att.file_url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-outline-secondary btn-sm"
                          >
                            📄 {att.original_name}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="mb-3">
                  {selectedNote.tags.map((tag, i) => (
                    <Badge key={i} bg="info" className="me-1">{tag}</Badge>
                  ))}
                </div>
              )}

              <hr />

              {/* Content */}
              <div 
                className="markdown-preview"
                dangerouslySetInnerHTML={getMarkdownPreview(selectedNote.content)}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default GroupDetailsPage;
