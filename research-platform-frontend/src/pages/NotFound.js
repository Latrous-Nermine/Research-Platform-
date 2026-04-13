import { Link } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';

const NotFound = () => {
  return (
    <div className="text-center mt-5">
      <Card className="mx-auto" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <Card.Title className="display-1">404</Card.Title>
          <Card.Text className="lead">
            Oops! The page you're looking for doesn't exist.
          </Card.Text>
          <Button as={Link} to="/" variant="primary">
            Go Home
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NotFound;