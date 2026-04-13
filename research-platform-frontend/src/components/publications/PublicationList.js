import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PublicationCard from './PublicationCard';
import PublicationForm from './PublicationForm';
import { Button, Row, Col, Form } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';

const PublicationList = ({ 
  publications = [], 
  onDelete, 
  onCreate,
  onStatusUpdate,
  onSelectPublication 
}) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPublications = publications.filter(pub =>
    pub?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (publicationData) => {
    try {
      await onCreate(publicationData);
      setShowForm(false);
      window.location.reload();
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await onStatusUpdate(id, status);
      window.location.reload();
      // Optionally, you can update the local state to reflect the change immediately
      // const updatedPublications = publications.map(pub =>
      //   pub.id === id ? { ...pub, status } : pub
      // );
      // setPublications(updatedPublications);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div>
      {showForm && (
        <PublicationForm 
          onSubmit={handleCreate} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      <Form.Group className="mb-3"  style={{ paddingTop: '1rem' }}>
        <Form.Control
          type="text"
          placeholder="Search publications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <Row>
        {filteredPublications.length > 0 ? (
          filteredPublications.map(publication => (
            <Col key={publication.id} md={6} lg={4} className="mb-3">
              <PublicationCard 
                publication={publication} 
                onDelete={onDelete}
                // onStatusUpdate={onStatusUpdate} 
                onStatusUpdate={handleStatusUpdate} 
                onClick={() => onSelectPublication && onSelectPublication(publication)}
              />
            </Col>
          ))
        ) : (
          <Col>
            <p>No publications found</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default PublicationList;