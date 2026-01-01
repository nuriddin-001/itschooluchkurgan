import React from 'react';

export default function News() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Yangiliklar</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-4 shadow rounded border">
          <h2 className="font-bold text-xl">Yangi guruh ochilmoqda!</h2>
          <p className="text-gray-600">Frontend dasturlash bo'yicha yangi kursga qabul boshlandi.</p>
          <span className="text-sm text-gray-400">26.12.2025</span>
        </div>
        <div className="bg-white p-4 shadow rounded border">
          <h2 className="font-bold text-xl">Imtihon natijalari</h2>
          <p className="text-gray-600">O'tgan oyning eng yaxshi o'quvchilari aniqlandi.</p>
          <span className="text-sm text-gray-400">25.12.2025</span>
        </div>
      </div>
    </div>
  );
}