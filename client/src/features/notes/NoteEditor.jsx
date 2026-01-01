import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Form, Button, Row, Col, Alert, Badge, Spinner, Modal, InputGroup } from 'react-bootstrap';
import { marked } from 'marked';
import { createNote, updateNote, deleteAttachment, clearError } from './notesSlice';
import YouTubeCard from '../../components/common/YouTubeCard';
import api from '../../api/axios';

/**
 * NoteEditor Component
 * @param {Object} props
 * @param {Object} [props.note] - Existing note to edit (null for new note)
 * @param {Array} props.courses - Available courses
 * @param {Array} [props.groups] - Available study groups
 * @param {Function} props.onClose - Callback when editor closes
 */
function NoteEditor({ note, courses, groups = [], onClose }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.notes);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    course_id: '',
    tags: '',
    is_public: false,
    group_id: '',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  // YouTube state
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const [youtubeVideos, setYoutubeVideos] = useState([]);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        course_id: note.course_id || '',
        tags: Array.isArray(note.tags) ? note.tags.join(', ') : note.tags || '',
        is_public: note.is_public || false,
        group_id: note.group_id || '',
      });
      
      // Parse existing YouTube references from content
      parseYouTubeFromContent(note.content || '');
    }
  }, [note]);

  // Parse YouTube references embedded in content
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
    if (matches.length > 0) {
      setYoutubeVideos(matches);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      await dispatch(deleteAttachment({ noteId: note.id, attachmentId }));
    }
  };

  // YouTube handling
  const handleAddYouTube = async () => {
    if (!youtubeUrl.trim()) {
      setYoutubeError('Please enter a YouTube URL');
      return;
    }

    setYoutubeLoading(true);
    setYoutubeError('');

    try {
      const response = await api.post('/external/youtube', { url: youtubeUrl });
      const videoData = response.data;
      
      // Add to videos list
      setYoutubeVideos([...youtubeVideos, videoData]);
      
      // Close modal and reset
      setShowYouTubeModal(false);
      setYoutubeUrl('');
    } catch (err) {
      setYoutubeError(err.response?.data?.error || 'Failed to fetch YouTube metadata');
    } finally {
      setYoutubeLoading(false);
    }
  };

  const handleRemoveYouTube = (index) => {
    setYoutubeVideos(youtubeVideos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Embed YouTube references in content
    let finalContent = formData.content;
    
    // Remove old YouTube references
    finalContent = finalContent.replace(/\[YOUTUBE:\{.*?\}\]\n?/g, '');
    
    // Add current YouTube references at the top
    if (youtubeVideos.length > 0) {
      const youtubeRefs = youtubeVideos.map(v => 
        `[YOUTUBE:${JSON.stringify({ videoId: v.videoId, title: v.title, author: v.author, thumbnailUrl: v.thumbnailUrl, url: v.url })}]`
      ).join('\n');
      finalContent = youtubeRefs + '\n\n' + finalContent;
    }

    const noteData = {
      ...formData,
      content: finalContent,
      course_id: formData.course_id || null,
      group_id: formData.group_id || null,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      attachment: selectedFile,
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

  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  const getMarkdownPreview = () => {
    try {
      // Remove YouTube references from preview content
      const cleanContent = formData.content.replace(/\[YOUTUBE:\{.*?\}\]\n?/g, '');
      return { __html: marked(cleanContent || '') };
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

      {/* YouTube References Display */}
      {youtubeVideos.length > 0 && (
        <div className="mb-3">
          {youtubeVideos.map((video, index) => (
            <YouTubeCard 
              key={video.videoId || index} 
              video={video} 
              onRemove={() => handleRemoveYouTube(index)}
            />
          ))}
        </div>
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
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setShowYouTubeModal(true)}
                  >
                    ▶ Add YouTube
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? '✏️ Edit' : '👁️ Preview'}
                  </Button>
                </div>
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

            {/* File Attachment Section */}
            <Form.Group className="mb-3">
              <Form.Label>📎 Attach File (Image or PDF)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                Max file size: 10MB. Supported: JPEG, PNG, GIF, WebP, PDF
              </Form.Text>
              
              {selectedFile && (
                <div className="mt-2 p-2 bg-light rounded d-flex align-items-center gap-2">
                  {filePreview ? (
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      style={{ maxHeight: '60px', maxWidth: '100px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <Badge bg="secondary">📄 PDF</Badge>
                  )}
                  <span className="flex-grow-1">{selectedFile.name}</span>
                  <Button variant="outline-danger" size="sm" onClick={handleRemoveFile}>
                    ✕
                  </Button>
                </div>
              )}
            </Form.Group>

            {/* Existing attachments (edit mode) */}
            {note?.Attachments && note.Attachments.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Existing Attachments</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {note.Attachments.map((att) => (
                    <div key={att.id} className="p-2 bg-light rounded d-flex align-items-center gap-2">
                      {att.file_type === 'image' ? (
                        <img 
                          src={`http://localhost:3000${att.file_url}`} 
                          alt={att.original_name}
                          style={{ maxHeight: '50px', maxWidth: '80px', objectFit: 'cover' }}
                        />
                      ) : (
                        <Badge bg="info">📄 PDF</Badge>
                      )}
                      <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {att.original_name}
                      </span>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </Form.Group>
            )}

            {/* Share with Group */}
            {groups.length > 0 && (
              <Form.Group className="mb-3" controlId="group_id">
                <Form.Label>Share with Study Group</Form.Label>
                <Form.Select
                  name="group_id"
                  value={formData.group_id}
                  onChange={handleChange}
                >
                  <option value="">No group (private)</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                name="is_public"
                label="Make this note public (visible to all students)"
                checked={formData.is_public}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  note ? 'Update Note' : 'Create Note'
                )}
              </Button>
              <Button variant="outline-secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* YouTube Modal */}
      <Modal show={showYouTubeModal} onHide={() => setShowYouTubeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>▶ Add YouTube Reference</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>YouTube URL</Form.Label>
            <InputGroup>
              <Form.Control
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </InputGroup>
            <Form.Text className="text-muted">
              Paste a YouTube video link to add it as a reference
            </Form.Text>
          </Form.Group>
          {youtubeError && (
            <Alert variant="danger" className="mt-2 mb-0">
              {youtubeError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowYouTubeModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleAddYouTube}
            disabled={youtubeLoading}
          >
            {youtubeLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Fetching...
              </>
            ) : (
              'Add Video'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default NoteEditor;
