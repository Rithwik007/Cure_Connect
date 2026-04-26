import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UserPlus, ArrowLeft } from 'lucide-react';

const NewPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.age || !formData.gender) {
      setError('Please fill in all required fields (Name, Age, Gender).');
      return;
    }

    try {
      // Backend generates patientCode and IDs
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10),
        patientCode: `P-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      };

      await api.post('/patients', payload);
      navigate('/patients');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create patient');
    }
  };

  return (
    <Row className="justify-content-md-center">
      <Col xs={12} md={8}>
        <div className="mb-4 d-flex align-items-center gap-3">
          <Button variant="outline-secondary" onClick={() => navigate('/patients')} className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <ArrowLeft size={20} />
          </Button>
          <h2 className="fw-bold mb-0">New Patient Registry</h2>
        </div>

        <Card className="border-0 shadow-sm overflow-hidden">
          <Card.Header className="bg-white py-3 border-0">
            <div className="d-flex align-items-center gap-2">
              <UserPlus size={20} className="text-primary" />
              <h5 className="mb-0 fw-bold">Basic Information</h5>
            </div>
          </Card.Header>
          <Card.Body className="p-4 pt-2">
            {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. John Doe"
                  className="bg-light border-0 py-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Form.Group>

              <Row className="mb-3 g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Age *</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="e.g. 34"
                      className="bg-light border-0 py-2"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-muted text-uppercase">Gender *</Form.Label>
                    <Form.Select
                      className="bg-light border-0 py-2"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted text-uppercase">Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Optional contact number"
                  className="bg-light border-0 py-2"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="light" onClick={() => navigate('/patients')} className="px-4 fw-semibold text-muted">
                  Discard
                </Button>
                <Button variant="primary" type="submit" className="px-5 fw-bold">
                  Save & Add to Directory
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default NewPatientPage;
