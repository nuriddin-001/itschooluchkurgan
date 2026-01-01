import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DataProvider, useData } from './context/DataProvider';

// Komponentlar
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Sahifalar
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import News from './pages/public/News';

// Dashboardlar
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import ParentDashboard from './pages/parent/ParentDashboard'; // <-- BU YERDA KOMMENTNI OLIB TASHLADIM

// --- HIMOYA LOYIHASI (Route Guard) ---
const ProtectedRoute = ({ children, role }) => {
  const { user } = useData(); 
  
  // Agar user tizimga kirmagan bo'lsa -> Login ga
  if (!user) return <Navigate to="/login" />;
  
  // Agar user roli to'g'ri kelmasa -> Bosh sahifaga
  if (user.role !== role) return <Navigate to="/" />;
  
  return children;
};

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> 
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          
          {/* Public Sahifalar (Navbar va Footer bor) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* --- YOPIQ SAHIFALAR (DASHBOARDLAR) --- */}
          
          {/* Admin Paneli */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* O'quvchi Paneli */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Ota-ona Paneli */}
          <Route path="/parent-dashboard" element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } />

          {/* Noto'g'ri manzil kiritilsa Bosh sahifaga otadi */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
    </DataProvider>
  );
}