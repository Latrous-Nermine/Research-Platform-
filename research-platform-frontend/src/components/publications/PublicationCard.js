import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FileEarmarkText,
  Person,
  Tag,
  Eye,
  Trash,
  Star,
  Clock,
  ArrowRight,
  Hourglass
} from 'react-bootstrap-icons';

const PublicationCard = ({ publication, onDelete, onStatusUpdate}) => {
  const { user } = useAuth();

  // Status color mapping
  const statusVariant = {
    PENDING: 'secondary',
    APPROVED: 'success',
    REJECTED: 'danger',
    // PUBLISHED: 'primary'
  };

  return (
    <Card className="publication-card mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0 d-flex align-items-center">
            <FileEarmarkText className="text-primary me-2" size={20} />
            <span className="publication-title">{publication.title}</span>
          </Card.Title>
          <div className="d-flex">
            {publication.premium && (
              <Badge pill bg="warning" className="d-flex align-items-center ms-2 premium-badge">
                <Star size={12} className="me-1" />
                Premium
              </Badge>
            )}
            <Badge 
              pill 
              bg={statusVariant[publication.status] || 'info'}
              className="ms-2 status-badge d-flex align-items-center"
            >
              {publication.status === 'PENDING' && <Hourglass size={12} className="me-1" />}
              {publication.status}
            </Badge>
          </div>
        </div>

        <div className="publication-meta mb-3">
          <div className="d-flex align-items-center mb-1">
            <Tag className="text-muted me-2" size={14} />
            <span className="text-muted small">
              <strong>Domain:</strong> {publication.domain?.name}
            </span>
          </div>
          <div className="d-flex align-items-center">
            <Person className="text-muted me-2" size={14} />
            <span className="text-muted small">
              <strong>Author:</strong> {publication.researcher?.username}
            </span>
          </div>
          {publication.createdAt && (
            <div className="d-flex align-items-center mt-1">
              <Clock className="text-muted me-2" size={14} />
              <span className="text-muted small">
                {new Date(publication.creationDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* <div className="d-flex justify-content-between align-items-center">
          <Link 
            to={`/publications/${publication.id}`} 
            className="btn btn-outline-primary btn-sm d-flex align-items-center"
          >
            <Eye className="me-1" size={14} />
            View Details
            <ArrowRight className="ms-1" size={14} />
          </Link>
          
          {(user?.role === 'ADMIN' || user?.id === publication.researcher?.id) && (
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => onDelete(publication.id)}
              className="d-flex align-items-center"
            >
              <Trash className="me-1" size={14} />
              Delete
            </Button>
          )}
        </div> */}

        <div className="d-flex justify-content-between align-items-center">
  <Link 
    to={`/publications/${publication.id}`} 
    className="btn btn-outline-primary btn-sm d-flex align-items-center"
  >
    <Eye className="me-1" size={14} />
    View Details
    <ArrowRight className="ms-1" size={14} />
  </Link>

  {publication.status === 'PENDING' && (user?.role === 'ADMIN' || user?.role === 'MODERATEUR') && (
    <div className="d-flex">
      <Button 
        variant="outline-success" 
        size="sm" 
        className="me-2"
        onClick={() => onStatusUpdate(publication.id, 'APPROVED')}
      >
        ✅
        {/* Accept */}
      </Button>
      <Button 
        variant="outline-danger" 
        size="sm"
        onClick={() => onStatusUpdate(publication.id, 'REJECTED')}
      >
        ❌ 
        {/* Reject */}
      </Button>
    </div>
  )}

  {(user?.role === 'ADMIN' || user?.role === 'MODERATEUR' || user?.id === publication.researcher?.id) && (
    <Button 
      variant="outline-danger" 
      size="sm"
      onClick={() => onDelete(publication.id)}
      className="d-flex align-items-center ms-2"
    >
      <Trash className="me-1" size={14} />
      Delete
    </Button>
  )}
</div>

      </Card.Body>
    </Card>
  );
};

export default PublicationCard;