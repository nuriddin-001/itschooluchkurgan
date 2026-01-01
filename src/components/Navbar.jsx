import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataProvider';
import { FaHome, FaInfoCircle, FaPhoneAlt, FaNewspaper, FaUserGraduate, FaBars, FaTimes } from 'react-icons/fa';
import { BiLogOut, BiLogIn } from 'react-icons/bi';
import { RiAdminFill } from 'react-icons/ri';

export default function Navbar() {
  const { currentUser, logout } = useData();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-gray-100 shadow-2xl sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-2 hover:text-white transition">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <FaUserGraduate className="text-white" size={20} /> 
          </div>
          <span className="tracking-wide font-sans">Uchqorgon<span className="text-indigo-400">IT</span></span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center text-sm font-medium">
          <Link to="/" className="flex items-center gap-2 hover:text-indigo-400 transition duration-300">
            <FaHome size={16} /> Bosh Sahifa
          </Link>
          <Link to="/about" className="flex items-center gap-2 hover:text-indigo-400 transition duration-300">
            <FaInfoCircle size={16} /> Haqimizda
          </Link>
          <Link to="/news" className="flex items-center gap-2 hover:text-indigo-400 transition duration-300">
            <FaNewspaper size={16} /> Yangiliklar
          </Link>
          <Link to="/contact" className="flex items-center gap-2 hover:text-indigo-400 transition duration-300">
            <FaPhoneAlt size={16} /> Aloqa
          </Link>
          
          {/* User Status */}
          {currentUser ? (
            <div className="flex gap-4 items-center bg-slate-800 px-5 py-2 rounded-full border border-slate-700">
              <span className="flex items-center gap-2 font-semibold text-indigo-300">
                <RiAdminFill /> {currentUser.name}
              </span>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition flex items-center gap-1 font-bold text-xs uppercase tracking-wider">
                <BiLogOut size={16}/> Chiqish
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/30 flex items-center gap-2">
              <BiLogIn size={20} /> Kirish
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-300" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 p-6 flex flex-col gap-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-2 py-2 hover:text-indigo-400" onClick={() => setIsOpen(false)}>
             <FaHome /> Bosh Sahifa
          </Link>
          <Link to="/about" className="flex items-center gap-2 py-2 hover:text-indigo-400" onClick={() => setIsOpen(false)}>
             <FaInfoCircle /> Haqimizda
          </Link>
          <Link to="/news" className="flex items-center gap-2 py-2 hover:text-indigo-400" onClick={() => setIsOpen(false)}>
             <FaNewspaper /> Yangiliklar
          </Link>
          <Link to="/contact" className="flex items-center gap-2 py-2 hover:text-indigo-400" onClick={() => setIsOpen(false)}>
             <FaPhoneAlt /> Aloqa
          </Link>
        </div>
      )}
    </nav>
  );
}