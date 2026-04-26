import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UserPlus, Search, ChevronRight } from 'lucide-react';

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/patients');
        setPatients(data.data);
      } catch (err) {
        setError('Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Patients Registry</h2>
          <p className="text-muted">Manage and view all registered patients</p>
        </div>
        <Button 
          variant="primary" 
          className="d-flex align-items-center gap-2"
          onClick={() => navigate('/patients/new')}
        >
          <UserPlus size={20} />
          Register Patient
        </Button>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        {error && <Alert variant="danger" className="m-3">{error}</Alert>}
        
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Patient Code</th>
                  <th>Full Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient._id} className="align-middle">
                    <td>
                      <span className="font-monospace fw-bold text-primary bg-light px-2 py-1 rounded">
                        {patient.patientCode}
                      </span>
                    </td>
                    <td className="fw-semibold">{patient.name}</td>
                    <td>{patient.age} yrs</td>
                    <td>
                      <Badge 
                        bg={patient.gender === 'male' ? 'info' : 'danger'} 
                        className="bg-opacity-10 text-capitalize px-3 py-2"
                        style={{ color: patient.gender === 'male' ? '#0891b2' : '#e11d48' }}
                      >
                        {patient.gender}
                      </Badge>
                    </td>
                    <td className="text-muted">{patient.phone || 'No contact'}</td>
                    <td className="text-end">
                      <Button 
                        variant="link" 
                        className="p-0 text-primary d-inline-flex align-items-center gap-1 text-decoration-none fw-semibold"
                        onClick={() => navigate(`/patients/${patient._id}`)}
                      >
                        View
                        <ChevronRight size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <Search size={48} className="mb-3 opacity-20 d-block mx-auto" />
                      No patients found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientsPage;
