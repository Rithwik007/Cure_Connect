import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Table, Badge, Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import api from '../api';
import { User, Calendar, Plus, ChevronRight, Activity, Heart, Thermometer, FileText, Download, History, MessageCircle } from 'lucide-react';
import VitalsChart from '../components/VitalsChart';
import DocumentVault from '../components/DocumentVault';
import ChatWidget from '../components/ChatWidget';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, visitRes, appRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get(`/visits?patientId=${id}`),
          api.get('/appointments')
        ]);
        
        const patientData = patientRes.data.data;
        setPatient(patientData);
        setVisits(visitRes.data.data);
        
        // Fetch vitals using the patient's User ID
        const vitalRes = await api.get(`/vitals/${patientData.userId}`);
        setVitals(vitalRes.data);
        
        // Filter upcoming approved appointments for THIS patient
        setUpcomingAppointments(
          appRes.data.filter((a: any) => 
            a.patientId._id === patientData.userId && a.status === 'approved'
          )
        );
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch clinical records');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted fw-bold">Synchronizing Patient Record...</p>
    </div>
  );

  if (error) return <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>;
  if (!patient) return <Alert variant="warning" className="border-0 shadow-sm">Patient record not found.</Alert>;

  return (
    <div className="animate-fade-in pb-5">
      <div className="d-flex align-items-center justify-content-between mb-5">
        <div className="d-flex align-items-center gap-4">
          <div className="bg-primary bg-opacity-10 p-4 rounded-4 text-primary shadow-sm border">
            <User size={48} />
          </div>
          <div>
            <h1 className="fw-bold mb-1 display-5" style={{ letterSpacing: '-0.03em' }}>{patient.name}</h1>
            <div className="d-flex gap-3 small text-muted fw-semibold text-uppercase ls-wide">
              <span>{patient.gender || 'Unknown'}</span>
              <span>•</span>
              <span>{patient.age || '??'} Years Old</span>
              <span>•</span>
              <Badge bg="light" text="primary" className="border">ID: {patient.patientCode}</Badge>
            </div>
          </div>
        </div>
        <div className="d-flex gap-3">
          <Button 
            variant="outline-primary" 
            className="btn-premium py-3 px-4 shadow-sm"
            onClick={() => setActiveTab('vault')}
          >
            <FileText size={20} />
            Clinical Vault
          </Button>
          <Button 
            variant="primary" 
            className="btn-premium py-3 px-4 shadow-lg"
            onClick={() => navigate(`/patients/${id}/visits/new`)}
          >
            <Plus size={20} />
            Record Consultation
          </Button>
        </div>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'history')}>
        <Row className="g-4">
          {/* Left Column: Info & Navigation */}
          <Col lg={4}>
            <Card className="glass-card border-0 mb-4 p-3 overflow-hidden">
              <Card.Body>
                <Nav variant="pills" className="flex-column gap-2 mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="history" className="rounded-3 px-4 py-3 fw-bold d-flex align-items-center gap-3">
                      <History size={20} /> Medical History
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="vitals" className="rounded-3 px-4 py-3 fw-bold d-flex align-items-center gap-3">
                      <Activity size={20} /> Health Trends
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="vault" className="rounded-3 px-4 py-3 fw-bold d-flex align-items-center gap-3">
                      <FileText size={20} /> Diagnostic Vault
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <hr />

                <div className="mt-4">
                  <h6 className="small fw-bold text-muted text-uppercase mb-3 ls-wide">Patient Context</h6>
                  <div className="bg-light p-3 rounded-4 mb-3 border">
                    <div className="small text-muted mb-1">Phone</div>
                    <div className="fw-bold">{patient.phone || 'N/A'}</div>
                  </div>
                  <div className="bg-light p-3 rounded-4 border">
                    <div className="small text-muted mb-1">Last Interaction</div>
                    <div className="fw-bold">{visits.length > 0 ? new Date(visits[0].date).toLocaleDateString() : 'New Patient'}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="glass-card border-0 p-3 bg-primary text-white shadow-lg">
              <Card.Body className="text-center py-4">
                <MessageCircle size={48} className="mb-3 mx-auto opacity-50" />
                <h5 className="fw-bold mb-2">Patient Chat</h5>
                <p className="small opacity-75 mb-0">Communicate directly and securely with {patient.name.split(' ')[0]}.</p>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Dynamic Content */}
          <Col lg={8}>
            <Tab.Content>
              <Tab.Pane eventKey="history">
                {/* Upcoming Section */}
                {upcomingAppointments.length > 0 && (
                  <div className="mb-5">
                    <div className="d-flex align-items-center gap-2 mb-4 px-2">
                      <div className="bg-warning bg-opacity-10 p-2 rounded-3 text-warning">
                        <Calendar size={24} />
                      </div>
                      <h4 className="mb-0 fw-bold">Upcoming Scheduled Visit</h4>
                    </div>
                    {upcomingAppointments.map(app => (
                      <Card key={app._id} className="glass-card border-0 mb-3 border-start border-warning border-4 bg-warning bg-opacity-5">
                        <Card.Body className="d-flex justify-content-between align-items-center py-4 px-4">
                          <div>
                            <div className="small text-uppercase fw-bold text-warning mb-1">Pending Consultation</div>
                            <h5 className="fw-bold text-dark">{new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h5>
                            <p className="mb-0 text-muted italic">Reason: {app.reason}</p>
                          </div>
                          <Button 
                            variant="warning" 
                            className="rounded-pill fw-bold px-4 text-white shadow-sm"
                            onClick={() => navigate(`/patients/${id}/visits/new`)}
                          >
                            Start Visit
                          </Button>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="d-flex align-items-center gap-2 mb-4 px-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                    <History size={24} />
                  </div>
                  <h4 className="mb-0 fw-bold">Consultation History</h4>
                </div>

                <div className="d-grid gap-3">
                  {visits.map((visit) => (
                    <Card key={visit._id} className="glass-card border-0 transition-all hover-scale cursor-pointer" onClick={() => navigate(`/visits/${visit._id}`)}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-4 align-items-center">
                            <div className="text-center bg-light px-3 py-2 rounded-4 border shadow-sm">
                              <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>{new Date(visit.date).toLocaleDateString(undefined, { month: 'short' })}</div>
                              <div className="fs-4 fw-bold text-primary">{new Date(visit.date).getDate()}</div>
                            </div>
                            <div>
                              <h5 className="fw-bold mb-1 text-dark">{visit.diagnosis}</h5>
                              <p className="text-muted mb-0 small fw-medium">{visit.treatment.substring(0, 80)}...</p>
                            </div>
                          </div>
                          <ChevronRight size={24} className="text-muted opacity-25" />
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="vitals">
                <Card className="glass-card border-0 p-4 mb-4">
                  <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Vitals Monitoring
                  </h5>
                  <Row className="g-4 mb-5">
                    <Col md={6}>
                      <h6 className="small fw-bold text-muted text-uppercase mb-3 ls-wide d-flex align-items-center gap-2">
                        <Heart size={16} className="text-danger" /> Heart Rate (BPM)
                      </h6>
                      <VitalsChart data={vitals} type="HeartRate" label="Heart Rate" color="#ef4444" />
                    </Col>
                    <Col md={6}>
                      <h6 className="small fw-bold text-muted text-uppercase mb-3 ls-wide d-flex align-items-center gap-2">
                        <Activity size={16} className="text-primary" /> Blood Pressure (Systolic)
                      </h6>
                      <VitalsChart data={vitals} type="BP" label="Systolic BP" color="#3b82f6" />
                    </Col>
                  </Row>
                  <Table className="align-middle border-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 ps-4">Date</th>
                        <th className="border-0">Type</th>
                        <th className="border-0">Value</th>
                        <th className="border-0">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitals.slice(0, 10).map((v, i) => (
                        <tr key={i}>
                          <td className="ps-4 fw-medium">{new Date(v.date).toLocaleDateString()}</td>
                          <td><Badge bg="light" text="dark" className="border text-capitalize">{v.type}</Badge></td>
                          <td className="fw-bold text-primary">{v.value}</td>
                          <td className="text-muted">{v.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="vault">
                <DocumentVault patientUserId={patient.userId} isDoctor={true} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Secure Messaging Widget */}
      <ChatWidget roomId={patient.userId} recipientName={patient.name} />
    </div>
  );
};

export default PatientDetailPage;
