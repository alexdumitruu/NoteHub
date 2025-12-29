import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Card, Button, ListGroup, Badge, Form, InputGroup } from 'react-bootstrap';
import { fetchNotes, selectNote, clearSelectedNote, deleteNote } from '../features/notes/notesSlice';
import { fetchCourses } from '../features/courses/coursesSlice';
import NoteEditor from '../features/notes/NoteEditor';
import Loading from '../components/common/Loading';

function NotesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const { items: notes, isLoading, selectedNote } = useSelector((state) => state.notes);
  const { items: courses } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchCourses());
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

  // Filter notes based on search
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading && notes.length === 0) {
    return <Loading message="Loading notes..." />;
  }

  if (showEditor) {
    return (
      <NoteEditor
        note={editingNote}
        courses={courses}
        onClose={handleEditorClose}
      />
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Notes</h1>
        <Button variant="primary" onClick={handleCreateNew}>
          ➕ New Note
        </Button>
      </div>

      <Row>
        {/* Notes List */}
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white">
              <InputGroup>
                <Form.Control
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {filteredNotes.length === 0 ? (
                <ListGroup.Item className="text-muted text-center py-4">
                  No notes found
                </ListGroup.Item>
              ) : (
                filteredNotes.map((note) => (
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
                    {note.is_public && (
                      <Badge bg="success" pill>Public</Badge>
                    )}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Note Preview */}
        <Col md={8}>
          {selectedNote ? (
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">{selectedNote.title}</h4>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
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
                      <Badge key={i} bg="info" className="me-1">{tag}</Badge>
                    ))}
                  </div>
                )}
                <hr />
                <div 
                  className="note-content"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {selectedNote.content || 'No content'}
                </div>
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
