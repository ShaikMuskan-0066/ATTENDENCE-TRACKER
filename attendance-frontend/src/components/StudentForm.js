// src/components/StudentForm.js
import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

function StudentForm({ refresh }) {
  const [form, setForm] = useState({ name: '', rollNo: '', parentMobile: '' });

  const handleSubmit = () => {
    if (!form.name || !form.rollNo || !form.parentMobile) {
      alert("Please fill all fields");
      return;
    }

    axios.post(`${API}/students`, {
      name: form.name,
      rollNo: parseInt(form.rollNo),
      parentMobile: form.parentMobile
    })
      .then(() => {
        alert('✅ Student added');
        refresh();
      })
      .catch(err => {
        console.error("Error:", err.response?.data || err.message);
        alert('❌ Failed to add student');
      });
  };

  return (
    <div>
      <h2>Add Student</h2>
      <input
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Roll No"
        type="number"
        value={form.rollNo}
        onChange={e => setForm({ ...form, rollNo: e.target.value })}
      />
      <input
        placeholder="Parent Mobile"
        value={form.parentMobile}
        onChange={e => setForm({ ...form, parentMobile: e.target.value })}
      />
      <button onClick={handleSubmit}>Add</button>
    </div>
  );
}

export default StudentForm;
