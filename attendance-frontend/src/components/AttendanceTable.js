import React from 'react';

function AttendanceTable({ students, attendance, onMark, onDelete }) {
  return (
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Name</th>
          <th>Roll No</th>
          <th>Attendance</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {students.map(s => (
          <tr key={s._id}>
            <td>{s.name}</td>
            <td>{s.rollNo}</td>
            <td>
              <button onClick={() => onMark(s._id, 'Present')}>✅</button>
              <button onClick={() => onMark(s._id, 'Absent')}>❌</button>
              <span style={{ marginLeft: 10 }}>{attendance[s._id]}</span>
            </td>
            <td>
              <button onClick={() => onDelete(s._id)}>🗑️ Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AttendanceTable;
