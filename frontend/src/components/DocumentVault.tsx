import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { FileText, Upload, Trash2, ExternalLink, File, Image as ImageIcon } from 'lucide-react';
import api from '../api';

interface DocumentVaultProps {
  patientUserId: string;
  isDoctor?: boolean;
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ patientUserId, isDoctor }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('Lab Report');

  const fetchDocs = async () => {
    try {
      const res = await api.get(`/documents/${patientUserId}`);
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [patientUserId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('patientId', patientUserId);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      await fetchDocs();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      await fetchDocs();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="animate-fade-in">
      <Card className="glass-card border-0 p-4">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <FileText size={20} className="text-primary" />
          Document Vault
        </h5>

        {!isDoctor && (
          <Form onSubmit={handleUpload} className="mb-5 bg-light p-4 rounded-4 border">
            <h6 className="small fw-bold text-muted text-uppercase mb-3 ls-wide">Upload New Report</h6>
            <Row className="g-3 align-items-end">
              <Col md={5}>
                <Form.Control 
                  type="file" 
                  onChange={(e: any) => setFile(e.target.files[0])}
                  className="border-0 shadow-none bg-white p-2 rounded-3"
                />
              </Col>
              <Col md={4}>
                <Form.Select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="border-0 shadow-none bg-white p-2 rounded-3"
                >
                  <option>Lab Report</option>
                  <option>Prescription</option>
                  <option>X-Ray</option>
                  <option>Other</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button variant="primary" type="submit" className="w-100 py-2 btn-premium shadow-sm" disabled={!file || uploading}>
                  {uploading ? <Spinner animation="border" size="sm" /> : <Upload size={18} />}
                  {uploading ? ' Uploading...' : ' Upload'}
                </Button>
              </Col>
            </Row>
          </Form>
        )}

        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" variant="primary" size="sm" /></div>
        ) : (
          <ListGroup variant="flush">
            {documents.map((doc) => (
              <ListGroup.Item key={doc._id} className="bg-transparent border-0 px-0 py-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary">
                    {doc.fileType.includes('image') ? <ImageIcon size={20} /> : <File size={20} />}
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{doc.name}</div>
                    <div className="d-flex gap-2 align-items-center">
                      <Badge bg="light" text="muted" className="border">{doc.category}</Badge>
                      <span className="small text-muted">{new Date(doc.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="rounded-circle p-2 shadow-sm border"
                    href={import.meta.env.VITE_API_URL + doc.fileUrl} 
                    target="_blank"
                  >
                    <ExternalLink size={16} className="text-primary" />
                  </Button>
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="rounded-circle p-2 shadow-sm border text-danger"
                    onClick={() => handleDelete(doc._id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
            {documents.length === 0 && (
              <div className="text-center py-5 opacity-50">
                <FileText size={48} className="mb-2 mx-auto" />
                <p>No documents found</p>
              </div>
            )}
          </ListGroup>
        )}
      </Card>
    </div>
  );
};

export default DocumentVault;
