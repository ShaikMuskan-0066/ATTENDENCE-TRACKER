import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

function StudentForm({ refresh }) {
  const [form, setForm] = useState({ name: '', rollNo: '', parentPhone: '' });

  const handleSubmit = () => {
    axios.post(`${API}/students`, form)
      .then(() => {
        alert('Student added');
        refresh();
      })
      .catch(() => alert('Error adding student'));
  };

  return (
    <div>
      <h2>Add Student</h2>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Roll No" onChange={e => setForm({ ...form, rollNo: e.target.value })} />
      <input placeholder="Parent Mobile" onChange={e => setForm({ ...form, parentPhone: e.target.value })} />
      <button onClick={handleSubmit}>Add</button>
    </div>
  );
}

export default StudentForm;
