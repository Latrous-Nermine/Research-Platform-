import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Alert, Card, Button, Container, Row, Col, Badge, Image, Tab, Tabs } from 'react-bootstrap';
import { ArrowLeft, FileEarmarkText, Person, Envelope, BoxArrowRight, Pencil, Eye } from 'react-bootstrap-icons';
import publicationService from '../api/publications';
import userService from '../api/users';
import UserFormModif from '../components/users/UserFormModif';

const UserDetails = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('publications');

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
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user details
        const userResponse = await userService.getUserById(id);
        setUser(userResponse.data);
        
        // Fetch user publications only if user is a RESEARCHER
        if (userResponse.data.role === 'RESEARCHER') {
          const pubResponse = await publicationService.getAllPublications();
          setPublications(pubResponse.data.filter(
            pub => String(pub.researcher?.id) === String(id)
          ));
        }
        
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleEdit = async (updatedUser) => {
    try {
      const response = await userService.updateUser(id, updatedUser);
      setUser(response.data); // Update the user state with the new data
      setShowForm(false);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );
  
  if (error) return (
    <Container className="mt-4">
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    </Container>
  );

  if (!user) return (
    <Container className="mt-4">
      <Alert variant="warning" className="text-center">
        User not found
      </Alert>
    </Container>
  );

  const isCurrentUserProfile = currentUser?.id === user.id;

  return (
    <Container className="mt-4 user-detail-container">
      <Button 
        as={Link} 
        to="/users" 
        variant="outline-primary" 
        className="mb-4 back-button"
      >
        <ArrowLeft className="me-2" />
        Back to Users
      </Button>

      <Card className="shadow-sm mb-4">
        <Card.Body className="p-4">
          <Row>
            <Col md={3} className="text-center">
              {user.image && (
                <Image 
                  src={getImageSrc(user.image)} 
                  alt="Profile" 
                  roundedCircle
                  className="mb-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-profile.png';
                  }}
                />
              )}
              
              {/* {isCurrentUserProfile && */}
              { (
                <Button 
                  variant="outline-primary" 
                  onClick={() => setShowForm(true)}
                  className="w-100 mb-2"
                >
                  <Pencil className="me-2" />
                  Edit Profile
                </Button>
              )}
            </Col>
            
            <Col md={9}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2 className="mb-2 d-flex align-items-center">
                    {user.username}
                    <Badge bg="secondary" className="ms-3" style={{ fontSize: '0.9rem' }}>
                      {user.role}
                    </Badge>
                  </h2>
                  
                  <div className="user-meta mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <Envelope className="text-muted me-2" size={18} />
                      <span>
                        <strong>Email:</strong> {user.email}
                      </span>
                    </div>
                    
                    <div className="d-flex align-items-center mb-2">
                      <Person className="text-muted me-2" size={18} />
                      <span>
                        <strong>Role:</strong> {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* {isCurrentUserProfile && (
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
                )} */}
              </div>
              
              {user.bio && (
                <div className="user-bio mt-4">
                  <h5>About</h5>
                  <hr />
                  <p className="text-muted">
                    {user.bio}
                  </p>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {user.role === 'RESEARCHER' && (
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="px-3 pt-2"
          >
            <Tab eventKey="publications" title={
              <span className="d-flex align-items-center">
                <FileEarmarkText className="me-2" size={16} />
                Publications ({publications.length})
              </span>
            }>
              <div className="p-3">
                {publications.length > 0 ? (
                  <div className="publications-list">
                    {publications.map(pub => (
                      <Card key={pub.id} className="mb-3 shadow-sm">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h5 className="mb-1">{pub.title}</h5>
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
                              size="sm"
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
                  <Card className="text-center py-5 shadow-sm border-0">
                    <FileEarmarkText size={48} className="text-muted mb-3" />
                    <h5>No Publications Found</h5>
                    <p className="text-muted">
                      {isCurrentUserProfile
                        ? "You haven't created any publications yet"
                        : "This user hasn't published anything yet"}
                    </p>
                    {isCurrentUserProfile && user.role === 'RESEARCHER' && (
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
              </div>
            </Tab>
            
            {/* <Tab eventKey="activity" title="Activity" disabled>
              Future implementation for user activity
            </Tab> */}
          </Tabs>
        </Card.Body>
      </Card>
      )}
      <UserFormModif
        user={user}
        onSubmit={handleEdit}
        onCancel={() => setShowForm(false)}
        show={showForm}
        loading={loading}
      />
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

export default UserDetails;