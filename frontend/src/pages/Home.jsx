import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllTeachers, getAllStudents, getMyStudents, logoutTeacher, getTeacherAlerts } from '../api/requests';
import Header from '../components/Header';
import Card from '../components/Card';
import Map from '../components/Map';
import Popup from '../components/Popup';
import RegisterStudentPopup from '../components/RegisterStudentPopup';
import './Home.css';

function Home() {
  const [allteachersList, setAllTeachersList] = useState([]);
  const [allStudentsList, setAllStudentsList] = useState([]);
  const [myStudentsList, setMyStudentsList] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupData, setPopupData] = useState(null);
  const [alertsList, setAlertsList] = useState([]); // חדש! סטייט להתראות
  const navigate = useNavigate();
  const location = useLocation();
  const teacher = location.state?.teacher || {};
  const fullName = teacher.teacher_name || 'Teacher';
  const firstName = fullName.split(' ')[0];

  const loadData = async () => {
    try {
      const resAllTeachers = await getAllTeachers();
      setAllTeachersList(resAllTeachers.data);

      const resAllStudents = await getAllStudents();
      setAllStudentsList(resAllStudents.data);

      const teacherId = teacher.id;

      if (teacherId) {
        const resMyStudents = await getMyStudents(teacherId);
        setMyStudentsList(resMyStudents.data);

        const resAlerts = await getTeacherAlerts(teacherId);

        const formattedAlerts = resAlerts.data.alerts.map(a => {
          const nameParts = a.name.split(' ');

          return {
            id: a.id,
            first_name: nameParts[0] || "",
            last_name: nameParts.slice(1).join(' ') || "",
            class_name: teacher.class_name || "",
            distance: a.distance
          };
        });

        setAlertsList(formattedAlerts);

      } else {
        console.warn("Missing Teacher ID");
      }

    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    if (teacher.teacher_name) loadData();
  }, [teacher.teacher_name]);

  const openPopup = (title, dataList) => {
    setPopupTitle(title);
    setPopupData(dataList);
  };

  const handleLogout = async () => {
    try { await logoutTeacher(); }
    catch (err) { console.error("Error logging out:", err); }
    finally { navigate('/'); }
  };

  const dashboardCards = [
    {
      title: "Distance Alerts",
      number: alertsList.length,
      color: "#f0ad4e",
      onClick: () => openPopup('Distance Alerts', alertsList)
    },
    { title: "Total Students", number: allStudentsList.length, color: "#5bc0de", onClick: () => openPopup('All Students on Trip', allStudentsList) },
    { title: "Teachers on Trip", number: allteachersList.length, color: "#d9534f", onClick: () => openPopup('All Teachers on Trip', allteachersList) },
    { title: "My Students", number: myStudentsList.length, color: "#5cb85c", onClick: () => openPopup('My Class List', myStudentsList) }
  ];

  return (
    <div className="home-layout">
      <Header teacherName={fullName} onLogout={handleLogout} />

      <main className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="welcome-title">Welcome back, {firstName}</h1>
            <p className="welcome-subtitle">Class: {teacher.class_name || 'N/A'}</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="add-student-btn">
            + Add Student
          </button>
        </div>

        <div className="cards-row">
          {dashboardCards.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              number={card.number}
              color={card.color}
              onClick={card.onClick}
            />
          ))}
        </div>

        <Map onSimulationEnd={loadData} />
      </main>

      {popupData && <Popup title={popupTitle} data={popupData} onClose={() => setPopupData(null)} />}

      {isAddModalOpen && <RegisterStudentPopup onClose={() => setIsAddModalOpen(false)} onSuccess={loadData} />}
    </div>
  );
}

export default Home;