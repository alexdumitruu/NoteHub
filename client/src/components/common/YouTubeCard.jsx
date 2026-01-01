import { Card, Badge, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * YouTubeCard Component - Displays YouTube video metadata
 * @param {Object} props
 * @param {Object} props.video - Video metadata from oEmbed API
 * @param {Function} [props.onRemove] - Optional callback to remove the card
 */
function YouTubeCard({ video, onRemove }) {
  if (!video) return null;

  return (
    <Card className="mb-3 border-0 shadow-sm">
      <Card.Body className="d-flex gap-3 p-2">
        <a 
          href={video.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            style={{ 
              width: '120px', 
              height: '90px', 
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </a>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Badge bg="danger" className="mb-1">
                ▶ YouTube
              </Badge>
              <h6 className="mb-1">
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none text-dark"
                >
                  {video.title}
                </a>
              </h6>
              <small className="text-muted">
                by {video.author}
              </small>
            </div>
            {onRemove && (
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={onRemove}
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

YouTubeCard.propTypes = {
  video: PropTypes.shape({
    videoId: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    url: PropTypes.string,
  }),
  onRemove: PropTypes.func,
};

export default YouTubeCard;
