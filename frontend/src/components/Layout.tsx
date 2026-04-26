import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, LayoutDashboard, Users, LogOut, User as UserIcon } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <Navbar expand="lg" className="nav-glass mb-4 py-3">
        <Container>
          <Navbar.Brand as={Link as any} to="/" className="fw-bold d-flex align-items-center gap-2 fs-4 text-primary">
            <div className="bg-primary bg-opacity-10 p-2 rounded-3">
              <Activity size={24} className="text-primary" />
            </div>
            <span style={{ letterSpacing: '-0.02em' }}>CureConnect</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto gap-2">
              {user?.role === 'doctor' && (
                <>
                  <Nav.Link 
                    as={Link as any} 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2 transition-all ${isActive('/dashboard') ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                  >
                    <LayoutDashboard size={18} />
                    Doctor Dashboard
                  </Nav.Link>
                  <Nav.Link 
                    as={Link as any} 
                    to="/patients" 
                    className={`px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2 transition-all ${isActive('/patients') ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                  >
                    <Users size={18} />
                    Patient Directory
                  </Nav.Link>
                </>
              )}
              {user?.role === 'patient' && (
                <Nav.Link 
                  as={Link as any} 
                  to="/patient-dashboard" 
                  className={`px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2 transition-all ${isActive('/patient-dashboard') ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                >
                  <LayoutDashboard size={18} />
                  My Health Portal
                </Nav.Link>
              )}
            </Nav>
            
            <Nav className="align-items-center gap-3">
              {user ? (
                <>
                  <div className="d-flex align-items-center gap-3 bg-light px-3 py-1 rounded-pill border">
                    <div className="text-end d-none d-sm-block">
                      <div className="fw-bold small">{user.name}</div>
                      <div className="text-muted small text-capitalize" style={{ fontSize: '0.7rem' }}>{user.role}</div>
                    </div>
                    <div className="bg-white p-1 rounded-circle border shadow-sm">
                      <UserIcon size={20} className="text-primary" />
                    </div>
                  </div>
                  <Button 
                    variant="link" 
                    onClick={handleLogout} 
                    className="text-danger p-0 text-decoration-none hover-scale d-flex align-items-center gap-2 fw-semibold"
                  >
                    <LogOut size={18} />
                    <span className="d-none d-md-inline">Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link as any} to="/login" className="fw-semibold text-muted">Login</Nav.Link>
                  <Button as={Link as any} to="/register" variant="primary" className="btn-premium">
                    Get Started
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container className="pb-5 animate-fade-in">
        {children}
      </Container>
    </>
  );
};

export default Layout;
