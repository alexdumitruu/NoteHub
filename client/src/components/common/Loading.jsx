import { Spinner } from 'react-bootstrap';

function Loading({ message = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '200px' }}>
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">{message}</p>
    </div>
  );
}

export default Loading;
