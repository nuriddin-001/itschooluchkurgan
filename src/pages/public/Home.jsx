import React from 'react';
import { Link } from 'react-router-dom';
// FaRocket ni import qildik
import { FaReact, FaNodeJs, FaFigma, FaArrowRight, FaRocket } from 'react-icons/fa';
import { SiTailwindcss, SiMongodb } from 'react-icons/si';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white py-24 px-6 text-center shadow-2xl relative overflow-hidden">
        
        {/* Orqa fondagi bezaklar */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>

        {/* Badge: 2026 (O'ZGARTIRILDI) */}
        {/* 'inline-block' o'rniga 'inline-flex items-center gap-2' ishlatdik */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide animate-bounce">
          <FaRocket className="text-lg" /> 
          <span>QABUL 2026 BOSHLANDI</span>
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
          Kelajak Kasbini <br/> 
          <span className="text-indigo-400">Biz Bilan O'rganing</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          2026-yilgi yangi o'quv dasturi asosida, sun'iy intellekt va zamonaviy texnologiyalarni chuqur o'rganing.
        </p>
        
        <Link 
          to="/login" 
          className="inline-flex items-center gap-3 bg-white text-indigo-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl shadow-indigo-900/50 transform hover:-translate-y-1"
        >
          Hoziroq Ro'yxatdan O'ting <FaArrowRight />
        </Link>
      </div>

      {/* Kurslar Bo'limi */}
      <div className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">2026-Yil Yo'nalishlari</h2>
          <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Frontend */}
          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-2xl transition duration-300 group border border-gray-100 hover:border-indigo-500 relative top-0 hover:-top-2">
            <div className="flex justify-center gap-6 mb-6">
              <FaReact className="text-6xl text-blue-500 group-hover:animate-spin-slow transition" />
              <SiTailwindcss className="text-6xl text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-slate-800 group-hover:text-indigo-600 transition">Frontend 2026</h3>
            <p className="text-gray-500 text-center leading-relaxed">
              Eng so'nggi React 19 va Next.js texnologiyalari yordamida tezkor saytlar yarating.
            </p>
          </div>

          {/* Backend */}
          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-2xl transition duration-300 group border border-gray-100 hover:border-green-500 relative top-0 hover:-top-2">
            <div className="flex justify-center gap-6 mb-6">
              <FaNodeJs className="text-6xl text-green-600" />
              <SiMongodb className="text-6xl text-green-800" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-slate-800 group-hover:text-green-600 transition">Backend AI</h3>
            <p className="text-gray-500 text-center leading-relaxed">
              Node.js va Python yordamida murakkab tizimlar va Sun'iy Intellekt (AI) integratsiyasi.
            </p>
          </div>

          {/* Dizayn */}
          <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-2xl transition duration-300 group border border-gray-100 hover:border-purple-500 relative top-0 hover:-top-2">
            <div className="flex justify-center mb-6">
              <FaFigma className="text-6xl text-purple-600 group-hover:scale-110 transition" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-slate-800 group-hover:text-purple-600 transition">UI/UX & 3D</h3>
            <p className="text-gray-500 text-center leading-relaxed">
              Figma va 3D vositalar orqali kelajak dizaynini yarating. Web 3.0 dizayn asoslari.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}