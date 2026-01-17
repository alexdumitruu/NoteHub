import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Card, Button, ListGroup, Badge, Form, InputGroup } from 'react-bootstrap';
import { fetchNotes, selectNote, clearSelectedNote, deleteNote, setFilters, clearFilters } from '../features/notes/notesSlice';
import { fetchCourses } from '../features/courses/coursesSlice';
import { fetchGroups } from '../features/groups/groupsSlice';
import NoteEditor from '../features/notes/NoteEditor';
import Loading from '../components/common/Loading';
import YouTubeCard from '../components/common/YouTubeCard';
import { marked } from 'marked';
import { FaExpand, FaCompress, FaPlus } from 'react-icons/fa';

// Helper function to parse YouTube references from note content
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

/**
 * NotesPage Component - Main notes management page
 * Features: Note list, preview, search, tag filtering, sorting
 */
function NotesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [sortBy, setSortBy] = useState('dateDesc');
  const [isExpanded, setIsExpanded] = useState(false);

  const { items: notes, isLoading, selectedNote, filters } = useSelector((state) => state.notes);
  const { items: courses } = useSelector((state) => state.courses);
  const { memberOf, adminOf } = useSelector((state) => state.groups);

  // Combine member and admin groups
  const allGroups = useMemo(() => {
    const combined = [...(memberOf || []), ...(adminOf || [])];
    // Remove duplicates based on id
    return combined.filter((group, index, self) => 
      index === self.findIndex((g) => g.id === group.id)
    );
  }, [memberOf, adminOf]);

  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchCourses());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (id === 'new') {
      setShowEditor(true);
      setEditingNote(null);
    } else if (id) {
      const note = notes.find((n) => n.id === parseInt(id));
      if (note) {
        dispatch(selectNote(note));
      }
    }
  }, [id, notes, dispatch]);

  const handleCreateNew = () => {
    setEditingNote(null);
    setShowEditor(true);
    navigate('/notes/new');
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await dispatch(deleteNote(noteId));
      dispatch(clearSelectedNote());
    }
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingNote(null);
    navigate('/notes');
  };

  const handleNoteClick = (note) => {
    dispatch(selectNote(note));
    navigate(`/notes/${note.id}`);
  };

  const handleTagClick = (tag) => {
    if (activeTag === tag) {
      setActiveTag(null); // Toggle off
    } else {
      setActiveTag(tag);
    }
  };

  const handleClearFilters = () => {
    setActiveTag(null);
    setSearchQuery('');
    setSortBy('dateDesc');
    dispatch(clearFilters());
  };

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((note) =>
        note.title.toLowerCase().includes(query) ||
        note.content?.toLowerCase().includes(query)
      );
    }

    // Filter by active tag
    if (activeTag) {
      result = result.filter((note) =>
        note.tags && note.tags.includes(activeTag)
      );
    }

    // Sort
    switch (sortBy) {
      case 'dateAsc':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'titleAsc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'titleDesc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'dateDesc':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [notes, searchQuery, activeTag, sortBy]);

  // Collect all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((note) => {
      if (note.tags) {
        note.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  if (isLoading && notes.length === 0) {
    return <Loading message="Loading notes..." />;
  }

  if (showEditor) {
    return (
      <NoteEditor
        note={editingNote}
        courses={courses}
        groups={allGroups}
        onClose={handleEditorClose}
      />
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="page-header">
          <h1 className="page-title">My Notes</h1>
          <p className="page-subtitle">Create, edit, and organize your study notes.</p>
        </div>
        <Button 
          variant="primary" 
          className="d-flex align-items-center gap-2"
          onClick={handleCreateNew}
        >
          <FaPlus /> New Note
        </Button>
      </div>

      <Row className="row-animated">
        {/* Notes List - Slides out when expanded */}
        <Col 
          md={4} 
          className={`col-animated notes-list-col ${isExpanded ? 'hiding' : ''}`}
        >
          <Card className="shadow-sm border-0">
            <Card.Header>
              <InputGroup className="mb-2">
                <Form.Control
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <div className="d-flex justify-content-between align-items-center">
                <Form.Select
                  size="sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="dateDesc">📅 Newest</option>
                  <option value="dateAsc">📅 Oldest</option>
                  <option value="titleAsc">🔤 A-Z</option>
                  <option value="titleDesc">🔤 Z-A</option>
                </Form.Select>
                {(activeTag || searchQuery) && (
                  <Button variant="outline-secondary" size="sm" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </Card.Header>
            
            {/* Tag Filter Bar */}
            {allTags.length > 0 && (
              <div className="p-2 border-bottom d-flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    bg={activeTag === tag ? 'primary' : 'secondary'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag} {activeTag === tag && '✓'}
                  </Badge>
                ))}
              </div>
            )}

            <ListGroup variant="flush" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {filteredAndSortedNotes.length === 0 ? (
                <ListGroup.Item className="text-muted text-center py-4">
                  No notes found
                </ListGroup.Item>
              ) : (
                filteredAndSortedNotes.map((note) => (
                  <ListGroup.Item
                    key={note.id}
                    action
                    active={selectedNote?.id === note.id}
                    onClick={() => handleNoteClick(note)}
                    className="d-flex justify-content-between align-items-start"
                  >
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">{note.title}</div>
                      <small className="text-muted">
                        {note.Course?.name || 'No course'}
                      </small>
                      {note.tags && note.tags.length > 0 && (
                        <div className="mt-1">
                          {note.tags.slice(0, 2).map((tag, i) => (
                            <Badge key={i} bg="secondary" className="me-1" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="d-flex flex-column align-items-end gap-1">
                      {note.is_public && (
                        <Badge bg="success" pill>Public</Badge>
                      )}
                      {note.Attachments && note.Attachments.length > 0 && (
                        <Badge bg="info" pill>📎 {note.Attachments.length}</Badge>
                      )}
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Note Preview */}
        <Col 
          md={isExpanded ? 12 : 8}
          className={`notes-preview-col ${isExpanded ? 'expanded' : ''}`}
        >
          {selectedNote ? (
            <Card className="shadow-sm border-0">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">{selectedNote.title}</h4>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Collapse view" : "Expand view"}
                  >
                    {isExpanded ? <FaCompress /> : <FaExpand />}
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(selectedNote)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(selectedNote.id)}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <small className="text-muted">
                    Course: {selectedNote.Course?.name || 'None'} •
                    Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                  </small>
                </div>
                {selectedNote.tags && selectedNote.tags.length > 0 && (
                  <div className="mb-3">
                    {selectedNote.tags.map((tag, i) => (
                      <Badge 
                        key={i} 
                        bg={activeTag === tag ? 'primary' : 'info'} 
                        className="me-1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* YouTube References Display */}
                {parseYouTubeFromContent(selectedNote.content || '').length > 0 && (
                  <div className="mb-3">
                    {parseYouTubeFromContent(selectedNote.content || '').map((video, index) => (
                      <YouTubeCard key={video.videoId || index} video={video} />
                    ))}
                  </div>
                )}

                {/* Attachments Display */}
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
                                style={{ maxHeight: '150px', maxWidth: '200px', objectFit: 'cover', borderRadius: '8px' }}
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

                <hr />
                <div 
                  className="note-content markdown-preview"
                  dangerouslySetInnerHTML={{ 
                    __html: (() => {
                      try {
                        marked.setOptions({ breaks: true, gfm: true });
                        // Remove YouTube markers before rendering
                        const cleanContent = (selectedNote.content || '').replace(/\[YOUTUBE:\{.*?\}\]\n?/g, '');
                        return marked(cleanContent);
                      } catch {
                        return selectedNote.content || 'No content';
                      }
                    })()
                  }}
                />
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm border-0">
              <Card.Body className="text-center text-muted py-5">
                <h5>Select a note to view</h5>
                <p>Or create a new note to get started</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default NotesPage;
