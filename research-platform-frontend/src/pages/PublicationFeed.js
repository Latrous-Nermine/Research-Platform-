import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import publicationService from '../api/publications';
import commentService from '../api/comments';
import { Button, Alert, Spinner, Card, Container, Form, Row, Col, Badge, ListGroup, Image, Modal } from 'react-bootstrap';
import { Plus, FileText, Person, Clock, Funnel, X, CheckSquare, Chat, Send, FileEarmarkPdf, LockFill, Eye } from 'react-bootstrap-icons';
import PublicationForm from '../components/publications/PublicationForm';
import moment from 'moment';

const PublicationFeed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [activeComments, setActiveComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isBase64Image = (str) => {
    if (typeof str !== 'string') return false;
    return str.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(str);
  };

  const getImageSrc = (imageData) => {
    if (!imageData) return null;
    
    if (isBase64Image(imageData)) {
      if (imageData.startsWith('data:image')) {
        return imageData;
      }
      return `data:image/jpeg;base64,${imageData}`;
    }
    
    return imageData;
  };

  const getPdfSizeInKB = (base64String) => {
    if (!base64String) return '0.00';
    const cleaned = base64String.replace(/^data:application\/pdf;base64,/, '');
    const sizeInBytes = (cleaned.length * 3) / 4;
    const sizeInKB = sizeInBytes / 1024;
    return sizeInKB.toFixed(2);
  };

  const handleViewPdf = (pdfContent, isPremium) => {
    if (isPremium && !user) {
      setShowLoginModal(true);
      return;
    }
    
    setCurrentPdf(pdfContent);
    setShowPdfModal(true);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/login', { state: { from: `/publications` } });
  };

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await publicationService.getAllPublications();
        const approvedPublications = await Promise.all(
          response.data
            .filter(pub => pub.status === 'APPROVED')
            .map(async pub => {
              const commentsResponse = await commentService.getAllComments(pub.id);
              return { ...pub, commentsCount: commentsResponse.data.length || 0 };
            })
        );
        setPublications(approvedPublications);
        setFilteredPublications(approvedPublications);
      } catch (err) {
        console.error("Error fetching publications:", err);
        setError('Failed to fetch publications');
      } finally {
        setLoadingPublications(false);
      }
    };

    fetchPublications();
  }, []);

  const getFilterOptions = () => {
    const authors = [];
    const domains = [];

    publications.forEach(pub => {
      if (pub.researcher && pub.researcher.username && !authors.includes(pub.researcher.username)) {
        authors.push(pub.researcher.username);
      }
      if (pub.domain && pub.domain.name && !domains.includes(pub.domain.name)) {
        domains.push(pub.domain.name);
      }
    });

    return { authors, domains };
  };

  const filterOptions = getFilterOptions();

  const applyFilters = () => {
    setIsApplyingFilters(true);
    
    try {
      let results = [...publications];

      if (filterForm.author) {
        results = results.filter(pub => 
          pub.researcher && pub.researcher.username === filterForm.author
        );
      }
      
      if (filterForm.domain) {
        results = results.filter(pub => 
          pub.domain && pub.domain.name === filterForm.domain
        );
      }
      
      if (filterForm.premium !== 'all') {
        const isPremium = filterForm.premium === 'premium';
        results = results.filter(pub => 
          isPremium ? pub.premium === true : pub.premium === false
        );
      }
      
      setFilteredPublications(results);
    } catch (error) {
      console.error("Error applying filters:", error);
      setError("An error occurred while applying filters.");
    } finally {
      setIsApplyingFilters(false);
    }
  };

  const [filterForm, setFilterForm] = useState({
    author: '',
    domain: '',
    premium: 'all'
  });

  const handleCreate = async (formData) => {
    try {
      const response = await publicationService.createPublication(formData);
      const newPublication = response.data;
      
      if (newPublication.status === 'APPROVED') {
        setPublications(prev => [...prev, newPublication]);
        setFilteredPublications(prev => [...prev, newPublication]);
      }
      
      setShowForm(false);
      setError('');
    } catch (err) {
      console.error('Creation error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to create publication');
    }
  };

  const handleDelete = async (id) => {
    try {
      await publicationService.deletePublication(id);
      setPublications(prev => prev.filter(pub => pub.id !== id));
      setFilteredPublications(prev => prev.filter(pub => pub.id !== id));
    } catch (err) {
      console.error('Failed to delete publication:', err);
    }
  };

  const handleFilterFormChange = (filterName, value) => {
    setFilterForm(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetFilters = () => {
    setFilterForm({
      author: '',
      domain: '',
      premium: 'all'
    });
    setFilteredPublications([...publications]);
  };

  const toggleComments = async (publicationId) => {
    setActiveComments(prev => ({
      ...prev,
      [publicationId]: !prev[publicationId]
    }));

    if (!activeComments[publicationId]) {
      try {
        setLoadingComments(prev => ({ ...prev, [publicationId]: true }));
        const response = await commentService.getAllComments(publicationId);

        const updatedPublications = filteredPublications.map(pub =>
          pub.id === publicationId
            ? { ...pub, comments: response.data }
            : pub
        );
        setFilteredPublications(updatedPublications);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoadingComments(prev => ({ ...prev, [publicationId]: false }));
      }
    }
  };

  const submitComment = async (publicationId) => {
    const commentText = commentTexts[publicationId]?.trim();
    if (!commentText) return;

    let newComment;
    try {
      newComment = {
        id: Date.now(),
        content: commentText,
        researcher: user,
        createdAt: new Date().toISOString()
      };

      const updatedPublications = filteredPublications.map(pub =>
        pub.id === publicationId
          ? {
              ...pub,
              comments: [...(pub.comments || []), newComment]
            }
          : pub
      );

      setFilteredPublications(updatedPublications);
      setCommentTexts(prev => ({ ...prev, [publicationId]: '' }));

      const response = await commentService.createComment({
        publicationId,
        userId: user.id,
        content: commentText
      });

      setFilteredPublications(prev =>
        prev.map(pub =>
          pub.id === publicationId
            ? {
                ...pub,
                comments: pub.comments.map(comment =>
                  comment.id === newComment.id ? response.data : comment
                )
              }
            : pub
        )
      );
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to post comment');
      setFilteredPublications(prev =>
        prev.map(pub =>
          pub.id === publicationId
            ? {
                ...pub,
                comments: pub.comments?.filter(c => c.id !== newComment.id)
              }
            : pub
        )
      );
    }
  };
  

const renderPublicationImage = (publication) => {
  if (!publication.imageUrl && !publication.pdfContent) return null;

  if (publication.pdfContent) {
    return (
      <div className="mb-3">
        <div 
          className="pdf-preview-card shadow-sm rounded overflow-hidden cursor-pointer"
          onClick={() => handleViewPdf(publication.pdfContent, publication.premium)}
          style={{ cursor: 'pointer', maxHeight: '180px' }}
        >
          <div className="d-flex h-100">
            {/* PDF Icon/Thumbnail Side */}
            <div 
              className="pdf-icon-container d-flex align-items-center justify-content-center"
              style={{ 
                background: '#f8f9fa', 
                width: '100px',
                borderRight: '1px solid #dee2e6'
              }}
            >
              <div className="text-center">
                <FileEarmarkPdf size={42} className="text-danger" />
                <p className="mb-0 mt-1 small">{getPdfSizeInKB(publication.pdfContent)} KB</p>
              </div>
            </div>
            
            {/* PDF Info Side */}
            <div className="p-3 flex-grow-1 d-flex flex-column justify-content-between">
              <div>
                <h6 className="text-truncate mb-1">{publication.title || 'Document'}.pdf</h6>
                <div className="pdf-preview-lines">
                  <div className="preview-line"></div>
                  <div className="preview-line" style={{ width: '85%' }}></div>
                  <div className="preview-line" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div className="d-flex align-items-center mt-2">
                <span className="badge bg-light text-primary">
                  <FileEarmarkPdf size={12} className="me-1" />
                  PDF Document
                </span>
                {publication.premium && (
                  <span className="ms-auto badge bg-warning">
                    <LockFill size={12} className="me-1" />
                    Premium
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Premium Lock Overlay */}
          {publication.premium && !user && (
            <div 
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
              <div className="text-center">
                <LockFill size={28} className="text-warning" />
                <p className="text-white mb-0 mt-1 small">Login to View</p>
              </div>
            </div>
          )}
        </div>
        
        {/* CSS for the preview lines */}
        <style jsx>{`
          .pdf-preview-card {
            position: relative;
            transition: all 0.2s ease;
            height: 120px;
          }
          
          .pdf-preview-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.1)!important;
          }
          
          .preview-line {
            height: 6px;
            background-color: #e9ecef;
            border-radius: 3px;
            margin-bottom: 6px;
            width: 100%;
          }
        `}</style>
      </div>
    );
  }

  const imageSrc = getImageSrc(publication.imageUrl);

  if (publication.imageUrl.toLowerCase().endsWith('.pdf')) {
    return (
      <div className="mb-3">
        <div 
          className="pdf-preview-card shadow-sm rounded overflow-hidden cursor-pointer"
          onClick={() => window.open(imageSrc, '_blank')}
          style={{ cursor: 'pointer', height: '120px' }}
        >
          {/* Similar compact layout for PDF URL */}
          <div className="d-flex h-100">
            <div 
              className="pdf-icon-container d-flex align-items-center justify-content-center"
              style={{ 
                background: '#f8f9fa', 
                width: '100px',
                borderRight: '1px solid #dee2e6'
              }}
            >
              <FileEarmarkPdf size={42} className="text-danger" />
            </div>
            
            <div className="p-3 flex-grow-1">
              <h6 className="text-truncate mb-2">{publication.title || 'Document'}.pdf</h6>
              <div className="d-flex align-items-center">
                <span className="badge bg-light text-primary">
                  <FileEarmarkPdf size={12} className="me-1" />
                  External PDF
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <Image 
        src={imageSrc} 
        fluid 
        rounded 
        className="w-100"
        style={{ maxHeight: '500px', objectFit: 'cover' }}
        alt={publication.title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/default-image.png';
        }}
      />
    </div>
  );
};
  return (
    <Container className="mt-4">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 d-flex align-items-center">
          <FileText className="text-primary me-2" size={24} />
          Research Feed
        </h2>
        <div>
          <Button 
            variant={showFilters ? "primary" : "outline-primary"}
            onClick={() => setShowFilters(!showFilters)}
            className="me-2"
          >
            <Funnel className="me-1" />
            Filters
          </Button>
          {user?.role === 'RESEARCHER' && (
            <Button 
              variant="primary" 
              onClick={() => setShowForm(true)}
            >
              <Plus className="me-1" />
              New Publication
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Author</Form.Label>
                  <Form.Select 
                    value={filterForm.author}
                    onChange={(e) => handleFilterFormChange('author', e.target.value)}
                  >
                    <option value="">All Authors</option>
                    {filterOptions.authors.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Domain</Form.Label>
                  <Form.Select 
                    value={filterForm.domain}
                    onChange={(e) => handleFilterFormChange('domain', e.target.value)}
                  >
                    <option value="">All Domains</option>
                    {filterOptions.domains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select 
                    value={filterForm.premium}
                    onChange={(e) => handleFilterFormChange('premium', e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="premium">Premium Only</option>
                    <option value="regular">Regular Only</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="outline-secondary" 
                onClick={resetFilters}
                size="sm"
                className="me-2"
              >
                <X className="me-1" />
                Reset Filters
              </Button>
              <Button 
                variant="primary" 
                onClick={applyFilters}
                size="sm"
                disabled={isApplyingFilters}
              >
                {isApplyingFilters ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckSquare className="me-1" />
                    Apply Filters
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {showForm ? (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <PublicationForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </Card.Body>
        </Card>
      ) : loadingPublications ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading publications...</p>
        </div>
      ) : filteredPublications.length > 0 ? (
        <div className="feed-container">
          {filteredPublications.map(publication => (
            <Card key={publication.id} className="mb-4 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <Image 
                    src={getImageSrc(publication.researcher?.image || '/person-circle.svg')} 
                    roundedCircle 
                    width={40} 
                    height={40} 
                    className="me-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/person-circle.svg';
                    }}
                  />
                  <div>
                    <h6 className="mb-0">{publication.researcher?.username || 'Unknown User'}</h6>
                    <small className="text-muted">
                      {moment(publication.creationDate).fromNow()}
                    </small>
                  </div>
                  {publication.premium && (
                    <Badge bg="warning" className="ms-auto">
                      Premium
                    </Badge>
                  )}
                </div>
                
                <Card.Title>{publication.title}</Card.Title>
                <Card.Text>{publication.description}</Card.Text>
                
                {renderPublicationImage(publication)}
                
                <div className="d-flex justify-content-end border-top border-bottom py-2 mb-3">
                  <Button 
                    variant="link" 
                    className="text-decoration-none text-muted"
                    onClick={() => toggleComments(publication.id)}
                  >
                    <Chat className="me-1" />
                    {publication.commentsCount || 0} Comments
                  </Button>
                </div>
                
                {activeComments[publication.id] && (
                  <div className="mt-3">
                    {loadingComments[publication.id] ? (
                      <div className="text-center py-3">
                        <Spinner animation="border" size="sm" />
                      </div>
                    ) : (
                      <>
                        <ListGroup className="mb-3">
                          {publication.comments?.map(comment => (
                            <ListGroup.Item key={comment.id} className="border-0">
                              <div className="d-flex">
                                <Image 
                                  src={getImageSrc(comment.user.image || '/person-circle.svg')} 
                                  roundedCircle 
                                  width={32} 
                                  height={32} 
                                  className="me-2"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/person-circle.svg';
                                  }}
                                />
                                <div>
                                  <div className="bg-light p-2 rounded">
                                    <strong>{comment.user.username || 'Unknown'}</strong>
                                    <p className="mb-0">{comment.content}</p>
                                  </div>
                                  <small className="text-muted">
                                    {moment(comment.createdAt).fromNow()}
                                  </small>
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))}
                          {(!publication.comments || publication.comments.length === 0) && (
                            <ListGroup.Item className="text-muted text-center">
                              No comments yet
                            </ListGroup.Item>
                          )}
                        </ListGroup>
                        
                        {user ? (
                          <Form className="mt-2">
                            <Form.Group className="d-flex">
                              <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Write a comment..."
                                value={commentTexts[publication.id] || ''}
                                onChange={(e) => setCommentTexts(prev => ({
                                  ...prev,
                                  [publication.id]: e.target.value
                                }))}
                                className="me-2"
                              />
                              <Button 
                                variant="primary" 
                                onClick={() => submitComment(publication.id)}
                                disabled={!commentTexts[publication.id]?.trim()}
                              >
                                <Send />
                              </Button>
                            </Form.Group>
                          </Form>
                        ) : (
                          <Alert variant="info" className="py-2 mt-2 mb-0">
                            <a href="/login" className="alert-link">Login</a> to leave a comment.
                          </Alert>
                        )}
                      </>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-5 shadow-sm">
          <FileText size={48} className="text-muted mb-3" />
          <h5>No Publications Found</h5>
          <p className="text-muted mb-4">
            {Object.values(filterForm).some(f => f && f !== 'all') 
              ? "No publications match your current filters" 
              : "There are currently no approved publications available"}
          </p>
          {Object.values(filterForm).some(f => f && f !== 'all') ? (
            <Button 
              variant="outline-primary" 
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          ) : (
            user?.role === 'RESEARCHER' && (
              <Button 
                variant="primary" 
                onClick={() => setShowForm(true)}
              >
                <Plus className="me-1" />
                Create First Publication
              </Button>
            )
          )}
        </Card>
      )}

      {/* PDF Preview Modal */}
      <Modal 
        show={showPdfModal} 
        onHide={() => setShowPdfModal(false)} 
        size="lg"
        centered
        fullscreen="md-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>PDF Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {currentPdf && (
            <iframe 
              src={`data:application/pdf;base64,${currentPdf}`}
              width="100%"
              height="600px"
              style={{ border: 'none' }}
              title="PDF Preview"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPdfModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              const pdfWindow = window.open();
              pdfWindow.document.write(
                `<iframe width='100%' height='100%' src='data:application/pdf;base64,${currentPdf}'></iframe>`
              );
            }}
          >
            Open in New Window
          </Button>
        </Modal.Footer>
      </Modal>

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

export default PublicationFeed;