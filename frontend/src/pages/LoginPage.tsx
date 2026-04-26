import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert, Card, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import { Activity, Mail, Lock, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await api.post(
        '/auth/login',
        { email, password }
      );

      login({ _id: data._id, name: data.name, email: data.email, role: data.role }, data.token);
      navigate(data.role === 'doctor' ? '/dashboard' : '/patient-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="bg-light vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={5}>
            <div className="text-center mb-4">
              <div className="bg-white p-3 rounded-4 shadow-sm d-inline-block mb-3">
                <Activity size={40} className="text-primary" />
              </div>
              <h3 className="fw-bold text-dark">CureConnect</h3>
              <p className="text-muted">Doctor & Patient Portal</p>
            </div>
            
            <Card className="border-0 shadow-lg p-4">
              <Card.Body>
                <h4 className="fw-bold mb-4">Sign In</h4>
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                <Form onSubmit={submitHandler}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label className="small fw-semibold text-muted text-uppercase">Email Address</Form.Label>
                    <div className="position-relative">
                      <Mail size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                      <Form.Control
                        type="email"
                        placeholder="doctor@example.com"
                        className="ps-5 py-2 border-light bg-light"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="password">
                    <Form.Label className="small fw-semibold text-muted text-uppercase">Password</Form.Label>
                    <div className="position-relative">
                      <Lock size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        className="ps-5 py-2 border-light bg-light"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
                    <LogIn size={20} />
                    Enter Portal
                  </Button>
                </Form>

                <div className="text-center mt-4 pt-3 border-top">
                  <div className="bg-light p-2 rounded-3 mb-3 d-flex align-items-center justify-content-center gap-2">
                    <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                    <span className="small text-muted fw-semibold">End-to-End Encrypted Portal</span>
                  </div>
                  <span className="text-muted small">New to the platform? </span>
                  <Link to="/register" className="small fw-bold text-primary text-decoration-none">Register Account</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
