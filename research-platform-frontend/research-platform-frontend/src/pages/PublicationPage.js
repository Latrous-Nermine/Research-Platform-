import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import publicationService from '../api/publications';
import { Button, Alert, Spinner, Card, Container, Form, Row, Col, Badge } from 'react-bootstrap';
import { Plus, FileText, Person, Clock, Funnel, X, CheckSquare } from 'react-bootstrap-icons';
import PublicationForm from '../components/publications/PublicationForm';
import PublicationList from '../components/publications/PublicationList';

const PublicationPage = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  
  // Track form state separately from applied filters
  const [filterForm, setFilterForm] = useState({
    author: '',
    domain: '',
    status: '',
    premium: 'all'
  });

  // Fetch publications and initialize filtered publications
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await publicationService.getAllPublications();
        console.log("Fetched publications:", response.data);
        const isRestrictedUser = !user || user.role === 'USER' || user.role === 'RESEARCHER';
        const data = isRestrictedUser
          ? response.data.filter(pub => pub.status === 'APPROVED')
          : response.data;
        setPublications(data);
        setFilteredPublications(data); // Initialize with all publications
      } catch (err) {
        console.error("Error fetching publications:", err);
        setError('Failed to fetch publications');
      } finally {
        setLoadingPublications(false);
      }
    };

    fetchPublications();
  }, []);

  // Function to apply filters
  const applyFilters = () => {
    setIsApplyingFilters(true);
    
    try {
      // Make a fresh copy of the publications for filtering
      let results = [...publications];
      
      // Filter by author
      if (filterForm.author) {
        results = results.filter(pub => 
          pub.researcher && pub.researcher.username === filterForm.author
        );
      }
      
      // Filter by domain
      if (filterForm.domain) {
        results = results.filter(pub => 
          pub.domain && pub.domain.name === filterForm.domain
        );
      }
      
      // Filter by status
      if (filterForm.status) {
        results = results.filter(pub => 
          pub.status === filterForm.status
        );
      }
      
      // Filter by premium status
      if (filterForm.premium !== 'all') {
        const isPremium = filterForm.premium === 'premium';
        results = results.filter(pub => 
          isPremium ? pub.premium === true : pub.premium === false
        );
      }
      
      console.log(`Filtered from ${publications.length} to ${results.length} publications`);
      
      // Update state with filtered results
      setFilteredPublications(results);
    } catch (error) {
      console.error("Error applying filters:", error);
      setError("An error occurred while applying filters.");
    } finally {
      setIsApplyingFilters(false);
    }
  };

  // Get unique filter options
  const getFilterOptions = () => {
    const authors = [...new Set(publications.filter(p => p.researcher).map(p => p.researcher.username))];
    const domains = [...new Set(publications.filter(p => p.domain).map(p => p.domain.name))];
    const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
    
    return { authors, domains, statuses };
  };

  const filterOptions = getFilterOptions();

  // const handleCreate = async (publicationData) => {
  //   try {
  //     const completeData = {
  //       ...publicationData,
  //       researcher: { id: user.id },
  //     };
  //     const response = await publicationService.createPublication(completeData);
  //     setPublications(prev => [...prev, response.data]);
  //     setShowForm(false);
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Failed to create publication');
  //   }
  // };

  const handleCreate = async (formData) => {
  try {
      const response = await publicationService.createPublication(formData);
    // setPublications(prev => [...prev, response.data]);
    window.location.reload();
    // setShowForm(false);
    setError(''); // Clear any previous errors
  } catch (err) {
    console.error('Creation error:', err.response?.data);
    setError(err.response?.data?.message || 'Failed to create publication');
  }
};

//   const handleCreate = async (formData) => {
//   try {
//     const response = await publicationService.createPublication(formData);
//     setPublications(prev => [...prev, response.data]);
//     setShowForm(false);
//   } catch (err) {
//     setError(err.response?.data?.message || 'Failed to create publication');
//     console.error("Creation error details:", err);
//   }
// };

  const handleDelete = async (id) => {
    try {
      await publicationService.deletePublication(id);
      setPublications(publications.filter(publication => publication.id !== id));
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete publication:', err);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await publicationService.updatePublicationStatus(id, status);
      // Refresh or update the UI, e.g., refetch data or update local state
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFilterFormChange = (filterName, value) => {
    setFilterForm(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const resetFilters = () => {
    const resetValues = {
      author: '',
      domain: '',
      status: '',
      premium: 'all'
    };
    setFilterForm(resetValues);
    // Reset to show all publications
    setFilteredPublications([...publications]);
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
          Research Publications
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
              <Col md={3}>
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
              <Col md={3}>
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
              {(!user || user.role !== 'USER') && (
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      value={filterForm.status}
                      onChange={(e) => handleFilterFormChange('status', e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      {filterOptions.statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              <Col md={3}>
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
      ) : loadingPublications || isApplyingFilters ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">
            {loadingPublications ? "Loading publications..." : "Applying filters..."}
          </p>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between mb-3">
            <small className="text-muted">
              <Person className="me-1" size={14} />
              Showing {filteredPublications.length} of {publications.length} publications
              {filteredPublications.length !== publications.length && (
                <span className="ms-2 text-primary">
                  (Filtered)
                </span>
              )}
            </small>
            <small className="text-muted">
              <Clock className="me-1" size={14} />
              Updated: {new Date().toLocaleDateString()}
            </small>
          </div>

          {filteredPublications.length > 0 ? (
            // Pass the filtered publications to the PublicationList component
            <PublicationList 
              publications={filteredPublications}
              onCreate={handleCreate} 
              onDelete={handleDelete} 
              onStatusUpdate={handleStatusUpdate} 
  
            />
          ) : (
            <Card className="text-center py-5 shadow-sm">
              <FileText size={48} className="text-muted mb-3" />
              <h5>No Publications Found</h5>
              <p className="text-muted mb-4">
                {Object.values(filterForm).some(f => f && f !== 'all') 
                  ? "No publications match your current filters" 
                  : "There are currently no publications available"}
              </p>
              {Object.values(filterForm).some(f => f && f !== 'all') ? (
                <Button 
                  variant="outline-primary" 
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              ) : (
                // user?.role === 'RESEARCHER' && (
                  <Button 
                    variant="primary" 
                    onClick={() => setShowForm(true)}
                    className="d-flex align-items-center mx-auto"
                  >
                    <Plus className="me-2" size={18} />
                    Create First Publication
                  </Button>
                // )
              )}
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default PublicationPage;