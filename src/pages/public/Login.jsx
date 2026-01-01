import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from "../../context/DataProvider";

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) return alert("Ma'lumotlarni to'ldiring!");
    
    const result = await login(phone, password);
    
    if (result.success) {
      // --- YO'NALTIRISH MANTIQI (RO'LLAR BO'YICHA) ---
      if (result.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (result.role === 'student') {
        navigate('/student-dashboard');
      } else if (result.role === 'parent') {
        navigate('/parent-dashboard'); // Ota-ona kabinetiga yo'naltirish
      }
    } else {
      alert("Xatolik: " + result.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">Tizimga kirish</h2>
        
        <label className="block text-sm font-bold text-gray-700 mb-2">Telefon raqam</label>
        <input 
          type="text" placeholder="991234567" 
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={phone} onChange={e => setPhone(e.target.value)}
        />
        
        <label className="block text-sm font-bold text-gray-700 mb-2">Parol</label>
        <input 
          type="password" placeholder="********" 
          className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        
        <button disabled={loading} className={`w-full text-white p-3 rounded-lg font-bold transition ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {loading ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>
    </div>
  ); 
}