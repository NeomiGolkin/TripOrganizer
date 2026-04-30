import { useState } from 'react';
import { createStudent, getAllClasses, createClass } from '../api/requests';
import './RegisterStudentPopup.css';

function RegisterStudentPopup({ onClose, onSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');

  const saveStudent = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !studentId || !grade) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const res = await getAllClasses();
      const classes = res.data;

      let targetClassId = 0;

      for (let i = 0; i < classes.length; i++) {
        if (classes[i].name === grade) {
          targetClassId = classes[i].id;
          break;
        }
      }

      if (targetClassId === 0) {
        const newClass = await createClass(grade);
        targetClassId = newClass.data.id;
      }

      await createStudent(firstName, lastName, targetClassId, studentId);
      alert('Student registered successfully!');

      onClose();
      if (onSuccess) onSuccess();

    } catch (err) {
      setError('Registration failed. ID might already exist.');
    }
  };
const formFields = [
    { label: 'First Name', value: firstName, setter: setFirstName },
    { label: 'Last Name', value: lastName, setter: setLastName },
    { label: 'ID Number', value: studentId, setter: setStudentId },
    { label: 'Grade', value: grade, setter: setGrade, placeholder: 'e.g., A1' }
  ];

  return (
    <div className="modal">
      <div className="modal-box">

        <div className="modal-header">
          <h2>New Student</h2>
          <button onClick={onClose} className="close-btn">X</button>
        </div>

        <form onSubmit={saveStudent} className="student-form">

          {formFields.map((field, index) => (
            <div className="form" key={index}>
              <label>{field.label}</label>
              <input
                type="text"
                value={field.value}
                onChange={e => field.setter(e.target.value)}
                className="form-input"
                placeholder={field.placeholder || ''}
              />
            </div>
          ))}

          <div className="error-text">{error}</div>

          <button type="submit" className="submit-btn">
            Save
          </button>
        </form>

      </div>
    </div>
  );
}

export default RegisterStudentPopup;