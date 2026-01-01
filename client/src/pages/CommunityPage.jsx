import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Card, ListGroup, Badge, Modal, Button } from 'react-bootstrap';
import { fetchPublicNotes } from '../features/notes/notesSlice';
import Loading from '../components/common/Loading';
import YouTubeCard from '../components/common/YouTubeCard';
import { marked } from 'marked';

/**
 * CommunityPage Component - Display public notes from all users
 */
function CommunityPage() {
  const dispatch = useDispatch();
  const { publicItems: notes, isLoading } = useSelector((state) => state.notes);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPublicNotes());
  }, [dispatch]);

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowModal(true);
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

  if (isLoading && notes.length === 0) {
    return <Loading message="Loading community notes..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>🌍 Community Notes</h1>
          <p className="text-muted mb-0">Discover notes shared by other students</p>
        </div>
        <Badge bg="info" pill className="fs-6">
          {notes.length} public notes
        </Badge>
      </div>

      {notes.length === 0 ? (
        <Card className="shadow-sm border-0 text-center py-5">
          <Card.Body>
            <h5 className="text-muted">No public notes yet</h5>
            <p className="text-muted">Be the first to share your notes with the community!</p>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {notes.map((note) => (
            <Col key={note.id}>
              <Card 
                className="shadow-sm border-0 h-100" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleNoteClick(note)}
              >
                <Card.Body>
                  <Card.Title>{note.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    by {note.User?.full_name || 'Anonymous'}
                  </Card.Subtitle>
                  <Card.Text className="text-truncate" style={{ maxHeight: '60px', overflow: 'hidden' }}>
                    {getCleanContent(note.content).substring(0, 150)}...
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      {note.tags && note.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
                      ))}
                    </div>
                    <small className="text-muted">
                      {note.Course?.name || 'General'}
                    </small>
                  </div>
                  {/* Indicators for attachments and YouTube */}
                  <div className="mt-2">
                    {note.Attachments && note.Attachments.length > 0 && (
                      <Badge bg="info" className="me-1">📎 {note.Attachments.length}</Badge>
                    )}
                    {parseYouTubeFromContent(note.content || '').length > 0 && (
                      <Badge bg="danger">▶ YouTube</Badge>
                    )}
                  </div>
                </Card.Body>
                <Card.Footer className="bg-transparent">
                  <small className="text-muted">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Note Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        {selectedNote && (
          <>
            <Modal.Header closeButton>
              <div>
                <Modal.Title>{selectedNote.title}</Modal.Title>
                <small className="text-muted">
                  by {selectedNote.User?.full_name || 'Anonymous'} • 
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
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default CommunityPage;
