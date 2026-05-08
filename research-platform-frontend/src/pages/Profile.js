import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Alert, Button, Badge, Spinner, Container, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import publicationService from '../api/publications';
import { BoxArrowRight, FileEarmarkText, Pencil, Eye } from 'react-bootstrap-icons';

const Profile = () => {
  const { user: currentUser, logout } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to check if the image is a base64 string
  const isBase64Image = (str) => {
    if (typeof str !== 'string') return false;
    return str.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(str);
  };

  // Function to get the proper image source
  const getImageSrc = (imageData) => {
    if (!imageData) return null;
    
    if (isBase64Image(imageData)) {
      // If it's already a proper data URL
      if (imageData.startsWith('data:image')) {
        return imageData;
      }
      // If it's just base64 without the prefix
      return `data:image/jpeg;base64,${imageData}`;
    }
    
    // If it's a URL path
    return imageData;
  };

  useEffect(() => {
    if (!currentUser?.id || currentUser.role !== 'RESEARCHER') return;

    const fetchPublications = async () => {
      setLoading(true);
      try {
        const response = await publicationService.getAllPublications();
        setPublications(response.data.filter(
          pub => pub.researcher?.id === currentUser.id || String(pub.researcher?.id) === String(currentUser.id)
        ));
      } catch (err) {
        setError('Failed to load publications');
        console.error('Error fetching publications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <Container className="mt-4">
        <Alert variant="warning" className="text-center">
          Please <Button variant="link" onClick={() => navigate('/login')}>login</Button> to view your profile
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 profile-container">
      <Card className="shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex align-items-center">
              {currentUser.image && (
                <Image 
                  src={getImageSrc(currentUser.image)} 
                  alt="Profile" 
                  roundedCircle
                  className="me-4"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-profile.png';
                  }}
                />
              )}
              <div>
                <h2 className="mb-1 d-flex align-items-center">
                  {currentUser.username}
                  <Badge bg="secondary" className="ms-3" style={{ fontSize: '0.75rem' }}>
                    {currentUser.role}
                  </Badge>
                </h2>
                <p className="text-muted mb-0">
                  <strong>Email:</strong> {currentUser.email}
                </p>
              </div>
            </div>
            <Button 
              variant="outline-danger" 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="d-flex align-items-center"
            >
              <BoxArrowRight className="me-2" />
              Logout
            </Button>
          </div>
        </Card.Body>
      </Card>

      {currentUser.role === 'RESEARCHER' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 d-flex align-items-center">
          <FileEarmarkText className="text-primary me-2" size={24} />
          My Publications
        </h3>
        {currentUser.role === 'RESEARCHER' && (
          <Button 
            variant="primary" 
            onClick={() => navigate('/publications/new')}
            className="d-flex align-items-center"
          >
            <Pencil className="me-2" />
            New Publication
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      ) : publications.length > 0 ? (
        <div className="publications-list">
          {publications.map(pub => (
            <Card key={pub.id} className="mb-3 shadow-sm">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-2">{pub.title}</h5>
                    <div className="d-flex align-items-center">
                      <Badge bg={getStatusColor(pub.status)} className="me-2">
                        {pub.status}
                      </Badge>
                      {pub.premium && (
                        <Badge bg="warning" className="d-flex align-items-center">
                          <FileEarmarkText className="me-1" size={12} />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/publications/${pub.id}`)}
                    className="d-flex align-items-center"
                  >
                    <Eye className="me-2" />
                    View
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-5 shadow-sm">
          <FileEarmarkText size={48} className="text-muted mb-3" />
          <h5>No Publications Found</h5>
          <p className="text-muted mb-4">
            {currentUser.role === 'RESEARCHER' 
              ? "You haven't created any publications yet" 
              : "No publications available"}
          </p>
          {currentUser.role === 'RESEARCHER' && (
            <Button 
              variant="primary" 
              onClick={() => navigate('/publications/new')}
              className="d-flex align-items-center mx-auto"
            >
              <Pencil className="me-2" />
              Create First Publication
            </Button>
          )}
        </Card>
      )}
        </>
      )}
    </Container>
  );
};

// Helper function for status badges
function getStatusColor(status) {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'danger';
    default: return 'secondary';
  }
}

export default Profile;