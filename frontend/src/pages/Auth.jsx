import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import './Auth.css';

function Auth() {
  const [activeTab, setActiveTab] = useState('login');

  const getTabClassName = (tabName) => {
    if (activeTab === tabName) {
      return "tab-btn active";
    }
    return "tab-btn";
  };

  const renderActiveForm = () => {
    if (activeTab === 'login') {
      return <LoginForm />;
    }

    if (activeTab === 'register') {
      return <RegisterForm onSuccess={() => setActiveTab('login')} />;
    }

    return null;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-left">
          <h1>Bnot Moshe School</h1>
          <p>Annual Trip Management</p>
        </div>

        <div className="auth-content">
          <p className="auth-subtitle">Teacher Portal</p>

          <div className="auth-tabs">
            <button
              className={getTabClassName('login')}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>

            <button
              className={getTabClassName('register')}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>

          <div className="auth-form-container">
            {renderActiveForm()}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Auth;