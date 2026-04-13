import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { PersonCircle, BoxArrowRight, JournalBookmark, HouseDoor, People, Collection } from 'react-bootstrap-icons';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Custom NavLink component with blue active styling
  const CustomNavLink = ({ to, children, icon: Icon }) => (
    <Nav.Link
      as={Link}
      to={to}
      className="d-flex align-items-center"
      active={location.pathname.startsWith(to)}
      style={{
        fontWeight: location.pathname.startsWith(to) ? '600' : 'normal'
      }}
    >
      <Icon className="me-1" size={18} />
      {children}
    </Nav.Link>
  );

  return (
    <Navbar bg="white" variant="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <JournalBookmark className="text-primary me-2" size={24} />
          <span className="fw-bold">ResearchHub</span>

        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <CustomNavLink to="/dashboard" icon={HouseDoor}>
                  Dashboard
                </CustomNavLink>
                <CustomNavLink to="/publications" icon={JournalBookmark}>
                  Publications
                </CustomNavLink>
                {['ADMIN', 'MODERATEUR'].includes(user.role) && (
                  <CustomNavLink to="/domains" icon={Collection}>
                    Domains
                  </CustomNavLink>
                )}
                {user.role === 'ADMIN' && (
                  <CustomNavLink to="/users" icon={People}>
                    Users
                  </CustomNavLink>
                )}
              </>
            )}
          </Nav>
          
          <Nav>
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="d-flex align-items-center">
                  <PersonCircle className="me-2" size={20} />
                  <span className="text-dark">{user.username}</span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu className="border-0 shadow-sm">
                  <Dropdown.Item 
                    as={Link} 
                    to="/profile" 
                    className="d-flex align-items-center"

                  >
                    <PersonCircle className="me-2" size={18} />
                    My Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item 
                    onClick={handleLogout} 
                    className="d-flex align-items-center text-danger"
                  >
                    <BoxArrowRight className="me-2" size={18} />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button 
                as={Link} 
                to="/login" 
                variant="outline-primary" 
                className="d-flex align-items-center"
              >
                <BoxArrowRight className="me-1" size={18} />
                Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;