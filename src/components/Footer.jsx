import React from 'react';
import { Link } from 'react-router-dom';
import { FaTelegram, FaInstagram, FaFacebook, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
      <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
          
          {/* Logo qism */}
          <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">Uchqorgon<span className="text-indigo-500">IT</span></h2>
              <p className="mb-6 max-w-sm">
                  Bizning maqsadimiz — Uchqo'rg'on yoshlarini 2026-yilgi global IT bozoriga tayyorlash.
              </p>
              
              {/* IJTIMOIY TARMOQLAR */}
              <div className="flex gap-4">
                  {/* Telegram: https://t.me/uchqorgon_it_school */}
                  <a 
                    href="https://t.me/uchqorgonitschool" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition"
                  >
                    <FaTelegram size={20} />
                  </a>

                  {/* Instagram: https://instagram.com/uchqorgon_it_school */}
                  <a 
                    href="https://instagram.com/uchqorgon_it_school" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition"
                  >
                    <FaInstagram size={20} />
                  </a>

                  {/* Facebook: https://facebook.com/uchqorgon_it_school */}
                  <a 
                    href="https://facebook.com/uchqorgon_it_school" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                  >
                    <FaFacebook size={20} />
                  </a>
              </div>
          </div>

          {/* Havolalar */}
          <div>
              <h3 className="text-white font-bold mb-4">Tezkor Havolalar</h3>
              <ul className="space-y-2 text-sm">
                  <li><Link to="/" className="hover:text-indigo-400 transition">Bosh Sahifa</Link></li>
                  <li><Link to="/about" className="hover:text-indigo-400 transition">Biz Haqimizda</Link></li>
                  <li><Link to="/news" className="hover:text-indigo-400 transition">Yangiliklar</Link></li>
                  <li><Link to="/contact" className="hover:text-indigo-400 transition">Aloqa</Link></li>
              </ul>
          </div>

          {/* Aloqa */}
          <div>
              <h3 className="text-white font-bold mb-4">Bog'lanish</h3>
              <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                      <FaPhoneAlt className="text-indigo-500" /> 
                      <span>+998 99 123 45 67</span>
                  </li>
                  <li className="flex items-center gap-3">
                      <FaEnvelope className="text-indigo-500" /> 
                      <span>info@uchqorgon-it.uz</span>
                  </li>
                  <li className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-indigo-500 mt-1" /> 
                      <span>Namangan, Uchqo'rg'on sh.</span>
                  </li>
              </ul>
          </div>
      </div>

      <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm">
          <p>&copy; 2026 Uchqorgon IT School. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
}