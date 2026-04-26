import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../api';
import { Save, Plus, Trash2, Clipboard } from 'lucide-react';

const NewVisitPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    reason: '',
    treatment: '',
    notes: '',
    nextAppointment: '',
    prescription: [{ medicine: '', dosage: '', frequency: '', duration: '' }]
  });

  const handleAddMed = () => {
    setFormData({
      ...formData,
      prescription: [...formData.prescription, { medicine: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const handleRemoveMed = (index: number) => {
    const newPresc = formData.prescription.filter((_, i) => i !== index);
    setFormData({ ...formData, prescription: newPresc });
  };

  const handleMedChange = (index: number, field: string, value: string) => {
    const newPresc = [...formData.prescription];
    (newPresc[index] as any)[field] = value;
    setFormData({ ...formData, prescription: newPresc });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/visits', { ...formData, patientId });
      navigate(`/patients/${patientId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-5">
      <div className="mb-5">
        <h2 className="fw-bold mb-1 fs-1">Record New Visit</h2>
        <p className="text-muted fs-5">Fill in the clinical details for the patient's consultation.</p>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm mb-4">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={8}>
            <Card className="glass-card border-0 mb-4 p-3">
              <Card.Body>
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <Clipboard size={20} className="text-primary" />
                  Clinical Findings
                </h5>
                
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase ls-wide mb-2">Visit Date</Form.Label>
                      <Form.Control 
                        type="date"
                        required
                        className="bg-light border-0 py-3 rounded-4 fw-medium"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted text-uppercase ls-wide mb-2">Reason for Visit</Form.Label>
                      <Form.Control 
                        type="text"
                        required
                        placeholder="e.g. Regular Checkup"
                        className="bg-light border-0 py-3 rounded-4 fw-medium"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase ls-wide mb-2">Symptoms & Complaints</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={3}
                    required
                    placeholder="What is the patient experiencing?"
                    className="bg-light border-0 py-3 rounded-4 fw-medium"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase ls-wide mb-2">Diagnosis</Form.Label>
                  <Form.Control 
                    type="text"
                    required
                    placeholder="Primary medical diagnosis"
                    className="bg-light border-0 py-3 rounded-4 fw-bold text-primary"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase ls-wide mb-2">Treatment Plan</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={3}
                    required
                    placeholder="Recommended actions, rest, etc."
                    className="bg-light border-0 py-3 rounded-4 fw-medium"
                    value={formData.treatment}
                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="glass-card border-0 p-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <Clipboard size={20} className="text-primary" />
                    Prescription (E-Prescribe)
                  </h5>
                  <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={handleAddMed}>
                    <Plus size={16} /> Add Item
                  </Button>
                </div>

                {formData.prescription.map((med, index) => (
                  <Row key={index} className="g-2 mb-3 align-items-end animate-fade-in">
                    <Col md={4}>
                      <Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.6rem' }}>Medicine Name</Form.Label>
                      <Form.Control 
                        type="text"
                        placeholder="e.g. Amoxicillin"
                        className="bg-light border-0 py-2 rounded-3 fw-bold"
                        value={med.medicine}
                        onChange={(e) => handleMedChange(index, 'medicine', e.target.value)}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.6rem' }}>Dosage</Form.Label>
                      <Form.Control 
                        type="text"
                        placeholder="500mg"
                        className="bg-light border-0 py-2 rounded-3"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.6rem' }}>Frequency</Form.Label>
                      <Form.Control 
                        type="text"
                        placeholder="1-0-1 (After Food)"
                        className="bg-light border-0 py-2 rounded-3"
                        value={med.frequency}
                        onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Label className="small fw-bold text-muted text-uppercase" style={{ fontSize: '0.6rem' }}>Duration</Form.Label>
                      <Form.Control 
                        type="text"
                        placeholder="5 Days"
                        className="bg-light border-0 py-2 rounded-3"
                        value={med.duration}
                        onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                      />
                    </Col>
                    <Col md={1}>
                      <Button variant="link" className="text-danger p-2" onClick={() => handleRemoveMed(index)}>
                        <Trash2 size={20} />
                      </Button>
                    </Col>
                  </Row>
                ))}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="glass-card border-0 mb-4 p-3 bg-primary text-white sticky-top" style={{ top: '100px' }}>
              <Card.Body>
                <h5 className="fw-bold mb-4">Finalize Visit</h5>
                
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold opacity-75 text-uppercase ls-wide mb-2">Follow-up Date</Form.Label>
                  <Form.Control 
                    type="date"
                    className="bg-white bg-opacity-10 border-0 py-3 rounded-4 text-white"
                    value={formData.nextAppointment}
                    onChange={(e) => setFormData({ ...formData, nextAppointment: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold opacity-75 text-uppercase ls-wide mb-2">Private Clinical Notes</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={4}
                    placeholder="Only visible to you..."
                    className="bg-white bg-opacity-10 border-0 py-3 rounded-4 text-white"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </Form.Group>

                <Button variant="light" type="submit" className="w-100 py-3 fw-bold rounded-pill shadow-lg d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : <Save size={20} />}
                  {loading ? 'Saving...' : 'Complete Visit'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default NewVisitPage;
