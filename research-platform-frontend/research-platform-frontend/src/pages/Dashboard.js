import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import publicationService from '../api/publications';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await publicationService.getAllPublications();
        const publications = response.data;
        
        const userStats = {
          totalPublications: publications.length,
          approvedPublications: publications.filter(p => p.status === 'APPROVED').length,
          pendingPublications: publications.filter(p => p.status === 'PENDING').length,
          premiumPublications: publications.filter(p => p.premium).length
        };
        
        setStats(userStats);
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      <p>Welcome back, {user?.username}!</p>
      
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Total Publications</Card.Title>
              <Card.Text className="display-6">{stats?.totalPublications}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Approved</Card.Title>
              <Card.Text className="display-6">{stats?.approvedPublications}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Pending</Card.Title>
              <Card.Text className="display-6">{stats?.pendingPublications}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Premium</Card.Title>
              <Card.Text className="display-6">{stats?.premiumPublications}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;