import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Button, Modal, Badge } from 'react-bootstrap';
import { fetchPublicNotes } from '../features/notes/notesSlice';
import Loading from '../components/common/Loading';
import YouTubeCard from '../components/common/YouTubeCard';
import { marked } from 'marked';
import { FaGlobe, FaEye, FaArrowRight, FaSearch } from 'react-icons/fa';

/**
 * CommunityPage Component - Display public notes from all users
 */
function CommunityPage() {
  const dispatch = useDispatch();
  const { publicItems: notes, isLoading } = useSelector((state) => state.notes);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

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

  // Get unique courses for filter tabs
  const courses = [...new Set(notes.map(n => n.Course?.name).filter(Boolean))];
  const filterTabs = ['All Notes', ...courses.slice(0, 4)];

  // Color variants for cards
  const gradientColors = [
    'linear-gradient(to right, #4F6BF6, #8B5CF6)',
    'linear-gradient(to right, #10B981, #06B6D4)',
    'linear-gradient(to right, #F59E0B, #EF4444)',
    'linear-gradient(to right, #EC4899, #8B5CF6)',
    'linear-gradient(to right, #06B6D4, #3B82F6)'
  ];
  const getGradient = (index) => gradientColors[index % gradientColors.length];

  if (isLoading && notes.length === 0) {
    return <Loading message="Loading community notes..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="d-flex align-items-center gap-3">
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4F6BF6, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem'
            }}
          >
            <FaGlobe />
          </div>
          <div className="page-header">
            <h1 className="page-title">Community Notes</h1>
            <p className="page-subtitle">Discover knowledge shared by peers</p>
          </div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="form-control search-input" 
              placeholder="Search topics..." 
              style={{ paddingLeft: '2.5rem', width: '200px' }}
            />
          </div>
          <Badge 
            style={{ 
              background: 'var(--bg-secondary)', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 1rem',
              fontWeight: 500
            }}
          >
            {notes.length} Public Notes
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {filterTabs.map((tab, index) => (
          <div 
            key={tab}
            className={`filter-tab ${index === 0 ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab.toLowerCase())}
          >
            {tab}
          </div>
        ))}
      </div>

      {notes.length === 0 ? (
        <div className="community-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h5 style={{ color: 'var(--text-muted)' }}>No public notes yet</h5>
          <p style={{ color: 'var(--text-muted)' }}>Be the first to share your notes with the community!</p>
        </div>
      ) : (
        <Row className="g-4">
          {notes.map((note, index) => (
            <Col md={4} key={note.id}>
              <div 
                className="community-card"
                style={{ cursor: 'pointer' }}
                onClick={() => handleNoteClick(note)}
              >
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: '4px', 
                  background: getGradient(index),
                  borderRadius: '12px 12px 0 0'
                }} />
                
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {note.title}
                  </h5>
                  <span className="badge-public">Public</span>
                </div>
                
                <p className="card-author">by {note.User?.full_name || 'Anonymous'}</p>
                
                <p className="card-content">
                  {getCleanContent(note.content).substring(0, 120)}...
                </p>
                
                <div className="card-footer" style={{ background: 'transparent', border: 'none' }}>
                  <div className="d-flex align-items-center gap-2">
                    {note.tags && note.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="tag dark">{tag}</span>
                    ))}
                    {note.Attachments && note.Attachments.length > 0 && (
                      <span className="tag primary">
                        <FaEye className="me-1" /> {note.Attachments.length}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  <span style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                    Read Note <FaArrowRight style={{ marginLeft: '4px' }} />
                  </span>
                </div>
              </div>
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
                <small style={{ color: 'var(--text-muted)' }}>
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
              <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
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
