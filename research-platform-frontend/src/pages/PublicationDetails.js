import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import publicationService from '../api/publications';
import { Spinner, Alert, Card, Button, Container, Row, Col, Badge, Modal } from 'react-bootstrap';
import { ArrowLeft, FileEarmarkPdf, LockFill, Person, Tag, Clock, Hourglass, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import CommentList from '../components/comments/CommentList';

const PublicationDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Status configuration
  const statusConfig = {
    PENDING: {
      variant: 'secondary',
      icon: <Hourglass size={14} className="me-1" />
    },
    APPROVED: {
      variant: 'success',
      icon: <CheckCircle size={14} className="me-1" />
    },
    REJECTED: {
      variant: 'danger',
      icon: <XCircle size={14} className="me-1" />
    },
    // PUBLISHED: {
    //   variant: 'primary',
    //   icon: null // No icon for published
    // }
  };

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const response = await publicationService.getPublicationById(id);
        setPublication(response.data);
      } catch (err) {
        setError('Failed to fetch publication details');
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [id]);

  const handleViewPdf = () => {
    if (publication.premium && !user) {
      setShowLoginModal(true);
    } else {
      const pdfWindow = window.open();
      pdfWindow.document.write(
        `<iframe width='100%' height='100%' src='data:application/pdf;base64, ${publication.pdfContent}'></iframe>`
      );
    }
  };

  function getPdfSizeInKB(base64String) {
    // Remove any data URI prefix if present
    const cleaned = base64String.replace(/^data:application\/pdf;base64,/, '');
  
    // Base64 length to byte size conversion
    const sizeInBytes = (cleaned.length * 3) / 4;

    // Convert bytes to kilobytes
    const sizeInKB = sizeInBytes / 1024;

    return sizeInKB.toFixed(2); // Rounded to 2 decimal places
  }

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/login', { state: { from: `/publications/${id}` } });
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

  const currentStatus = statusConfig[publication.status] || { variant: 'info', icon: null };

  return (
    <Container className="mt-4 publication-detail-container">
      <Button 
        as={Link} 
        to="/publications" 
        variant="outline-primary" 
        className="mb-4 back-button"
      >
        <ArrowLeft className="me-2" />
        Back to Publications
      </Button>

      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
          <div className="d-flex align-items-center">
            <h2 className="mb-0 publication-title">{publication.title}</h2>
            {publication.premium && (
              <Badge pill bg="warning" className="ms-3 premium-badge">
                <LockFill size={12} className="me-1" />
                Premium
              </Badge>
            )}
          </div>
          <Badge 
            pill 
            bg={currentStatus.variant}
            className="status-badge d-flex align-items-center"
          >
            {currentStatus.icon}
            {publication.status}
          </Badge>
        </Card.Header>
        
        <Card.Body className="p-4">
          <Row>
            <Col md={7} lg={8}>
              <div className="publication-meta mb-4">
                <div className="d-flex align-items-center mb-3">
                  <Person className="text-muted me-2" size={18} />
                  <span>
                    <strong>Researcher:</strong> {publication.researcher.username}
                  </span>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <Tag className="text-muted me-2" size={18} />
                  <span>
                    <strong>Domain:</strong> {publication.domain.name}
                  </span>
                </div>
                
                <div className="d-flex align-items-center">
                  <Clock className="text-muted me-2" size={18} />
                  <span>
                    <strong>Published:</strong> {new Date(publication.creationDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {publication.premium && !user ? (
                <div className="premium-content-alert mt-4 p-3 bg-light rounded">
                  <h5 className="d-flex align-items-center">
                    <LockFill className="me-2 text-warning" />
                    Premium Content
                  </h5>
                  <hr className="my-2" />
                  <p>
                    This is a premium publication. Please{' '}
                    <Link to="/login" state={{ from: `/publications/${id}` }} className="text-primary">
                      log in
                    </Link>{' '}
                    to view the full content.
                  </p>
                </div>
              ) : (
                <div className="publication-description mt-4">
                  <h5>Abstract</h5>
                  <hr />
                  <p className="text-muted">
                    {publication.description || 'No abstract available for this publication.'}
                  </p>
                </div>
              )}
            </Col>

            <Col md={5} lg={4}>
              <div className="pdf-action-card p-3 bg-light rounded">
                <div className="text-center mb-3">
                  <FileEarmarkPdf size={48} className="text-danger" />
                </div>
                
                <Button 
                  variant={publication.premium && !user ? "warning" : "primary"} 
                  onClick={handleViewPdf}
                  disabled={!publication.pdfContent}
                  className="w-100 mb-2 pdf-button"
                >
                  {publication.premium && !user ? (
                    <>
                      <LockFill className="me-2" />
                      View PDF (Premium)
                    </>
                  ) : (
                    <>
                      <FileEarmarkPdf className="me-2" />
                      View PDF
                    </>
                  )}
                </Button>
                
                {publication.premium && !user && (
                  <p className="text-center text-muted small mb-0">
                    Login required for premium content
                  </p>
                )}
                
                {publication.pdfContent && (
                  <p className="text-center text-success small mt-2 mb-0">
                    PDF available ({getPdfSizeInKB(publication.pdfContent)} KB)
                  </p>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
        
        <Card.Footer className="text-muted d-flex justify-content-between">
          <small>
            <Clock className="me-1" size={14} />
            Last updated: {new Date(publication.creationDate).toLocaleString()}
          </small>
          {user?.id === publication.researcher.id && (
            <small>
              <Link to={`/publications/edit/${publication.id}`} className="text-primary">
                Edit Publication
              </Link>
            </small>
          )}
        </Card.Footer>
      </Card>

      {/* Comments Section */}
      <Card className="shadow-sm mt-4">
        <Card.Body>
          <CommentList publicationId={id} />
        </Card.Body>
      </Card>

      {/* Login Required Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="w-100 text-center">
            <LockFill size={24} className="text-warning mb-2" />
            <h5>Premium Content</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p>
            This is a premium publication. Please log in to view the content.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button variant="outline-secondary" onClick={() => setShowLoginModal(false)} className="me-3">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLoginRedirect} className="px-4">
            Go to Login
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PublicationDetails;