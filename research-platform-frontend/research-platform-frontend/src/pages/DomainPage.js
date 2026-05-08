import { useState, useEffect } from 'react';
import { Button, Card, Container, Spinner, Table } from 'react-bootstrap';
import { Collection, Plus, ArrowLeft, Pencil, Trash } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import domainService from '../api/domains';
import DomainForm from '../components/domains/DomainForm';

const DomainsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentDomain, setCurrentDomain] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDomains = async () => {
    try {
      const response = await domainService.getAllDomains();
      setDomains(response.data);
    } catch (err) {
      console.error('Failed to fetch domains:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleCreate = () => {
    setCurrentDomain(null);
    setShowForm(true);
  };

  const handleEdit = (domain) => {
    setCurrentDomain(domain);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await domainService.deleteDomain(id);
      setDomains(domains.filter(domain => domain.id !== id));
    } catch (err) {
      console.error('Failed to delete domain:', err);
    }
  };

  const handleSubmit = async (domainData) => {
    try {
      if (currentDomain) {
        const response = await domainService.updateDomain(currentDomain.id, domainData);
        setDomains(domains.map(domain => 
          domain.id === currentDomain.id ? response.data : domain
        ));
      } else {
        const response = await domainService.createDomain(domainData);
        setDomains([...domains, response.data]);
      }
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save domain:', err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="mt-4 domains-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link to="/" className="me-3 text-decoration-none">
            <ArrowLeft size={20} className="text-muted" />
          </Link>
          <h2 className="mb-0 d-flex align-items-center">
            <Collection className="text-primary me-2" size={24} />
            Research Domains
          </h2>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'MODERATEUR') && (
          <Button 
            variant="primary" 
            onClick={handleCreate}
            className="d-flex align-items-center"
          >
            <Plus className="me-2" size={18} />
            Add Domain
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          {showForm ? (
            <DomainForm
              domain={currentDomain}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              show={showForm}
            />
          ) : domains.length > 0 ? (
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-light">
                  <th>Name</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.id} className="border-top">
                    <td className="fw-semibold align-middle">{domain.name}</td>
                    <td className="text-end align-middle">
                      <div className="d-flex justify-content-end gap-2">
                        {(user?.role === 'ADMIN' || user?.role === 'MODERATEUR') && (
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(domain)}
                              className="p-1"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(domain.id)}
                              className="p-1"
                            >
                              <Trash size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <Collection size={48} className="text-muted mb-3" />
              <h5>No Domains Found</h5>
              <p className="text-muted mb-4">There are currently no research domains available</p>
              {(user?.role === 'ADMIN' || user?.role === 'MODERATEUR') && (
                <Button 
                  variant="primary" 
                  onClick={handleCreate}
                  className="d-flex align-items-center mx-auto"
                >
                  <Plus className="me-2" size={18} />
                  Create First Domain
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DomainsPage;