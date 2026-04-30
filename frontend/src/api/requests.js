import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// Teachers
export const registerTeacher = (firstName, lastName, classId, id, password) => {
    return axios.post(`${API_URL}/auth/register`, {
        first_name: firstName,
        last_name: lastName,
        class_id: classId,
        id: Number(id),
        password: password
    });
};

export const loginTeacher = (id, password) => {
    return axios.post(`${API_URL}/auth/login`, {
        id: id,
        password: password
    });
};

export const getAllTeachers = () => {
    return axios.get(`${API_URL}/users/teachers`);
};

export const logoutTeacher = () => {
  return axios.post('http://127.0.0.1:8000/auth/logout');
};

// Locations
export const getLatestLocations = () => {
    return axios.get(`${API_URL}/tracking/latest-locations`);
};

export const getAllLocations = () => {
    return axios.get(`${API_URL}/tracking/locations`);
};

export const simulateMovement = () => {
    return axios.post(`${API_URL}/tracking/simulate-movement`);
};

export const getTeacherAlerts = (teacherId) => {
  return axios.get(`${API_URL}/tracking/alerts/${teacherId}`);
};

// Students
export const createStudent = (firstName, lastName, classId, id) => {
    return axios.post(`${API_URL}/users/student`, {
        first_name: firstName,
        last_name: lastName,
        class_id: classId,
        id: id
    });
};

export const getAllStudents = () => {
    return axios.get(`${API_URL}/users/students`);
};

export const getMyStudents = (teacherId) => {
    return axios.get(`${API_URL}/users/my-students?teacher_id=${teacherId}`);
};

// Classes
export const getAllClasses = () => {
    return axios.get(`${API_URL}/users/classes`);
};

export const createClass = (name) => {
    return axios.post(`${API_URL}/users/classes`, {
        name: name
    });
};
