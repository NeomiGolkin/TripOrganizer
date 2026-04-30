import { useState } from 'react';
import { registerTeacher, getAllClasses, createClass } from '../api/requests';
import './RegisterForm.css';

function RegisterForm({ onSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [grade, setGrade] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !idNumber || !grade || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      const res = await getAllClasses();
      const classesList = res.data;

      let targetClassId = 0;

      const existingClass = classesList.find(c => c.name === grade);

      if (existingClass) {
        targetClassId = existingClass.id;
      } else {
        const newClassRes = await createClass(grade);
        targetClassId = newClassRes.data.id;
      }

      await registerTeacher(firstName, lastName, targetClassId, idNumber, password);

      alert('Registration successful!');
      if (onSuccess) onSuccess();

    } catch (err) {
      setError('Registration failed. Please check your details.');
    }
  };

  const formFields = [
    { label: 'First Name', value: firstName, setter: setFirstName, type: 'text' },
    { label: 'Last Name', value: lastName, setter: setLastName, type: 'text' },
    { label: 'ID Number', value: idNumber, setter: setIdNumber, type: 'text' },
    { label: 'Class Name', value: grade, setter: setGrade, type: 'text', placeholder: 'e.g., Class A1' },
    { label: 'Password', value: password, setter: setPassword, type: 'password' }
  ];

  return (
    <form onSubmit={handleSubmit} className="register-form">

      {formFields.map((field, index) => (
        <div className="form" key={index}>
          <label>{field.label}</label>
          <input
            type={field.type}
            value={field.value}
            onChange={(e) => field.setter(e.target.value)}
            placeholder={field.placeholder || ''}
          />
        </div>
      ))}

      <div className="error-message">{error}</div>

      <button type="submit" className="register-btn">
        Register
      </button>

    </form>
  );
}

export default RegisterForm;