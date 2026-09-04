import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const theme = {
  primary: '#2a9d8f',
  primaryLight: '#e8f5e9',
  secondary: '#e9c46a',
  danger: '#e76f51',
  text: '#2d4059',
  bg: '#f4f9f9',
  cardBg: '#ffffff',
  shadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
  radius: '20px',
};

function App() {
  // ======== AUTH STATE ========
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  // ======== ACTIVE TAB ========
  const [activeTab, setActiveTab] = useState('doctors');

  // ======== DOCTORS ========
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [searchDoctors, setSearchDoctors] = useState('');
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docPhoto, setDocPhoto] = useState('');
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [editDocId, setEditDocId] = useState(null);

  // ======== PATIENTS ========
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [searchPatients, setSearchPatients] = useState('');
  const [patName, setPatName] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patDob, setPatDob] = useState('');
  const [patGender, setPatGender] = useState('MALE');
  const [patAddress, setPatAddress] = useState('');
  const [patPhoto, setPatPhoto] = useState('');
  const [isEditingPat, setIsEditingPat] = useState(false);
  const [editPatId, setEditPatId] = useState(null);

  // ======== APPOINTMENTS ========
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [apptPatientId, setApptPatientId] = useState('');
  const [apptDoctorId, setApptDoctorId] = useState('');
  const [apptDateTime, setApptDateTime] = useState('');
  const [apptReason, setApptReason] = useState('');
  const [apptNotes, setApptNotes] = useState('');
  const [apptStatus, setApptStatus] = useState('SCHEDULED');
  const [isEditingAppt, setIsEditingAppt] = useState(false);
  const [editApptId, setEditApptId] = useState(null);
  const [apptError, setApptError] = useState('');

  // ======== CHATBOT STATE ========
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: "👋 Hello! I'm your medical assistant. Describe your symptoms and I'll suggest the right doctor for you." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // ======== CHARTS STATE ========
  const [showCharts, setShowCharts] = useState(false);

  // ======== CHECK TOKEN ========
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // ======== FETCH ALL DATA ========
  useEffect(() => {
    if (token) {
      fetchDoctors();
      fetchPatients();
      fetchAppointments();
    }
  }, [token]);

  // ======== API HELPER ========
  const apiCall = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  };

  // ======== FETCH FUNCTIONS ========
  const fetchDoctors = () => {
    setLoadingDoctors(true);
    apiCall('http://localhost:8081/api/doctors')
      .then(res => res.json())
      .then(data => {
        setDoctors(Array.isArray(data) ? data : []);
        setLoadingDoctors(false);
      })
      .catch(() => setLoadingDoctors(false));
  };

  const fetchPatients = () => {
    setLoadingPatients(true);
    apiCall('http://localhost:8081/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(Array.isArray(data) ? data : []);
        setLoadingPatients(false);
      })
      .catch(() => setLoadingPatients(false));
  };

  const fetchAppointments = () => {
    setLoadingAppointments(true);
    apiCall('http://localhost:8081/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoadingAppointments(false);
      })
      .catch(() => setLoadingAppointments(false));
  };

  // ======== AUTH ========
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid credentials');
        return res.json();
      })
      .then(data => {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
        setUsername('');
        setPassword('');
        toast.success('🎉 Welcome back!');
      })
      .catch(err => setAuthError(err.message));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    fetch('http://localhost:8081/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Username already exists');
        return res.json();
      })
      .then(() => {
        setIsRegistering(false);
        toast.success('✅ Registration successful! Please login.');
        handleLogin(e);
      })
      .catch(err => setAuthError(err.message));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setToken('');
    setDoctors([]);
    setPatients([]);
    setAppointments([]);
    toast.info('👋 Logged out successfully');
  };

  // ======== TOAST HELPERS ========
  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else if (type === 'info') toast.info(message);
    else toast(message);
  };

  // ======== DOCTOR CRUD ========
  const handleDoctorSubmit = (e) => {
    e.preventDefault();
    const data = { name: docName, specialization: docSpecialization, email: docEmail, phone: docPhone, photoBase64: docPhoto || null };
    const url = isEditingDoc ? `http://localhost:8081/api/doctors/${editDocId}` : 'http://localhost:8081/api/doctors';
    const method = isEditingDoc ? 'PUT' : 'POST';
    apiCall(url, { method, body: JSON.stringify(data) })
      .then(res => res.json())
      .then(() => {
        resetDoctorForm();
        fetchDoctors();
        showToast(isEditingDoc ? '✅ Doctor updated successfully!' : '✅ Doctor added successfully!');
      })
      .catch(err => showToast('❌ Error saving doctor', 'error'));
  };

  const handleDeleteDoctor = (id) => {
    if (!window.confirm('Remove this doctor?')) return;
    apiCall(`http://localhost:8081/api/doctors/${id}`, { method: 'DELETE' })
      .then(() => {
        setDoctors(doctors.filter(d => d.id !== id));
        showToast('🗑️ Doctor removed successfully');
      })
      .catch(err => showToast('❌ Error deleting doctor', 'error'));
  };

  const handleEditDoctor = (doc) => {
    setIsEditingDoc(true);
    setEditDocId(doc.id);
    setDocName(doc.name);
    setDocSpecialization(doc.specialization);
    setDocEmail(doc.email);
    setDocPhone(doc.phone);
    setDocPhoto(doc.photoBase64 || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetDoctorForm = () => {
    setIsEditingDoc(false);
    setEditDocId(null);
    setDocName('');
    setDocSpecialization('');
    setDocEmail('');
    setDocPhone('');
    setDocPhoto('');
  };

  // ======== PATIENT CRUD ========
  const handlePatientSubmit = (e) => {
    e.preventDefault();
    const data = { name: patName, email: patEmail, phone: patPhone, dateOfBirth: patDob, gender: patGender, address: patAddress, photoBase64: patPhoto || null };
    const url = isEditingPat ? `http://localhost:8081/api/patients/${editPatId}` : 'http://localhost:8081/api/patients';
    const method = isEditingPat ? 'PUT' : 'POST';
    apiCall(url, { method, body: JSON.stringify(data) })
      .then(res => res.json())
      .then(() => {
        resetPatientForm();
        fetchPatients();
        showToast(isEditingPat ? '✅ Patient updated successfully!' : '✅ Patient added successfully!');
      })
      .catch(err => showToast('❌ Error saving patient', 'error'));
  };

  const handleDeletePatient = (id) => {
    if (!window.confirm('Remove this patient?')) return;
    apiCall(`http://localhost:8081/api/patients/${id}`, { method: 'DELETE' })
      .then(() => {
        setPatients(patients.filter(p => p.id !== id));
        showToast('🗑️ Patient removed successfully');
      })
      .catch(err => showToast('❌ Error deleting patient', 'error'));
  };

  const handleEditPatient = (pat) => {
    setIsEditingPat(true);
    setEditPatId(pat.id);
    setPatName(pat.name);
    setPatEmail(pat.email);
    setPatPhone(pat.phone);
    setPatDob(pat.dateOfBirth || '');
    setPatGender(pat.gender || 'MALE');
    setPatAddress(pat.address || '');
    setPatPhoto(pat.photoBase64 || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetPatientForm = () => {
    setIsEditingPat(false);
    setEditPatId(null);
    setPatName('');
    setPatEmail('');
    setPatPhone('');
    setPatDob('');
    setPatGender('MALE');
    setPatAddress('');
    setPatPhoto('');
  };

  // ======== APPOINTMENT CRUD ========
  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    setApptError('');

    if (!apptPatientId || !apptDoctorId || !apptDateTime) {
      setApptError('Please select patient, doctor, and date/time');
      return;
    }

    const data = {
      patient: { id: parseInt(apptPatientId) },
      doctor: { id: parseInt(apptDoctorId) },
      appointmentDateTime: apptDateTime,
      reason: apptReason,
      notes: apptNotes,
      status: apptStatus
    };

    const url = isEditingAppt ? `http://localhost:8081/api/appointments/${editApptId}` : 'http://localhost:8081/api/appointments';
    const method = isEditingAppt ? 'PUT' : 'POST';

    apiCall(url, { method, body: JSON.stringify(data) })
      .then(async res => {
        const text = await res.text();
        if (!res.ok) throw new Error(text || 'Failed to save appointment');
        return text ? JSON.parse(text) : {};
      })
      .then(() => {
        resetAppointmentForm();
        fetchAppointments();
        showToast(isEditingAppt ? '✅ Appointment updated!' : '📅 Appointment booked successfully!');
      })
      .catch(err => {
        setApptError(err.message || 'Failed to save appointment');
        showToast('❌ ' + err.message, 'error');
      });
  };

  const handleDeleteAppointment = (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    apiCall(`http://localhost:8081/api/appointments/${id}`, { method: 'DELETE' })
      .then(() => {
        setAppointments(appointments.filter(a => a.id !== id));
        showToast('🗑️ Appointment cancelled');
      })
      .catch(err => showToast('❌ Error cancelling appointment', 'error'));
  };

  const handleEditAppointment = (appt) => {
    setIsEditingAppt(true);
    setEditApptId(appt.id);
    setApptPatientId(appt.patient.id);
    setApptDoctorId(appt.doctor.id);
    setApptDateTime(appt.appointmentDateTime);
    setApptReason(appt.reason || '');
    setApptNotes(appt.notes || '');
    setApptStatus(appt.status || 'SCHEDULED');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAppointmentForm = () => {
    setIsEditingAppt(false);
    setEditApptId(null);
    setApptPatientId('');
    setApptDoctorId('');
    setApptDateTime('');
    setApptReason('');
    setApptNotes('');
    setApptStatus('SCHEDULED');
    setApptError('');
  };

  // ======== CHATBOT FUNCTIONS ========
  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('http://localhost:8081/api/chatbot/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.message,
        doctorId: data.doctorId,
        doctorName: data.doctorName
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: "❌ Sorry, I'm having trouble connecting. Please try again."
      }]);
    }
    setIsChatLoading(false);
  };

  // ======== EXPORT FUNCTIONS ========
  const exportDoctorsPDF = () => {
    const doc = new jsPDF();
    doc.text('Doctors List - HealSync Clinic', 14, 20);
    const tableData = doctors.map(d => [d.name, d.specialization, d.email, d.phone]);
    doc.autoTable({
      head: [['Name', 'Specialization', 'Email', 'Phone']],
      body: tableData,
      startY: 30,
    });
    doc.save('doctors-list.pdf');
    showToast('📄 Doctors PDF exported!');
  };

  const exportAppointmentsExcel = () => {
    const data = appointments.map(a => ({
      Patient: a.patient?.name || 'Unknown',
      Doctor: a.doctor?.name || 'Unknown',
      'Date & Time': new Date(a.appointmentDateTime).toLocaleString(),
      Status: a.status,
      Reason: a.reason || 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Appointments');
    XLSX.writeFile(wb, 'appointments-report.xlsx');
    showToast('📊 Excel report exported!');
  };

  // ======== CHART DATA ========
  const getAppointmentChartData = () => {
    const statusCounts = { SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 };
    appointments.forEach(a => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status]++;
    });
    return {
      labels: ['Scheduled', 'Completed', 'Cancelled'],
      datasets: [{
        label: 'Appointments',
        data: [statusCounts.SCHEDULED, statusCounts.COMPLETED, statusCounts.CANCELLED],
        backgroundColor: ['#2a9d8f', '#1976d2', '#e76f51'],
        borderWidth: 0,
      }]
    };
  };

  const getDoctorWorkloadChart = () => {
    const doctorCounts = {};
    doctors.forEach(d => {
      const count = appointments.filter(a => a.doctor?.id === d.id).length;
      doctorCounts[d.name] = count;
    });
    return {
      labels: Object.keys(doctorCounts) || ['No Doctors'],
      datasets: [{
        label: 'Appointments per Doctor',
        data: Object.values(doctorCounts) || [0],
        backgroundColor: '#2a9d8f',
        borderRadius: 8,
      }]
    };
  };

  // ======== FILTERS ========
  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(searchDoctors.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchDoctors.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchPatients.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchPatients.toLowerCase())
  );

  // ======== LOGIN SCREEN ========
  if (!isLoggedIn) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #d4e9e6 0%, #f4f9f9 100%)',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        padding: '20px'
      }}>
        <ToastContainer position="top-right" autoClose={3000} />
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: theme.radius,
          padding: '50px 40px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(42, 157, 143, 0.15)',
          border: '1px solid rgba(255,255,255,0.5)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '48px' }}>🏥</span>
            <h1 style={{ color: theme.text, margin: '10px 0 0', fontWeight: '700', fontSize: '28px' }}>
              HealSync
            </h1>
            <p style={{ color: '#5a7d7c', marginTop: '5px' }}>
              {isRegistering ? 'Create your healing space' : 'Welcome back, Healer'}
            </p>
          </div>

          {authError && (
            <div style={{ background: '#fde8e4', color: theme.danger, padding: '10px', borderRadius: '12px', fontSize: '14px', marginBottom: '20px' }}>
              {authError}
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%', padding: '15px 18px', boxSizing: 'border-box',
                  border: '1px solid #dce8e8', borderRadius: '50px',
                  fontSize: '16px', background: '#f8fbfb',
                  outline: 'none', fontFamily: 'inherit',
                  color: '#2d4059'
                }}
              />
            </div>
            <div style={{ marginBottom: '22px' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '15px 18px', boxSizing: 'border-box',
                  border: '1px solid #dce8e8', borderRadius: '50px',
                  fontSize: '16px', background: '#f8fbfb',
                  outline: 'none', fontFamily: 'inherit',
                  color: '#2d4059'
                }}
              />
            </div>
            <button type="submit" style={{
              width: '100%', padding: '15px',
              background: theme.primary, color: 'white',
              border: 'none', borderRadius: '50px',
              fontSize: '18px', fontWeight: '700',
              cursor: 'pointer', boxShadow: '0 8px 20px rgba(42, 157, 143, 0.3)',
              fontFamily: 'inherit'
            }}>
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>

          <button
            onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
            style={{
              background: 'transparent', border: 'none',
              color: theme.primary, cursor: 'pointer',
              marginTop: '20px', fontSize: '14px',
              fontWeight: '600', textDecoration: 'underline',
              fontFamily: 'inherit'
            }}
          >
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    );
  }

  // ======== MAIN DASHBOARD ========
  return (
    <div style={{
      background: theme.bg,
      minHeight: '100vh',
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      padding: '20px'
    }}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: theme.cardBg, padding: '15px 25px',
          borderRadius: theme.radius, boxShadow: theme.shadow,
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🩺</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', color: theme.text, fontWeight: '700' }}>HealSync Clinic</h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b8a89' }}>🕊️ Compassionate Care Dashboard</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', color: theme.text, opacity: 0.7 }}>👋 {username}</span>
            <button onClick={() => setShowCharts(!showCharts)} style={{
              background: '#e3f2fd',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              fontFamily: 'inherit',
              color: '#1976d2'
            }}>
              📊 {showCharts ? 'Hide Charts' : 'Show Charts'}
            </button>
            <button onClick={exportDoctorsPDF} style={{
              background: '#fef0ed',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              fontFamily: 'inherit',
              color: theme.danger
            }}>
              📄 Export PDF
            </button>
            <button onClick={exportAppointmentsExcel} style={{
              background: '#e8f5e9',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              fontFamily: 'inherit',
              color: theme.primary
            }}>
              📊 Export Excel
            </button>
            <button onClick={logout} style={{
              background: 'transparent', border: '1px solid #e2e8f0',
              padding: '8px 20px', borderRadius: '50px',
              color: theme.text, cursor: 'pointer',
              fontWeight: '600', fontSize: '13px',
              fontFamily: 'inherit'
            }}>
              Logout
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: theme.radius, textAlign: 'center', boxShadow: theme.shadow }}>
            <h2 style={{ margin: 0, fontSize: '28px', color: theme.primary }}>{doctors.length}</h2>
            <p style={{ margin: 0, color: '#5a7d7c', fontSize: '13px' }}>👨‍⚕️ Doctors</p>
          </div>
          <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: theme.radius, textAlign: 'center', boxShadow: theme.shadow }}>
            <h2 style={{ margin: 0, fontSize: '28px', color: '#1976d2' }}>{patients.length}</h2>
            <p style={{ margin: 0, color: '#5a7d7c', fontSize: '13px' }}>🧑‍⚕️ Patients</p>
          </div>
          <div style={{ background: '#fff3e0', padding: '15px', borderRadius: theme.radius, textAlign: 'center', boxShadow: theme.shadow }}>
            <h2 style={{ margin: 0, fontSize: '28px', color: theme.secondary }}>{appointments.length}</h2>
            <p style={{ margin: 0, color: '#5a7d7c', fontSize: '13px' }}>📅 Appointments</p>
          </div>
        </div>

        {/* CHARTS SECTION */}
        {showCharts && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ background: theme.cardBg, padding: '20px', borderRadius: theme.radius, boxShadow: theme.shadow }}>
              <h4 style={{ margin: '0 0 15px', color: theme.text }}>📊 Appointment Status</h4>
              <Pie data={getAppointmentChartData()} />
            </div>
            <div style={{ background: theme.cardBg, padding: '20px', borderRadius: theme.radius, boxShadow: theme.shadow }}>
              <h4 style={{ margin: '0 0 15px', color: theme.text }}>📈 Doctor Workload</h4>
              <Bar data={getDoctorWorkloadChart()} options={{ responsive: true }} />
            </div>
          </div>
        )}

        {/* TABS */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {['doctors', 'patients', 'appointments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 25px',
                borderRadius: '50px',
                border: 'none',
                background: activeTab === tab ? theme.primary : 'white',
                color: activeTab === tab ? 'white' : theme.text,
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: activeTab === tab ? '0 8px 20px rgba(42, 157, 143, 0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                fontFamily: 'inherit',
                fontSize: '14px',
                transition: '0.2s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ======== TAB CONTENT ======== */}
        
        {/* --- DOCTORS --- */}
        {activeTab === 'doctors' && (
          <div>
            <div style={{
              background: theme.cardBg,
              borderRadius: theme.radius,
              padding: '25px',
              boxShadow: theme.shadow,
              marginBottom: '20px',
              borderLeft: isEditingDoc ? `8px solid ${theme.secondary}` : `8px solid ${theme.primary}`
            }}>
              <h3 style={{ margin: '0 0 20px', color: theme.text, fontSize: '20px' }}>
                {isEditingDoc ? '✏️ Update Doctor' : '➕ Add New Doctor'}
              </h3>
              <form onSubmit={handleDoctorSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Full Name *</label>
                    <input type="text" placeholder="Dr. John Smith" value={docName} onChange={(e) => setDocName(e.target.value)} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Specialization *</label>
                    <input type="text" placeholder="Cardiologist" value={docSpecialization} onChange={(e) => setDocSpecialization(e.target.value)} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Email *</label>
                    <input type="email" placeholder="doctor@clinic.com" value={docEmail} onChange={(e) => setDocEmail(e.target.value)} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Phone *</label>
                    <input type="text" placeholder="555-0101" value={docPhone} onChange={(e) => setDocPhone(e.target.value)} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setDocPhoto(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} style={{ width: '100%', padding: '8px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button type="submit" style={{
                      padding: '12px 30px', borderRadius: '50px', border: 'none',
                      background: isEditingDoc ? theme.secondary : theme.primary,
                      color: isEditingDoc ? theme.text : 'white',
                      fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
                      boxShadow: '0 4px 15px rgba(42, 157, 143, 0.2)'
                    }}>
                      {isEditingDoc ? '✅ Update' : '➕ Add'}
                    </button>
                    {isEditingDoc && (
                      <button type="button" onClick={resetDoctorForm} style={{
                        padding: '12px 30px', borderRadius: '50px', border: '1px solid #e2e8f0',
                        background: 'white', color: theme.text, fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
                      }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ color: theme.text, margin: 0 }}>👨‍⚕️ Our Doctors</h2>
              <input type="text" placeholder="🔍 Search doctors..." value={searchDoctors} onChange={(e) => setSearchDoctors(e.target.value)}
                style={{ padding: '10px 18px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', width: '250px', background: 'white', boxSizing: 'border-box' }} />
            </div>
            {loadingDoctors ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {filteredDoctors.map(d => (
                  <div key={d.id} style={{ background: theme.cardBg, borderRadius: theme.radius, padding: '20px', boxShadow: theme.shadow, position: 'relative' }}>
                    {d.photoBase64 && <img src={d.photoBase64} alt={d.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />}
                    <h3 style={{ margin: '5px 0', fontSize: '18px', color: theme.text }}>{d.name}</h3>
                    <p style={{ margin: '2px 0', color: '#5a7d7c', fontSize: '13px' }}>{d.specialization}</p>
                    <p style={{ margin: '2px 0', color: '#5a7d7c', fontSize: '12px' }}>📧 {d.email}</p>
                    <p style={{ margin: '2px 0 15px', color: '#5a7d7c', fontSize: '12px' }}>📞 {d.phone}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditDoctor(d)} style={{ background: theme.secondary, color: theme.text, border: 'none', padding: '5px 15px', borderRadius: '50px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✏️</button>
                      <button onClick={() => handleDeleteDoctor(d.id)} style={{ background: '#fef0ed', color: theme.danger, border: 'none', padding: '5px 15px', borderRadius: '50px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- PATIENTS --- */}
        {activeTab === 'patients' && (
          <div>
            <div style={{
              background: theme.cardBg,
              borderRadius: theme.radius,
              padding: '25px',
              boxShadow: theme.shadow,
              marginBottom: '20px',
              borderLeft: isEditingPat ? `8px solid ${theme.secondary}` : `8px solid ${theme.primary}`
            }}>
              <h3 style={{ margin: '0 0 20px', color: theme.text, fontSize: '20px' }}>
                {isEditingPat ? '✏️ Update Patient' : '➕ Add New Patient'}
              </h3>
              <form onSubmit={handlePatientSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Full Name *</label>
                    <input type="text" placeholder="John Doe" value={patName} onChange={(e) => setPatName(e.target.value)} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Email *</label>
                    <input type="email" placeholder="patient@example.com" value={patEmail} onChange={(e) => setPatEmail(e.target.value)} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Phone *</label>
                    <input type="text" placeholder="555-0103" value={patPhone} onChange={(e) => setPatPhone(e.target.value)} required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Date of Birth</label>
                    <input type="date" value={patDob} onChange={(e) => setPatDob(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Gender</label>
                    <select value={patGender} onChange={(e) => setPatGender(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Address</label>
                    <input type="text" placeholder="123 Main St" value={patAddress} onChange={(e) => setPatAddress(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setPatPhoto(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} style={{ width: '100%', padding: '8px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button type="submit" style={{
                      padding: '12px 30px', borderRadius: '50px', border: 'none',
                      background: isEditingPat ? theme.secondary : theme.primary,
                      color: isEditingPat ? theme.text : 'white',
                      fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
                      boxShadow: '0 4px 15px rgba(42, 157, 143, 0.2)'
                    }}>
                      {isEditingPat ? '✅ Update' : '➕ Add'}
                    </button>
                    {isEditingPat && (
                      <button type="button" onClick={resetPatientForm} style={{
                        padding: '12px 30px', borderRadius: '50px', border: '1px solid #e2e8f0',
                        background: 'white', color: theme.text, fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
                      }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ color: theme.text, margin: 0 }}>🧑‍⚕️ Our Patients</h2>
              <input type="text" placeholder="🔍 Search patients..." value={searchPatients} onChange={(e) => setSearchPatients(e.target.value)}
                style={{ padding: '10px 18px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', width: '250px', background: 'white', boxSizing: 'border-box' }} />
            </div>
            {loadingPatients ? <p>Loading...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {filteredPatients.map(p => (
                  <div key={p.id} style={{ background: theme.cardBg, borderRadius: theme.radius, padding: '20px', boxShadow: theme.shadow, position: 'relative' }}>
                    {p.photoBase64 && <img src={p.photoBase64} alt={p.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />}
                    <h3 style={{ margin: '5px 0', fontSize: '18px', color: theme.text }}>{p.name}</h3>
                    <p style={{ margin: '2px 0', color: '#5a7d7c', fontSize: '12px' }}>📧 {p.email}</p>
                    <p style={{ margin: '2px 0', color: '#5a7d7c', fontSize: '12px' }}>📞 {p.phone}</p>
                    <p style={{ margin: '2px 0 15px', color: '#5a7d7c', fontSize: '12px' }}>🎂 {p.dateOfBirth || 'N/A'}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditPatient(p)} style={{ background: theme.secondary, color: theme.text, border: 'none', padding: '5px 15px', borderRadius: '50px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✏️</button>
                      <button onClick={() => handleDeletePatient(p.id)} style={{ background: '#fef0ed', color: theme.danger, border: 'none', padding: '5px 15px', borderRadius: '50px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- APPOINTMENTS --- */}
        {activeTab === 'appointments' && (
          <div>
            <div style={{
              background: theme.cardBg,
              borderRadius: theme.radius,
              padding: '25px',
              boxShadow: theme.shadow,
              marginBottom: '20px',
              borderLeft: isEditingAppt ? `8px solid ${theme.secondary}` : `8px solid ${theme.primary}`
            }}>
              <h3 style={{ margin: '0 0 20px', color: theme.text, fontSize: '20px' }}>
                {isEditingAppt ? '✏️ Update Appointment' : '📅 Book New Appointment'}
              </h3>
              
              {apptError && (
                <div style={{ background: '#fde8e4', color: theme.danger, padding: '10px', borderRadius: '12px', fontSize: '14px', marginBottom: '15px' }}>
                  ❌ {apptError}
                </div>
              )}

              <form onSubmit={handleAppointmentSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>👤 Patient *</label>
                    <select 
                      value={apptPatientId} 
                      onChange={(e) => setApptPatientId(e.target.value)} 
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }}>
                      <option value="">Select Patient</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>👨‍⚕️ Doctor *</label>
                    <select 
                      value={apptDoctorId} 
                      onChange={(e) => setApptDoctorId(e.target.value)} 
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }}>
                      <option value="">Select Doctor</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>📅 Date & Time *</label>
                    <input 
                      type="datetime-local" 
                      value={apptDateTime} 
                      onChange={(e) => setApptDateTime(e.target.value)} 
                      required
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>📌 Status</label>
                    <select 
                      value={apptStatus} 
                      onChange={(e) => setApptStatus(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }}>
                      <option value="SCHEDULED">📌 Scheduled</option>
                      <option value="COMPLETED">✅ Completed</option>
                      <option value="CANCELLED">❌ Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>📝 Reason</label>
                    <input 
                      type="text" 
                      placeholder="Reason for visit" 
                      value={apptReason} 
                      onChange={(e) => setApptReason(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#5a7d7c', marginBottom: '5px' }}>📋 Notes</label>
                    <input 
                      type="text" 
                      placeholder="Additional notes" 
                      value={apptNotes} 
                      onChange={(e) => setApptNotes(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', color: '#2d4059', background: 'white', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button type="submit" style={{
                      padding: '12px 30px', borderRadius: '50px', border: 'none',
                      background: isEditingAppt ? theme.secondary : theme.primary,
                      color: isEditingAppt ? theme.text : 'white',
                      fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px',
                      boxShadow: '0 4px 15px rgba(42, 157, 143, 0.2)'
                    }}>
                      {isEditingAppt ? '✅ Update' : '📅 Book'}
                    </button>
                    {isEditingAppt && (
                      <button type="button" onClick={resetAppointmentForm} style={{
                        padding: '12px 30px', borderRadius: '50px', border: '1px solid #e2e8f0',
                        background: 'white', color: theme.text, fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
                      }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <h2 style={{ color: theme.text, margin: '0 0 15px' }}>📅 All Appointments</h2>
            {loadingAppointments ? (
              <p>Loading appointments...</p>
            ) : appointments.length === 0 ? (
              <div style={{ background: theme.cardBg, padding: '40px', borderRadius: theme.radius, textAlign: 'center', boxShadow: theme.shadow }}>
                <p style={{ fontSize: '18px', color: '#6b8a89' }}>📭 No appointments booked yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {appointments.map(a => {
                  const statusColors = {
                    SCHEDULED: { bg: '#e8f5e9', color: theme.primary },
                    COMPLETED: { bg: '#e3f2fd', color: '#1976d2' },
                    CANCELLED: { bg: '#fde8e4', color: theme.danger }
                  };
                  const style = statusColors[a.status] || { bg: '#eee', color: theme.text };
                  return (
                    <div key={a.id} style={{ background: theme.cardBg, borderRadius: theme.radius, padding: '18px 22px', boxShadow: theme.shadow, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderLeft: `4px solid ${style.color}` }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '700', color: theme.text, fontSize: '16px' }}>{a.patient?.name || 'Unknown'}</span>
                          <span style={{ color: '#5a7d7c' }}>→</span>
                          <span style={{ fontWeight: '600', color: theme.primary }}>{a.doctor?.name || 'Unknown'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '5px' }}>
                          <span style={{ fontSize: '13px', color: '#5a7d7c' }}>📅 {new Date(a.appointmentDateTime).toLocaleString()}</span>
                          {a.reason && <span style={{ fontSize: '13px', color: '#5a7d7c' }}>📝 {a.reason}</span>}
                          <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 14px', borderRadius: '50px', background: style.bg, color: style.color }}>{a.status}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditAppointment(a)} style={{ background: theme.secondary, color: theme.text, border: 'none', padding: '6px 18px', borderRadius: '50px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>✏️ Edit</button>
                        <button onClick={() => handleDeleteAppointment(a.id)} style={{ background: '#fef0ed', color: theme.danger, border: 'none', padding: '6px 18px', borderRadius: '50px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>🗑️ Cancel</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======== CHATBOT FLOATING BUTTON ======== */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000
      }}>
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            style={{
              width: '65px',
              height: '65px',
              borderRadius: '50%',
              background: theme.primary,
              border: 'none',
              boxShadow: '0 8px 30px rgba(42, 157, 143, 0.4)',
              cursor: 'pointer',
              fontSize: '32px',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🤖
          </button>
        ) : (
          <div style={{
            position: 'absolute',
            bottom: '80px',
            right: '0',
            width: '400px',
            height: '500px',
            background: 'white',
            borderRadius: theme.radius,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e2e8f0'
          }}>
            {/* Chat Header */}
            <div style={{
              background: theme.primary,
              color: 'white',
              padding: '15px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <span style={{ fontWeight: '700', marginLeft: '10px' }}>Health Assistant</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              padding: '15px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: '#f8fbfb'
            }}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? theme.primary : 'white',
                    color: msg.sender === 'user' ? 'white' : theme.text,
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    maxWidth: '85%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    whiteSpace: 'pre-line',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                >
                  {msg.text}
                  {msg.doctorId && (
                    <button
                      onClick={() => {
                        setIsChatOpen(false);
                        setActiveTab('appointments');
                        setApptDoctorId(msg.doctorId);
                      }}
                      style={{
                        display: 'block',
                        marginTop: '10px',
                        padding: '8px 16px',
                        background: theme.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}
                    >
                      📅 Book with {msg.doctorName}
                    </button>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div style={{ alignSelf: 'flex-start', color: '#6b8a89', fontSize: '13px' }}>
                  Typing...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendChatMessage} style={{
              display: 'flex',
              padding: '12px',
              borderTop: '1px solid #e2e8f0',
              background: 'white'
            }}>
              <input
                type="text"
                placeholder="Describe your symptoms..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '50px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  color: '#2d4059',
                  background: '#f8fbfb'
                }}
              />
              <button
                type="submit"
                disabled={isChatLoading}
                style={{
                  marginLeft: '10px',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  border: 'none',
                  background: theme.primary,
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;