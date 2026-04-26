import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Activity, Pill, Calendar, ShieldCheck, CheckCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PublicPrescriptionPage: React.FC = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use raw axios to avoid interceptors that might redirect to login
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const getCleanBase = () => {
    let url = apiBase;
    if (!url.endsWith('/api') && !url.endsWith('/api/')) {
        url = url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    return url;
  };

  useEffect(() => {
    const verifyPrescription = async () => {
      try {
        const response = await axios.get(`${getCleanBase()}/visits/public/${visitId}`);
        setData(response.data.data);
      } catch (err: any) {
        setError('Invalid or expired prescription. Please contact the clinic.');
      } finally {
        setLoading(false);
      }
    };
    verifyPrescription();
  }, [visitId]);

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
      pdf.save(`Prescription_${data.patient?.name || 'Verified'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <Spinner animation="grow" variant="primary" />
        <p className="mt-3 text-muted fw-bold">Verifying Clinical Record...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <Container className="py-5">
        <Alert variant="danger" className="text-center py-5 border-0 shadow-lg rounded-4">
            <ShieldCheck size={48} className="mb-3 opacity-50" />
            <h4 className="fw-bold">Verification Failed</h4>
            <p className="mb-0">{error}</p>
        </Alert>
    </Container>
  );

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="text-center mb-5">
          <Badge bg="success" className="px-4 py-2 rounded-pill mb-3 shadow-sm d-inline-flex align-items-center gap-2">
            <CheckCircle size={16} /> Verified E-Prescription
          </Badge>
          <h2 className="fw-bold">Pharmacist Verification Portal</h2>
          <p className="text-muted mb-4">Instant validation of CureConnect digital records</p>
          <button 
            className="btn btn-primary btn-premium px-5 py-3 rounded-pill shadow-lg fw-bold d-inline-flex align-items-center gap-2"
            onClick={downloadPrescription}
          >
            <Download size={20} />
            Download Prescription PDF
          </button>
        </div>

        <Card id="prescription-content" className="border-0 shadow-lg overflow-hidden rounded-4 mx-auto" style={{ maxWidth: '800px' }}>
          <Card.Header className="bg-primary text-white p-4 border-0">
            <Row className="align-items-center">
              <Col md={8}>
                <div className="small fw-bold opacity-75 text-uppercase mb-1">Patient Details</div>
                <h3 className="fw-bold mb-1">{data.patient?.name}</h3>
                <div className="d-flex gap-3 small opacity-75">
                    <span>{data.patient?.age} Yrs</span>
                    <span>•</span>
                    <span className="text-capitalize">{data.patient?.gender}</span>
                    <span>•</span>
                    <span>{data.patient?.phone || 'No phone provided'}</span>
                </div>
              </Col>
              <Col md={4} className="text-md-end mt-3 mt-md-0">
                <div className="small fw-bold opacity-75 text-uppercase mb-1">Visit Date</div>
                <h5 className="fw-bold mb-0">{new Date(data.date).toLocaleDateString()}</h5>
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-4 p-md-5">
            <Row className="mb-4 g-4">
              <Col md={12}>
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 border-start border-primary border-4">
                  <h6 className="text-primary fw-bold text-uppercase ls-wide mb-1">Reason for Visit</h6>
                  <p className="mb-0 fw-bold fs-5 text-dark">{data.reason || 'Not specified'}</p>
                </div>
              </Col>
            </Row>

            <Row className="mb-5 g-4">
              <Col md={6}>
                <h6 className="text-primary fw-bold text-uppercase ls-wide mb-3 d-flex align-items-center gap-2">
                  <Activity size={18} /> Symptoms
                </h6>
                <div className="bg-light p-3 rounded-4 border-0 text-muted">
                  {data.symptoms}
                </div>
              </Col>
              <Col md={6}>
                <h6 className="text-primary fw-bold text-uppercase ls-wide mb-3 d-flex align-items-center gap-2">
                  <Activity size={18} /> Diagnosis
                </h6>
                <div className="bg-light p-3 rounded-4 border-start border-primary border-4 fw-bold fs-5">
                  {data.diagnosis}
                </div>
              </Col>
            </Row>

            <div className="mb-5">
                <h6 className="text-primary fw-bold text-uppercase ls-wide mb-3">Clinical Plan & Treatment</h6>
                <div className="bg-light p-3 rounded-4 border-0">
                    {data.treatment}
                </div>
            </div>

            <div className="mb-5">
              <h6 className="text-primary fw-bold text-uppercase ls-wide mb-3 d-flex align-items-center gap-2">
                <Pill size={18} /> Medication Orders
              </h6>
              <div className="table-responsive">
                <Table className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 py-3 text-muted fw-bold small text-uppercase">Medicine</th>
                      <th className="border-0 py-3 text-muted fw-bold small text-uppercase">Dosage</th>
                      <th className="border-0 py-3 text-muted fw-bold small text-uppercase text-end">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.prescription.map((med: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-3 fw-bold fs-5">{med.medicine}</td>
                        <td className="py-3">{med.dosage}</td>
                        <td className="py-3 text-end">
                          <Badge bg="primary" className="bg-opacity-10 text-primary px-3 py-2 border-0">
                            {med.frequency}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            <div className="border-top pt-4">
              <Row>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <Calendar size={18} />
                    <span className="small fw-bold">Expires:</span>
                    <span className="fw-bold text-dark">
                      {data.nextAppointment ? new Date(data.nextAppointment).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </Col>
                <Col md={6} className="text-end">
                  <div className="small text-muted mb-1">Authenticated by</div>
                  <h6 className="fw-bold mb-0">Dr. {data.doctor?.name}</h6>
                  <div className="small text-muted">{data.doctor?.email}</div>
                </Col>
              </Row>
            </div>
          </Card.Body>
          <Card.Footer className="bg-white border-0 text-center py-4 small text-muted opacity-50">
            This record is cryptographically linked to the CureConnect database. 
            Tampering with this digital record is a violation of healthcare regulations.
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
};

export default PublicPrescriptionPage;
