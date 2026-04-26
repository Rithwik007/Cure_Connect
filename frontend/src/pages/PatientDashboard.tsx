import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Form, Alert, Table, Badge, Spinner, Collapse, Modal, Nav, Tab, ListGroup } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Calendar, Clock, History, Send, CheckCircle, ArrowRight, ChevronDown, ChevronUp, User, Activity, Heart, FileText, Bell, Pill, Trash2 } from 'lucide-react';
import VitalsChart from '../components/VitalsChart';
import DocumentVault from '../components/DocumentVault';
import ChatWidget from '../components/ChatWidget';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState(false);
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('clinical');
  
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
  });

  const [vitalData, setVitalData] = useState({
    type: 'BP',
    value: '',
    unit: 'mmHg'
  });

  const [reminderData, setReminderData] = useState({
    medicationName: '',
    dosage: '',
    time: ''
  });

  const fetchData = async (isInitial = false) => {
    if (!user?._id) return;
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [appRes, visitRes, docRes, vitalRes, reminderRes] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get('/visits/my-history').catch(() => ({ data: { data: [] } })),
        api.get('/auth/doctor').catch(() => ({ data: null })),
        api.get(`/vitals/${user._id}`).catch(() => ({ data: [] })),
        api.get('/reminders').catch(() => ({ data: [] }))
      ]);
      
      setAppointments(Array.isArray(appRes.data) ? appRes.data : []);
      setVisits(Array.isArray(visitRes.data?.data) ? visitRes.data.data : []);
      setDoctor(docRes.data);
      setVitals(Array.isArray(vitalRes.data) ? vitalRes.data : []);
      setReminders(Array.isArray(reminderRes.data) ? reminderRes.data : []);
    } catch (error) {
      console.error('Failed to fetch patient data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchData(true);
    }
  }, [user?._id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBooking(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/appointments', formData);
      setMessage({ type: 'success', text: 'Appointment requested successfully!' });
      setFormData({ date: '', reason: '' });
      await fetchData();
    } catch (error: any) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Booking failed' });
    } finally {
      setBooking(false);
    }
  };

  const handleVitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vitals', vitalData);
      setShowVitalModal(false);
      setVitalData({ type: 'BP', value: '', unit: 'mmHg' });
      await fetchData();
    } catch (error) {
      console.error('Failed to log vital', error);
    }
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reminders', reminderData);
      setReminderData({ medicationName: '', dosage: '', time: '' });
      await fetchData();
    } catch (error) {
      console.error('Failed to save reminder', error);
    }
  };

  const toggleReminder = async (id: string) => {
    try {
      await api.put(`/reminders/${id}/toggle`);
      await fetchData();
    } catch (error) {
      console.error('Failed to toggle reminder', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await api.delete(`/reminders/${id}`);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete reminder', error);
    }
  };

  const toggleVisit = (id: string) => {
    setExpandedVisit(expandedVisit === id ? null : id);
  };

  const getUnit = (type: string) => {
    switch(type) {
      case 'BP': return 'mmHg';
      case 'Glucose': return 'mg/dL';
      case 'HeartRate': return 'bpm';
      case 'Weight': return 'kg';
      case 'Temperature': return '°F';
      default: return '';
    }
  };

  const upcomingApps = appointments.filter(a => a.status === 'approved');

  if (loading || !user) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted fw-bold ls-wide text-uppercase small">Initializing CureConnect session...</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in pb-5">
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h1 className="fw-bold mb-1 display-5" style={{ letterSpacing: '-0.03em' }}>Health Dashboard</h1>
          <p className="text-muted fs-5 mb-0">Hello, {user?.name.split(' ')[0]}. Manage your health and records.</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          {refreshing && <Spinner animation="border" variant="primary" size="sm" />}
          <Button variant="outline-primary" className="btn-premium shadow-sm border-2" onClick={() => setShowVitalModal(true)}>
            <Activity size={18} />
            Log Vital Reading
          </Button>
        </div>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'clinical')}>
        <Nav variant="pills" className="mb-5 gap-3 bg-white p-2 rounded-pill shadow-sm w-fit mx-auto border">
          <Nav.Item>
            <Nav.Link eventKey="clinical" className="rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2">
              <History size={18} /> Clinical History
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="documents" className="rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2">
              <FileText size={18} /> My Vault
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="reminders" className="rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2">
              <Bell size={18} /> Med Reminders
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Row className="g-5">
          <Col lg={4}>
            {/* Quick Stats Grid */}
            <Row className="g-3 mb-5">
              <Col xs={6}>
                <Card className="glass-card border-0 p-3 h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="bg-danger bg-opacity-10 p-2 rounded-3 text-danger"><Heart size={18} /></div>
                    <span className="small fw-bold text-muted">Heart Rate</span>
                  </div>
                  <h4 className="fw-bold mb-0">
                    {vitals.find(v => v.type === 'HeartRate')?.value || '--'} 
                    <small className="fs-6 text-muted ms-1">bpm</small>
                  </h4>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="glass-card border-0 p-3 h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary"><Activity size={18} /></div>
                    <span className="small fw-bold text-muted">BP</span>
                  </div>
                  <h4 className="fw-bold mb-0">
                    {vitals.find(v => v.type === 'BP')?.value || '--'} 
                    <small className="fs-6 text-muted ms-1">mmHg</small>
                  </h4>
                </Card>
              </Col>
              <Col xs={12}>
                <Card className="glass-card border-0 p-3 mb-3">
                  <div className="small fw-bold text-muted text-uppercase mb-3 ls-wide d-flex align-items-center gap-2">
                    <Heart size={16} className="text-danger" /> Heart Rate History (BPM)
                  </div>
                  <VitalsChart data={vitals} type="HeartRate" label="Heart Rate" color="#ef4444" />
                </Card>
              </Col>
              <Col xs={12}>
                <Card className="glass-card border-0 p-3">
                  <div className="small fw-bold text-muted text-uppercase mb-3 ls-wide d-flex align-items-center gap-2">
                    <Activity size={16} className="text-primary" /> Blood Pressure History (Systolic)
                  </div>
                  <VitalsChart data={vitals} type="BP" label="Systolic BP" color="#3b82f6" />
                </Card>
              </Col>
            </Row>

            <Card className="glass-card border-0 sticky-top mb-4" style={{ top: '100px' }}>
              <Card.Header className="bg-white py-4 border-0">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-primary">
                  <Calendar size={20} />
                  Book Appointment
                </h5>
              </Card.Header>
              <Card.Body className="px-4 pb-4 pt-0">
                {doctor && (
                  <div className="bg-primary bg-opacity-10 p-3 rounded-4 mb-4 d-flex align-items-center gap-3">
                    <div className="bg-white p-2 rounded-circle shadow-sm">
                      <User size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="small text-muted fw-bold text-uppercase ls-wide">Primary Doctor</div>
                      <div className="fw-bold text-primary">Dr. {doctor.name}</div>
                    </div>
                  </div>
                )}

                {message.text && <Alert variant={message.type} className="small py-2 border-0 shadow-sm mb-4">{message.text}</Alert>}
                
                <Form onSubmit={handleBook}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted text-uppercase ls-wide mb-2">Preferred Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      required
                      className="bg-light border-0 py-3 px-3 rounded-4 fw-medium shadow-none"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted text-uppercase ls-wide mb-2">Reason</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2} 
                      placeholder="Symptoms..."
                      required
                      className="bg-light border-0 py-3 px-3 rounded-4 fw-medium shadow-none"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="btn-premium w-100 py-3 shadow-lg justify-content-center" disabled={booking}>
                    {booking ? <Spinner animation="border" size="sm" /> : <Send size={20} />}
                    {booking ? 'Processing...' : 'Request Visit'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Tab.Content>
              <Tab.Pane eventKey="clinical">
                {/* Upcoming Visits */}
                {upcomingApps.length > 0 && (
                  <div className="mb-5 animate-fade-in">
                    <div className="d-flex align-items-center justify-content-between mb-4 px-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-emerald bg-opacity-10 p-2 rounded-3 text-emerald" style={{ color: '#059669' }}>
                          <CheckCircle size={24} />
                        </div>
                        <h4 className="mb-0 fw-bold">Confirmed Appointments</h4>
                      </div>
                      <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">{upcomingApps.length} Ready</Badge>
                    </div>
                    
                    {upcomingApps.map(app => (
                      <Card key={app._id} className="glass-card border-0 mb-3 border-start border-success border-4 overflow-hidden">
                        <Card.Body className="d-flex justify-content-between align-items-center py-4 px-4">
                          <div>
                            <h5 className="fw-bold text-primary mb-1">
                              {new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h5>
                            <p className="mb-0 text-muted">{app.reason}</p>
                          </div>
                          <Badge bg="success" className="px-3 py-2 rounded-pill">Approved</Badge>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Clinical History */}
                <div className="mb-5">
                  <div className="d-flex align-items-center gap-2 mb-4 px-2">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                      <History size={24} />
                    </div>
                    <h4 className="mb-0 fw-bold">Medical History</h4>
                  </div>

                  {visits.map(visit => (
                    <div key={visit._id} className="mb-3 animate-fade-in">
                      <Card 
                        className={`glass-card border-0 transition-all cursor-pointer ${expandedVisit === visit._id ? 'shadow-lg' : ''}`}
                        onClick={() => toggleVisit(visit._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body className="py-4 px-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-4">
                              <div className="text-center bg-light px-3 py-2 rounded-4 border shadow-sm">
                                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                                  {new Date(visit.date).toLocaleDateString(undefined, { month: 'short' })}
                                </div>
                                <div className="fs-4 fw-bold text-primary">
                                  {new Date(visit.date).getDate()}
                                </div>
                              </div>
                              <div>
                                <h5 className="fw-bold mb-1">{visit.diagnosis}</h5>
                                <div className="small text-muted d-flex align-items-center gap-2">
                                  <ArrowRight size={14} className="text-primary" />
                                  {visit.treatment}
                                </div>
                              </div>
                            </div>
                            <div className="text-primary opacity-50">
                              {expandedVisit === visit._id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </div>
                          </div>

                          <Collapse in={expandedVisit === visit._id}>
                            <div className="mt-4 pt-4 border-top">
                              <Row className="g-4">
                                <Col md={6}>
                                  <h6 className="small fw-bold text-muted text-uppercase mb-2 ls-wide">Symptoms</h6>
                                  <p className="mb-0 fw-medium bg-light p-3 rounded-4 border-0">{visit.symptoms}</p>
                                </Col>
                                <Col md={6}>
                                  <h6 className="small fw-bold text-muted text-uppercase mb-2 ls-wide">Plan</h6>
                                  <p className="mb-0 fw-medium bg-light p-3 rounded-4 border-0">{visit.treatment}</p>
                                </Col>
                                {visit.prescription && visit.prescription.length > 0 && (
                                  <Col md={12}>
                                    <h6 className="small fw-bold text-muted text-uppercase mb-2 ls-wide">Prescribed Medication</h6>
                                    <div className="table-responsive bg-light p-3 rounded-4">
                                      <Table size="sm" className="mb-0 border-0">
                                        <thead>
                                          <tr className="small text-muted">
                                            <th className="border-0">Medicine</th>
                                            <th className="border-0 text-center">Dosage</th>
                                            <th className="border-0 text-end">Frequency</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {visit.prescription.map((m: any, i: number) => (
                                            <tr key={i}>
                                              <td className="border-0 fw-bold">{m.medicine}</td>
                                              <td className="border-0 text-center">{m.dosage}</td>
                                              <td className="border-0 text-end text-primary fw-bold">{m.frequency}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    </div>
                                    <div className="mt-4 d-flex justify-content-end">
                                      <Button 
                                        variant="primary" 
                                        className="btn-premium px-4 shadow-sm d-flex align-items-center gap-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/visits/${visit._id}`);
                                        }}
                                      >
                                        <Pill size={18} />
                                        View Full Record & Download Prescription
                                      </Button>
                                    </div>
                                  </Col>
                                )}
                                {(!visit.prescription || visit.prescription.length === 0) && (
                                  <Col md={12}>
                                    <div className="mt-3 d-flex justify-content-end">
                                      <Button 
                                        variant="outline-primary" 
                                        className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/visits/${visit._id}`);
                                        }}
                                      >
                                        <FileText size={18} />
                                        View Full Clinical Record
                                      </Button>
                                    </div>
                                  </Col>
                                )}
                              </Row>
                            </div>
                          </Collapse>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="documents">
                <DocumentVault patientUserId={user?._id || ''} />
              </Tab.Pane>

              <Tab.Pane eventKey="reminders">
                <Card className="glass-card border-0 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                      <Bell size={20} className="text-primary" />
                      Medication Schedule
                    </h5>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="rounded-pill px-3"
                      onClick={() => {
                        if ("Notification" in window) {
                          Notification.requestPermission().then(permission => {
                            if (permission === "granted") {
                              setMessage({ type: 'success', text: 'Health alerts enabled!' });
                            }
                          });
                        }
                      }}
                    >
                      Enable Alerts
                    </Button>
                  </div>

                  <Alert variant="info" className="rounded-4 border-0 shadow-sm d-flex align-items-center gap-3 mb-4">
                    <div className="bg-white p-2 rounded-circle shadow-sm">
                      <Bell size={20} className="text-info" />
                    </div>
                    <div>
                      <div className="fw-bold">Smart Reminders</div>
                      <div className="small">CureConnect will notify you on this device when it's time for your medicine.</div>
                    </div>
                  </Alert>

                  <div className="bg-light p-4 rounded-4 border mb-4">
                    <Form onSubmit={handleReminderSubmit} className="row g-3">
                      <Col md={5}>
                        <Form.Control 
                          placeholder="Medicine (e.g. Amoxicillin)" 
                          className="border-0 py-2 rounded-3 shadow-none" 
                          required
                          value={reminderData.medicationName}
                          onChange={(e) => setReminderData({ ...reminderData, medicationName: e.target.value })}
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Control 
                          placeholder="Dosage" 
                          className="border-0 py-2 rounded-3 shadow-none" 
                          required
                          value={reminderData.dosage}
                          onChange={(e) => setReminderData({ ...reminderData, dosage: e.target.value })}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Control 
                          type="time" 
                          className="border-0 py-2 rounded-3 shadow-none" 
                          required
                          value={reminderData.time}
                          onChange={(e) => setReminderData({ ...reminderData, time: e.target.value })}
                        />
                      </Col>
                      <Col md={2}>
                        <Button variant="primary" type="submit" className="w-100 py-2 btn-premium shadow-sm">Add</Button>
                      </Col>
                    </Form>
                  </div>

                  <ListGroup variant="flush">
                    {reminders.map((rem) => (
                      <ListGroup.Item key={rem._id} className="bg-transparent border-0 px-0 py-3 d-flex align-items-center justify-content-between animate-fade-in">
                        <div className="d-flex align-items-center gap-3">
                          <div className={`p-3 rounded-3 ${rem.active ? 'bg-primary bg-opacity-10 text-primary' : 'bg-light text-muted'}`}>
                            <Pill size={20} />
                          </div>
                          <div>
                            <div className={`fw-bold ${rem.active ? 'text-dark' : 'text-muted text-decoration-line-through'}`}>
                              {rem.medicationName} {rem.dosage}
                            </div>
                            <div className="small text-muted d-flex align-items-center gap-2">
                              <Clock size={12} /> {rem.time}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <Form.Check 
                            type="switch" 
                            checked={rem.active} 
                            onChange={() => toggleReminder(rem._id)}
                            className="fs-5" 
                          />
                          <Button variant="link" className="text-danger p-0" onClick={() => deleteReminder(rem._id)}>
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                    {reminders.length === 0 && (
                      <div className="text-center py-5 opacity-25">
                        <Bell size={48} className="mx-auto mb-2" />
                        <p>No medication reminders set yet.</p>
                      </div>
                    )}
                  </ListGroup>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Log Vital Modal */}
      <Modal show={showVitalModal} onHide={() => setShowVitalModal(false)} centered className="glass-modal">
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <Activity size={24} className="text-primary" />
            Log Health Metric
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <Form onSubmit={handleVitalSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted text-uppercase">Metric Type</Form.Label>
              <Form.Select 
                className="bg-light border-0 py-3 shadow-none rounded-4"
                value={vitalData.type}
                onChange={(e) => {
                  const type = e.target.value;
                  setVitalData({ ...vitalData, type, unit: getUnit(type) });
                }}
              >
                <option value="BP">Blood Pressure</option>
                <option value="Glucose">Glucose Level</option>
                <option value="HeartRate">Heart Rate</option>
                <option value="Weight">Weight</option>
                <option value="Temperature">Temperature</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted text-uppercase">Reading ({vitalData.unit})</Form.Label>
              <Form.Control 
                type="text"
                placeholder={vitalData.type === 'BP' ? '120/80' : '98.6'}
                required
                className="bg-light border-0 py-3 fs-4 fw-bold shadow-none rounded-4"
                value={vitalData.value}
                onChange={(e) => setVitalData({ ...vitalData, value: e.target.value })}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 py-3 fw-bold rounded-4 shadow-lg btn-premium">
              Save Metric
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Secure Messaging Widget */}
      {doctor && (
        <ChatWidget roomId={user?._id || ''} recipientName={`Dr. ${doctor.name}`} />
      )}
    </div>
  );
};

export default PatientDashboard;
