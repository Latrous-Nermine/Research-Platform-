import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import { Alert, Card, Container, Button } from 'react-bootstrap';
import { ArrowLeft, PersonCircle, PersonPlus } from 'react-bootstrap-icons';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (credentials) => {
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Container className="mt-5 auth-container">
      <div className="text-start mb-4">
        <Button 
          as={Link} 
          to="/" 
          variant="outline-primary" 
          className="back-button"
        >
          <ArrowLeft className="me-2" />
          Back to Home
        </Button>
      </div>

      <Card className="shadow-sm auth-card">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <PersonCircle size={48} className="text-primary mb-3" />
            <h2>Welcome Back</h2>
            <p className="text-muted">Sign in to your research account</p>
          </div>

          {error && (
            <Alert 
              variant="danger" 
              dismissible 
              onClose={() => setError('')}
              className="text-center"
            >
              {error}
            </Alert>
          )}

          <LoginForm onSubmit={handleSubmit} />
          {/* <div className="mt-4 text-center">
            <p className="text-muted">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="d-inline-flex align-items-center text-primary"
              >
                <PersonPlus className="me-1" />
                Register here
              </Link>
            </p>
          </div> */}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;