import React from 'react';
// Keraksiz ikonkalarni importdan ham olib tashladik
import { FaLaptop, FaReact, FaServer, FaCube, FaAndroid } from 'react-icons/fa';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* 1. Header Qismi */}
      <div className="bg-slate-900 text-white py-20 px-6 text-center relative overflow-hidden">
        {/* Orqa fon bezaklari */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 relative z-10">
          Bizning Yo'nalishlar
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-lg relative z-10">
          Uchqo'rg'on IT maktabida 2026-yil talablariga mos keluvchi eng dolzarb kasblarni o'rganing.
        </p>
      </div>

      {/* 2. KURS YO'NALISHLARI (5 ta) */}
      <div className="container mx-auto px-6 py-16 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 -mt-24 relative z-20">
          
          {/* 1. Kompyuter Savodxonligi */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-b-4 border-blue-500 hover:-translate-y-2 transition duration-300">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-6">
              <FaLaptop />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Kompyuter Savodxonligi</h3>
            <p className="text-gray-600">
              Noldan boshlovchilar uchun. Windows, Office dasturlari (Word, Excel, PowerPoint) va tez yozish sirlari.
            </p>
          </div>

          {/* 2. Frontend Dasturlash */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-b-4 border-cyan-400 hover:-translate-y-2 transition duration-300">
            <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-3xl mb-6">
              <FaReact />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Frontend (Web)</h3>
            <p className="text-gray-600">
              Veb-saytlar yaratish. HTML, CSS, JavaScript, ReactJS va zamonaviy UI kutubxonalari.
            </p>
          </div>

          {/* 3. Backend Dasturlash */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-b-4 border-green-500 hover:-translate-y-2 transition duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-6">
              <FaServer />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Backend</h3>
            <p className="text-gray-600">
              Murakkab tizimlar logikasi. Node.js, Python, Ma'lumotlar bazasi (MongoDB, PostgreSQL) va API.
            </p>
          </div>

          {/* 4. 3D Grafika (3ds Max) */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-b-4 border-purple-500 hover:-translate-y-2 transition duration-300">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mb-6">
              <FaCube />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">3D Grafika & Dizayn</h3>
            <p className="text-gray-600">
              Autodesk 3ds Max yordamida interyer, eksteryer dizayn va 3D modellashtirishni professional o'rganing.
            </p>
          </div>

          {/* 5. Android Dasturlash */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-b-4 border-green-600 hover:-translate-y-2 transition duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-3xl mb-6">
              <FaAndroid />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Android Dasturlash</h3>
            <p className="text-gray-600">
              Mobil ilovalar yaratish. Java/Kotlin tillari orqali Play Market uchun real ilovalar tuzish.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}