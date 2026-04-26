import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api';
import { ArrowLeft, Clipboard, Pill, Calendar, Activity, ShieldCheck, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const VisitDetailPage: React.FC = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const [visit, setVisit] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setError('');
        const visitRes = await api.get(`/visits/${visitId}`);
        const visitData = visitRes.data.data;
        setVisit(visitData);
        
        // Fetch patient details for the prescription header
        try {
          const patientRes = await api.get(`/patients/${visitData.patientId}`);
          setPatient(patientRes.data.data);
        } catch (pErr) {
          console.error('Patient fetch failed', pErr);
        }

        // Fetch doctor details for signature - make it optional/non-blocking
        try {
          const doctorRes = await api.get(`/auth/doctor/${visitData.doctorId}`);
          setDoctor(doctorRes.data);
        } catch (dErr) {
          console.error('Doctor fetch failed', dErr);
        }
      } catch (err: any) {
        console.error('Visit fetch failed', err);
        setError(err.response?.data?.error || 'Failed to load visit details. You may not have permission to view this record.');
      } finally {
        setLoading(false);
      }
    };
    fetchVisit();
  }, [visitId]);

  useEffect(() => {
    // Auto-download if coming from QR code
    if (visit && patient && searchParams.get('src') === 'qr') {
      const timer = setTimeout(() => {
        downloadPrescription();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [visit, patient]);

  const downloadPrescription = async () => {
    const element = document.getElementById('prescription-content');
    if (!element) return;

    try {
      // Force a desktop-like width for high-quality capture on mobile
      const captureWidth = 1024;
      const originalStyle = element.style.width;
      element.style.width = `${captureWidth}px`;

      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        windowWidth: captureWidth,
        width: captureWidth
      });

      // Restore original style
      element.style.width = originalStyle;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Prescription_${patient?.name || 'Visit'}_${new Date(visit.date).toLocaleDateString()}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted">Retrieving Clinical Record...</p>
    </div>
  );

  if (error || !visit) return <Alert variant="danger" className="border-0 shadow-sm">{error || 'Visit not found'}</Alert>;

  return (
    <div className="animate-fade-in pb-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <Button 
          variant="link" 
          onClick={() => navigate(user?.role === 'doctor' ? `/patients/${visit.patientId}` : '/patient-dashboard')} 
          className="p-0 text-decoration-none d-flex align-items-center gap-2 text-muted fw-bold"
        >
          <ArrowLeft size={20} />
          {user?.role === 'doctor' ? 'Back to Patient Profile' : 'Back to Health Portal'}
        </Button>
        <div className="d-flex gap-2">
          <Button 
            variant="success" 
            className="btn-premium py-2 px-4 shadow-lg d-flex align-items-center gap-2" 
            onClick={() => window.open(`/verify-prescription/${visitId}`, '_blank')}
          >
            <ShieldCheck size={18} />
            Show to Pharmacist
          </Button>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          {/* Main Content Area (Used for PDF Export) */}
          <Card className="glass-card border-0 shadow-lg overflow-hidden" id="prescription-content">
            <Card.Header className="bg-primary text-white p-4 p-md-5 border-0">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-4">
                <div className="flex-grow-1">
                  <h2 className="fw-bold mb-1">CureConnect E-Prescription</h2>
                  <p className="opacity-75 mb-4">Secure Digital Health Record</p>
                  
                  <div className="d-flex flex-wrap gap-4 gap-md-5">
                    <div>
                      <div className="small fw-bold opacity-75 text-uppercase mb-1">Patient Name</div>
                      <h4 className="fw-bold mb-0">{patient?.name}</h4>
                    </div>
                    <div>
                      <div className="small fw-bold opacity-75 text-uppercase mb-1">Visit Date</div>
                      <h4 className="fw-bold mb-0">{new Date(visit.date).toLocaleDateString()}</h4>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-4 shadow-sm border text-center align-self-center align-self-md-start mx-auto mx-md-0" style={{ minWidth: '160px' }}>
                  <QRCodeSVG 
                    value={`${window.location.origin}/verify-prescription/${visitId}`} 
                    size={140} 
                    level="H" 
                    includeMargin={false}
                  />
                  <div className="text-dark small fw-bold mt-2" style={{ fontSize: '0.75rem' }}>SCAN TO VERIFY</div>
                </div>
              </div>
            </Card.Header>
            
            <Card.Body className="p-5">
              <div className="mb-4 bg-light p-4 rounded-4 border-start border-primary border-4">
                <div className="small text-muted fw-bold text-uppercase mb-1">Reason for Visit</div>
                <h4 className="fw-bold text-dark mb-0">{visit.reason || 'Routine Consultation'}</h4>
              </div>

              <div className="mb-5">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                  <Activity size={20} />
                  Clinical Summary
                </h5>
                <Row className="g-4">
                  <Col md={6}>
                    <div className="bg-light p-3 rounded-4 h-100">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Diagnosis</div>
                      <p className="mb-0 fw-bold fs-5 text-dark">{visit.diagnosis}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="bg-light p-3 rounded-4 h-100">
                      <div className="small text-muted fw-bold text-uppercase mb-1">Symptoms</div>
                      <p className="mb-0 fw-medium">{visit.symptoms}</p>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="mb-5">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                  <Pill size={20} />
                  Prescribed Medication
                </h5>
                <div className="table-responsive">
                  <Table className="align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 ps-4 py-3 text-muted fw-bold text-uppercase small">Medicine</th>
                        <th className="border-0 py-3 text-muted fw-bold text-uppercase small">Dosage</th>
                        <th className="border-0 py-3 text-muted fw-bold text-uppercase small">Frequency</th>
                        <th className="border-0 py-3 text-muted fw-bold text-uppercase small">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visit.prescription && visit.prescription.map((med: any, idx: number) => (
                        <tr key={idx}>
                          <td className="ps-4 py-3 fw-bold fs-5">{med.medicine}</td>
                          <td className="py-3 fw-medium">{med.dosage}</td>
                          <td className="py-3">
                            <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-2 border-0">
                              {med.frequency}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted">{med.duration}</td>
                        </tr>
                      ))}
                      {(!visit.prescription || visit.prescription.length === 0) && (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted italic">No medications prescribed in this visit.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>

              <div className="border-top pt-4">
                <Row className="align-items-center">
                  <Col md={6}>
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <Calendar size={18} />
                      <span className="fw-bold small">Next Recommended Visit:</span>
                      <span className="text-primary fw-bold">{visit.nextAppointment || 'As needed'}</span>
                    </div>
                  </Col>
                  <Col md={6} className="text-end">
                    <div className="small text-muted mb-2">Digitally Signed by</div>
                    <h5 className="fw-bold text-primary">Dr. {doctor?.name || 'CureConnect Healthcare'}</h5>
                    {doctor?.email && <div className="small text-muted">{doctor.email}</div>}
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="glass-card border-0 p-4 mb-4 sticky-top" style={{ top: '100px' }}>
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Clipboard size={20} className="text-primary" />
              Physician Notes
            </h5>
            <div className="bg-light p-3 rounded-4 border-start border-primary border-4 mb-4">
              <p className="mb-0 text-muted italic">{visit.notes || 'No private notes for this visit.'}</p>
            </div>
            
            <hr />
            
            <div className="mt-4">
              <p className="small text-muted mb-4">
                This QR code allows pharmacies to verify this prescription instantly **without logging in**. Scanning this will take them directly to the secure digital record.
              </p>
              <div className="d-grid gap-2">
                <Button variant="primary" className="py-3 fw-bold rounded-4 shadow-sm btn-premium" onClick={() => window.open(`/verify-prescription/${visitId}`, '_blank')}>
                  <ExternalLink size={18} className="me-2" />
                  View Pharmacist Portal
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VisitDetailPage;
