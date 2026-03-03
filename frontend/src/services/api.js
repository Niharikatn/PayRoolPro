import axios from 'axios';

// The Base URL from your teammate's API doc [cite: 44]
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach the JWT token to every request [cite: 73, 160]
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;