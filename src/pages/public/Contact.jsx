import React from 'react';
import { FaPhoneVolume, FaMapMarkedAlt, FaEnvelopeOpenText } from 'react-icons/fa';

export default function Contact() {
  return (
    <div className="container mx-auto p-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-700 mb-10">Biz bilan bog'laning</h1>
      
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        
        {/* Telefon */}
        <div className="bg-white p-8 rounded-xl shadow-md text-center border hover:border-blue-500 transition">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4">
            <FaPhoneVolume />
          </div>
          <h3 className="text-xl font-bold mb-2">Qo'ng'iroq qiling</h3>
          <p className="text-gray-600">+998 99 123 45 67</p>
          <p className="text-gray-600">+998 90 123 45 67</p>
        </div>

        {/* Manzil */}
        <div className="bg-white p-8 rounded-xl shadow-md text-center border hover:border-blue-500 transition">
          <div className="bg-green-100 text-green-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4">
            <FaMapMarkedAlt />
          </div>
          <h3 className="text-xl font-bold mb-2">Manzilimiz</h3>
          <p className="text-gray-600">Namangan viloyati,</p>
          <p className="text-gray-600">Uchqo'rg'on tumani markazi</p>
        </div>

        {/* Email */}
        <div className="bg-white p-8 rounded-xl shadow-md text-center border hover:border-blue-500 transition">
          <div className="bg-orange-100 text-orange-600 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4">
            <FaEnvelopeOpenText />
          </div>
          <h3 className="text-xl font-bold mb-2">Elektron Pochta</h3>
          <p className="text-gray-600">info@uchqorgon-it.uz</p>
          <p className="text-gray-600">admin@uchqorgon-it.uz</p>
        </div>

      </div>
    </div>
  );
}