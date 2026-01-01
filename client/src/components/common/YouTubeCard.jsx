import { Card, Badge, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FaPlay, FaExternalLinkAlt } from 'react-icons/fa';

/**
 * YouTubeCard Component - Displays YouTube video metadata
 * @param {Object} props
 * @param {Object} props.video - Video metadata from oEmbed API
 * @param {Function} [props.onRemove] - Optional callback to remove the card
 */
function YouTubeCard({ video, onRemove }) {
  if (!video) return null;

  return (
    <div className="youtube-card">
      <div className="youtube-thumbnail">
        <a 
          href={video.url} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
          />
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1rem'
            }}
          >
            <FaPlay style={{ marginLeft: '3px' }} />
          </div>
        </a>
        <span className="youtube-badge">
          ▶ YouTube
        </span>
      </div>
      <div className="youtube-info">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="youtube-title">
              <a 
                href={video.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {video.title}
              </a>
            </div>
            <div className="youtube-author">
              by {video.author}
            </div>
          </div>
          <div className="d-flex gap-2">
            <a 
              href={video.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline-secondary btn-sm"
            >
              <FaExternalLinkAlt />
            </a>
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
      </div>
    </div>
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
