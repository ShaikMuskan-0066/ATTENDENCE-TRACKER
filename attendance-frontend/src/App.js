import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import StudentForm from './components/StudentForm';
import AttendanceTable from './components/AttendanceTable';

const API = process.env.REACT_APP_API_URL;



function App() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  // ✅ Load Students on Mount
  useEffect(() => {
    axios.get(`${API}/students`)
      .then(res => {
        setStudents(res.data);
        const init = {};
        res.data.forEach(s => (init[s._id] = 'Present'));
        setAttendance(init);
      })
      .catch(() => alert("❌ Failed to load students."));
  }, []);

  // ✅ Mark Present/Absent
  const mark = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  // ✅ Save Attendance (Corrected!)
  const save = () => {
  const records = students.map(s => ({
    student: s._id,                            // ✅ only required field
    status: attendance[s._id] || 'Present'     // ✅ enum: Present or Absent
  }));

  axios.post(`${API}/attendance`, records)
    .then(() => alert("✅ Attendance saved and SMS sent!"))
    .catch(err => {
      console.error("❌ Error saving attendance:", err.response?.data || err.message);
      alert("❌ Failed to save attendance");
    });
};

  // ✅ Download Excel Report
  const downloadExcel = () => {
    window.open(`${API}/export/excel`, '_blank');
  };

  // ✅ Delete Student
  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    await axios.delete(`${API}/students/${id}`)
      .then(() => {
        alert("🗑️ Student deleted");
        setStudents(prev => prev.filter(s => s._id !== id));
        setAttendance(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      })
      .catch(() => alert("❌ Failed to delete student"));
  };

  return (
    <div className="container">
      <h1>📘 Attendance Tracker</h1>

      <StudentForm refresh={() => window.location.reload()} />

      <AttendanceTable
        students={students}
        attendance={attendance}
        onMark={mark}
        onDelete={deleteStudent}
      />

      <div className="action-buttons">
        <button onClick={save}>✅ Save Attendance</button>
        <button onClick={downloadExcel}>📥 Download Excel</button>
      </div>
    </div>
  );
}

export default App;
