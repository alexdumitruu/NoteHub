import { useSelector } from 'react-redux';
import { Card, Row, Col } from 'react-bootstrap';

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1 className="mb-4">My Profile</h1>

      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">Account Information</h5>
              
              <div className="mb-3">
                <label className="text-muted small">Full Name</label>
                <p className="mb-0 fw-bold">{user?.full_name}</p>
              </div>

              <div className="mb-3">
                <label className="text-muted small">Email</label>
                <p className="mb-0">{user?.email}</p>
              </div>

              <div className="mb-3">
                <label className="text-muted small">Member Since</label>
                <p className="mb-0">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProfilePage;
