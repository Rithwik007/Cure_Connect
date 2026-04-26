import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert, Card, Container, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import { Activity, Mail, Lock, UserPlus, User, Phone, Calendar } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'doctor' | 'patient'>('patient');
  
  // New Patient-specific fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const roles = [
    { name: 'Patient', value: 'patient' },
    { name: 'Doctor', value: 'doctor' },
  ];

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all basic fields');
      return;
    }

    if (role === 'patient' && (!age || !gender)) {
      setError('Patients must provide Age and Gender');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const payload = {
        name,
        email,
        password,
        role,
        ...(role === 'patient' ? { age: parseInt(age), gender, phone } : {})
      };

      const { data } = await api.post(
        '/auth/register',
        payload
      );

      login({ 
        _id: data._id, 
        name: data.name, 
        email: data.email, 
        role: data.role,
        age: data.age,
        gender: data.gender,
        phone: data.phone
      }, data.token);
      
      navigate(data.role === 'doctor' ? '/dashboard' : '/patient-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="bg-light vh-100 d-flex align-items-center py-5">
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col xs={12} md={role === 'patient' ? 8 : 5}>
            <div className="text-center mb-4">
              <div className="bg-white p-3 rounded-4 shadow-sm d-inline-block mb-3">
                <Activity size={40} className="text-primary" />
              </div>
              <h3 className="fw-bold text-dark">CureConnect</h3>
              <p className="text-muted">Register for your clinical account</p>
            </div>
            
            <Card className="border-0 shadow-lg p-4">
              <Card.Body>
                <h4 className="fw-bold mb-4">Create Account</h4>
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                
                <Form onSubmit={submitHandler}>
                  <div className="mb-4">
                    <label className="small fw-bold text-muted text-uppercase mb-2 d-block">I am a:</label>
                    <ButtonGroup className="w-100">
                      {roles.map((r, idx) => (
                        <ToggleButton
                          key={idx}
                          id={`role-${idx}`}
                          type="radio"
                          variant="outline-primary"
                          name="radio"
                          value={r.value}
                          checked={role === r.value}
                          onChange={(e) => setRole(e.currentTarget.value as any)}
                          className="py-2 fw-semibold"
                        >
                          {r.name}
                        </ToggleButton>
                      ))}
                    </ButtonGroup>
                  </div>

                  <Row>
                    <Col md={role === 'patient' ? 6 : 12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Full Name</Form.Label>
                        <div className="position-relative">
                          <User size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                          <Form.Control
                            type="text"
                            placeholder="e.g. John Doe"
                            className="ps-5 py-2 border-light bg-light"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                        <div className="position-relative">
                          <Mail size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                          <Form.Control
                            type="email"
                            placeholder="name@example.com"
                            className="ps-5 py-2 border-light bg-light"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Password</Form.Label>
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

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Confirm Password</Form.Label>
                        <div className="position-relative">
                          <Lock size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                          <Form.Control
                            type="password"
                            placeholder="••••••••"
                            className="ps-5 py-2 border-light bg-light"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    {role === 'patient' && (
                      <Col md={6} className="border-start">
                        <div className="ps-md-4">
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Age *</Form.Label>
                            <div className="position-relative">
                              <Calendar size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                              <Form.Control
                                type="number"
                                placeholder="34"
                                className="ps-5 py-2 border-light bg-light"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                              />
                            </div>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Gender *</Form.Label>
                            <Form.Select 
                              className="py-2 border-light bg-light"
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted text-uppercase">Phone Number</Form.Label>
                            <div className="position-relative">
                              <Phone size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                              <Form.Control
                                type="tel"
                                placeholder="+91 98765 43210"
                                className="ps-5 py-2 border-light bg-light"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                              />
                            </div>
                          </Form.Group>
                          
                          <div className="mt-4 p-3 bg-info bg-opacity-10 rounded-3 small">
                            <p className="mb-0 text-info fw-semibold">This data helps the doctor identify you during your appointment.</p>
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>

                  <Button variant="primary" type="submit" className="w-100 py-3 mt-4 fw-bold d-flex align-items-center justify-content-center gap-2 shadow">
                    <UserPlus size={20} />
                    Create {role === 'doctor' ? 'Clinical' : 'Personal'} Account
                  </Button>
                </Form>

                <div className="text-center mt-4 pt-3 border-top">
                  <span className="text-muted small">Already have an account? </span>
                  <Link to="/login" className="small fw-bold text-primary text-decoration-none">Sign In Instead</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;
