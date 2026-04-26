import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import { Users, Calendar, Check, ClipboardList, Info, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, visits: 0 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [patientsRes, visitsRes, appRes] = await Promise.all([
        api.get('/patients'),
        api.get('/visits'),
        api.get('/appointments')
      ]);
      setStats({
        patients: patientsRes.data.data.length,
        visits: visitsRes.data.data.length
      });
      setAppointments(appRes.data.filter((a: any) => a.status === 'pending'));
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/appointments/${id}/approve`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Approval failed');
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted">Refreshing clinical data...</p>
    </div>
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="fw-bold mb-1 fs-1" style={{ letterSpacing: '-0.03em' }}>Clinical Overview</h2>
        <p className="text-muted fs-5">Welcome back, Dr. {user?.name}</p>
      </div>
      
      {error && <Alert variant="danger" className="border-0 shadow-sm" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mb-5 g-4">
        <Col md={6} lg={4}>
          <Card className="glass-card stat-card border-0 h-100 p-3">
            <Card.Body className="d-flex align-items-center gap-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-4 text-primary shadow-sm">
                <Users size={32} />
              </div>
              <div>
                <div className="small text-uppercase fw-bold text-muted mb-1 ls-wide">Total Patients</div>
                <h1 className="mb-0 fw-bold display-5">{stats.patients}</h1>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="glass-card stat-card border-0 h-100 p-3">
            <Card.Body className="d-flex align-items-center gap-4">
              <div className="bg-emerald bg-opacity-10 p-3 rounded-4 text-emerald shadow-sm" style={{ color: '#059669' }}>
                <ClipboardList size={32} />
              </div>
              <div>
                <div className="small text-uppercase fw-bold text-muted mb-1 ls-wide">Completed Visits</div>
                <h1 className="mb-0 fw-bold display-5" style={{ color: '#059669' }}>{stats.visits}</h1>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={4}>
          <Card className="glass-card border-0 h-100 p-3 bg-primary text-white">
            <Card.Body className="d-flex flex-column justify-content-center">
              <h5 className="fw-bold mb-2">Patient Directory</h5>
              <p className="small mb-3 opacity-75">Manage profiles and history</p>
              <Button 
                variant="light" 
                className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-pill py-2"
                onClick={() => navigate('/patients')}
              >
                View Records
                <ArrowUpRight size={18} />
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <div className="d-flex align-items-center justify-content-between mb-3 px-2">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-warning bg-opacity-10 p-2 rounded-3 text-warning">
                <Calendar size={20} />
              </div>
              <h4 className="mb-0 fw-bold">Appointment Requests</h4>
            </div>
            <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm">
              {appointments.length} Pending
            </Badge>
          </div>
          
          <div className="table-responsive">
            <Table hover className="align-middle border-0">
              <thead>
                <tr>
                  <th className="ps-4">Patient Profile</th>
                  <th>Reason for Visit</th>
                  <th>Preferred Date</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app._id} className="animate-fade-in">
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-2 rounded-circle border">
                          <Users size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="fw-bold fs-5">{app.patientId.name}</div>
                          <div className="small text-muted d-flex gap-2">
                            <Badge bg="light" text="dark" className="border">{app.patientId.age || '?'}y</Badge>
                            <span className="text-capitalize">{app.patientId.gender || ''}</span>
                            <span className="opacity-50">•</span>
                            <span>{app.patientId.phone || 'No phone'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted fw-medium">{app.reason}</td>
                    <td className="fw-bold text-primary">{new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="text-end pe-4">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="btn-premium px-4 shadow-sm"
                        onClick={() => handleApprove(app._id)}
                      >
                        <Check size={18} />
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {appointments.length === 0 && (
              <Card className="border-0 shadow-sm text-center py-5 glass-card">
                <Info size={48} className="mb-3 opacity-10 mx-auto" />
                <h5 className="text-muted">No pending requests at the moment</h5>
                <p className="text-muted small">New requests will appear here as patients book them.</p>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
