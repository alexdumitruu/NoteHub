import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { marked } from 'marked';
import { createNote, updateNote, clearError } from './notesSlice';

function NoteEditor({ note, courses, onClose }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.notes);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    course_id: '',
    tags: '',
    is_public: false,
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        course_id: note.course_id || '',
        tags: Array.isArray(note.tags) ? note.tags.join(', ') : note.tags || '',
        is_public: note.is_public || false,
      });
    }
  }, [note]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const noteData = {
      ...formData,
      course_id: formData.course_id || null,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    };

    let result;
    if (note) {
      result = await dispatch(updateNote({ id: note.id, ...noteData }));
    } else {
      result = await dispatch(createNote(noteData));
    }

    if (createNote.fulfilled.match(result) || updateNote.fulfilled.match(result)) {
      onClose();
    }
  };

  // Configure marked for basic markdown rendering
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  const getMarkdownPreview = () => {
    try {
      return { __html: marked(formData.content || '') };
    } catch {
      return { __html: formData.content || '' };
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{note ? 'Edit Note' : 'Create New Note'}</h1>
        <Button variant="outline-secondary" onClick={onClose}>
          ← Back to Notes
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group controlId="title">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="Note title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="course_id">
                  <Form.Label>Course</Form.Label>
                  <Form.Select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                  >
                    <option value="">Select a course...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="tags">
              <Form.Label>Tags</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                placeholder="Enter tags separated by commas (e.g., exam, lecture, chapter1)"
                value={formData.tags}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Content (Markdown supported)</Form.Label>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? '✏️ Edit' : '👁️ Preview'}
                </Button>
              </div>

              {showPreview ? (
                <Card className="bg-light">
                  <Card.Body>
                    <div
                      className="markdown-preview"
                      dangerouslySetInnerHTML={getMarkdownPreview()}
                      style={{ minHeight: '300px' }}
                    />
                  </Card.Body>
                </Card>
              ) : (
                <Form.Control
                  as="textarea"
                  name="content"
                  rows={12}
                  placeholder="Write your notes here... Markdown is supported!

# Heading
**Bold text**
*Italic text*
- List item
`code`"
                  value={formData.content}
                  onChange={handleChange}
                  style={{ fontFamily: 'monospace' }}
                />
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                name="is_public"
                label="Make this note public"
                checked={formData.is_public}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
              </Button>
              <Button variant="outline-secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default NoteEditor;
