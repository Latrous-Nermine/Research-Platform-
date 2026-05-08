import { Card, Button, Badge, Image, Tooltip, OverlayTrigger, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trash, Eye, Person, Envelope } from 'react-bootstrap-icons';

const UserCard = ({ user: userData, onDelete }) => {
  const { user } = useAuth();

  // Function to check if the image is a base64 string
  const isBase64Image = (str) => {
    if (typeof str !== 'string') return false;
    return str.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(str);
  };

  // Function to get the proper image source
  const getImageSrc = () => {
    if (!userData.image) return null;
    
    if (isBase64Image(userData.image)) {
      // If it's already a proper data URL
      if (userData.image.startsWith('data:image')) {
        return userData.image;
      }
      // If it's just base64 without the prefix
      return `data:image/jpeg;base64,${userData.image}`;
    }
    
    // If it's a URL path
    return userData.image;
  };

  const imageSrc = getImageSrc();

  // Truncate long text with ellipsis
  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n-1) + '...' : str;
  };

  return (
    <Card className="mb-3 shadow-sm user-card">
      <Card.Body className="p-3">
        <div className="d-flex align-items-start mb-3" style={{ minWidth: 0 }}>
          {/* User Image with fallback */}
          <div className="me-3 flex-shrink-0">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={userData.username}
                roundedCircle
                className="user-avatar"
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-profile.png';
                }}
              />
            ) : (
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center user-avatar-placeholder"
                style={{
                  width: '64px',
                  height: '64px',
                }}
              >
                <Person size={24} className="text-muted" />
              </div>
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center mb-1">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{userData.username}</Tooltip>}
              >
                <h5 className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                  {userData.username}
                </h5>
              </OverlayTrigger>
              <Badge 
                bg={userData.role === 'ADMIN' ? 'danger' : 'secondary'} 
                className="ms-2" 
                pill
                style={{ fontSize: '0.65rem' }}
              >
                {userData.role}
              </Badge>
            </div>
            
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{userData.email}</Tooltip>}
            >
              <p className="text-muted mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                <Envelope size={14} className="me-1" />
                {truncate(userData.email, 25)}
              </p>
            </OverlayTrigger>
          </div>
        </div>

        <Stack direction="horizontal" gap={2} className="justify-content-end">
          <Button
            as={Link}
            to={`/users/${userData.id}`}
            variant="outline-primary"
            size="sm"
            className="d-flex align-items-center action-button"
          >
            <Eye className="me-1" size={16} />
            View
          </Button>

          {user?.role === 'ADMIN' && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(userData.id)}
              className="d-flex align-items-center action-button"
            >
              <Trash className="me-1" size={16} />
              Delete
            </Button>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default UserCard;