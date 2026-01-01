import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Row, 
  Col,
  Button, 
  Modal, 
  Form, 
  Alert,
  Badge,
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
import { 
  FaArrowLeft, 
  FaCog, 
  FaUserPlus, 
  FaCrown, 
  FaUsers,
  FaPlus,
  FaChevronRight,
  FaCode,
  FaList,
  FaInfoCircle
} from 'react-icons/fa';

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

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading && !selectedGroup) {
    return <Loading message="Loading group details..." />;
  }

  if (error && !selectedGroup) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
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
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button 
            variant="link" 
            className="p-0"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => navigate('/groups')}
          >
            <FaArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="page-title">{selectedGroup.name}</h1>
            <p className="page-subtitle">
              <span style={{ 
                display: 'inline-block', 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: 'var(--accent-green)', 
                marginRight: '6px' 
              }}></span>
              Active Group • Updated {new Date(selectedGroup.updatedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="d-flex gap-2">
          {isAdmin && (
            <>
              <Button variant="outline-secondary" className="d-flex align-items-center gap-2">
                <FaCog /> Settings
              </Button>
              <Button 
                variant="primary" 
                className="d-flex align-items-center gap-2"
                onClick={() => setShowInviteModal(true)}
              >
                <FaUserPlus /> Invite Member
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
          {error}
        </Alert>
      )}

      <Row className="g-4">
        {/* Left Column - About & Notes */}
        <Col md={8}>
          {/* About Group Card */}
          <div className="group-card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h5 className="d-flex align-items-center gap-2 mb-3">
              <FaInfoCircle style={{ color: 'var(--primary)' }} />
              About Group
            </h5>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {selectedGroup.description || 'This group is dedicated to collaborative learning and resource sharing. Join us to share notes, resources, and organize study sessions together!'}
            </p>
            <div className="d-flex gap-2 mt-3">
              <span className="tag dark">HTML/CSS</span>
              <span className="tag coral">JavaScript</span>
              <span className="tag green">Project</span>
            </div>
          </div>

          {/* Shared Notes Card */}
          <div className="group-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="d-flex align-items-center gap-2 mb-0">
                <FaList style={{ color: 'var(--primary)' }} />
                Shared Notes
              </h5>
              <span style={{ color: 'var(--primary)', fontSize: '0.875rem', cursor: 'pointer' }}>
                View all
              </span>
            </div>

            {groupNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p>No notes shared with this group yet.</p>
                <p className="small">Share notes with this group from the Notes page!</p>
              </div>
            ) : (
              <div>
                {groupNotes.map((note, index) => (
                  <div 
                    key={note.id}
                    className="d-flex align-items-center gap-3 p-3 mb-2"
                    style={{ 
                      background: 'var(--bg-primary)', 
                      borderRadius: 'var(--border-radius-sm)',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleNoteClick(note)}
                  >
                    <div 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px',
                        background: index % 2 === 0 ? 'rgba(79, 107, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: index % 2 === 0 ? 'var(--primary)' : '#8B5CF6'
                      }}
                    >
                      <FaCode />
                    </div>
                    <div className="flex-grow-1">
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{note.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Added by {note.User?.full_name || 'Unknown'} • {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <FaChevronRight style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>

        {/* Right Column - Members */}
        <Col md={4}>
          <div className="group-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="d-flex align-items-center gap-2 mb-0">
                <FaUsers style={{ color: 'var(--accent-coral)' }} />
                Members
              </h5>
              <Badge 
                pill 
                style={{ 
                  background: 'var(--primary-light)', 
                  color: 'var(--primary)',
                  fontWeight: 500
                }}
              >
                {selectedGroup.Members?.length || 0}
              </Badge>
            </div>

            {/* Admin */}
            {selectedGroup.Admin && (
              <div className="d-flex align-items-center gap-3 p-2 mb-2" style={{ borderRadius: 'var(--border-radius-sm)' }}>
                <div className="member-avatar gradient-1">
                  {getInitials(selectedGroup.Admin.full_name)}
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {selectedGroup.Admin.full_name}
                    <Badge 
                      style={{ 
                        marginLeft: '0.5rem',
                        background: '#F59E0B',
                        fontSize: '0.6rem',
                        padding: '0.2rem 0.4rem'
                      }}
                    >
                      ADMIN
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedGroup.Admin.id === user?.id ? 'You' : selectedGroup.Admin.email}
                  </div>
                </div>
              </div>
            )}

            {/* Other Members */}
            {selectedGroup.Members?.filter(m => m.id !== selectedGroup.admin_user_id).map((member, index) => (
              <div 
                key={member.id} 
                className="d-flex align-items-center gap-3 p-2 mb-2" 
                style={{ borderRadius: 'var(--border-radius-sm)' }}
              >
                <div className={`member-avatar gradient-${(index % 4) + 2}`}>
                  {getInitials(member.full_name)}
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{member.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</div>
                </div>
                {isAdmin && member.id !== user?.id && (
                  <Button 
                    variant="link" 
                    size="sm"
                    style={{ color: 'var(--accent-coral)', padding: 0 }}
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}

            {/* Add new member button */}
            {isAdmin && (
              <div 
                className="d-flex align-items-center gap-3 p-3 mt-3"
                style={{ 
                  border: '1px dashed var(--border-color)', 
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer'
                }}
                onClick={() => setShowInviteModal(true)}
              >
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%',
                    background: 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaPlus style={{ color: 'var(--text-muted)' }} />
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Add new member</span>
              </div>
            )}
          </div>
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
              <Form.Text style={{ color: 'var(--text-muted)' }}>
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
            <Button variant="outline-secondary" onClick={() => setShowInviteModal(false)}>
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
                <small style={{ color: 'var(--text-muted)' }}>
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
                    <span key={i} className="tag primary">{tag}</span>
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
              <Button variant="outline-secondary" onClick={() => setShowNoteModal(false)}>
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
