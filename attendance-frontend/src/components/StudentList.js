import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/students')
      .then(res => {
        setStudents(res.data);
      })
      .catch(err => {
        console.error("Error fetching students:", err);
      });
  }, []);

  return (
    <div>
      <h2>All Students</h2>
      <ul>
        {students.map((s) => (
          <li key={s._id}>{s.name} ({s.rollNumber})</li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;
