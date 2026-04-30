import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginTeacher } from '../api/requests';
import './LoginForm.css';

function LoginForm() {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!idNumber || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const res = await loginTeacher(idNumber, password);
      const teacherInfo = res.data;

      navigate('/home', { state: { teacher: teacherInfo } });

    } catch (err) {
      setError('Incorrect ID or password. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">

      <div className="form">
        <label>ID Number</label>
        <input
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
        />
      </div>

      <div className="form">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="error-message">{error}</div>

      <button type="submit" className="login-btn">
        Enter the App
      </button>

    </form>
  );
}

export default LoginForm;