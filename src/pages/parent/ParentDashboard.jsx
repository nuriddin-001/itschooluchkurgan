import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useData } from '../../context/DataProvider';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserTie, FaUserGraduate, FaMoneyBillWave, FaCalendarCheck, FaStar, FaChartLine, FaClipboardList, FaExclamationTriangle, FaComment, FaBell, FaTimesCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParentDashboard() {
  const { user, logout } = useData();
  const navigate = useNavigate();
  
  // STATE
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [childGroup, setChildGroup] = useState(null);
  const [childExams, setChildExams] = useState([]); 
  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState([]); // Bildirishnomalar
  const [showNotifications, setShowNotifications] = useState(false); // Modal
  const [hasNewMessages, setHasNewMessages] = useState(false); // Qizil nuqta

  useEffect(() => {
    const fetchChildData = async () => {
        if (user && user.role === 'parent') {
            setLoading(true);
            try {
                const userId = user._id || user.id;
                // Parallel so'rovlar
                const [usersRes, groupsRes, examsRes, notifRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/users'),
                    axios.get('http://localhost:5000/api/groups'),
                    axios.get('http://localhost:5000/api/exams/results'),
                    axios.get(`http://localhost:5000/api/notifications/${userId}`)
                ]);

                const foundChild = usersRes.data.find(u => u.parentId === userId);
                setChild(foundChild);
                setNotifications(notifRes.data);

                // Qizil nuqta mantig'i (Local Storage)
                const serverCount = notifRes.data.length;
                const localCount = parseInt(localStorage.getItem(`read_notif_count_${userId}`) || '0');
                if (serverCount > localCount) {
                    setHasNewMessages(true);
                }
                
                if (foundChild) {
                    const group = groupsRes.data.find(g => g.students.some(s => s._id === foundChild._id));
                    setChildGroup(group);

                    const results = examsRes.data.filter(r => r.studentId._id === foundChild._id);
                    setChildExams(results);
                }
            } catch (error) {
                console.error("Xatolik:", error);
            } finally {
                setLoading(false);
            }
        }
    };
    fetchChildData();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    setHasNewMessages(false);
    const userId = user._id || user.id;
    localStorage.setItem(`read_notif_count_${userId}`, notifications.length);
  };

  if (!user || loading) return <div className="flex items-center justify-center h-screen text-indigo-600 font-bold bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mr-3"></div> Yuklanmoqda...</div>;

  const monthsUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const date = new Date();
  const currentMonthUz = `${monthsUz[date.getMonth()]} ${date.getFullYear()}`;
  const isPaidThisMonth = child?.payments?.some(p => p.month === currentMonthUz);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 md:pb-0 relative">
      
      {/* NOTIFICATION MODAL */}
      <AnimatePresence>
        {showNotifications && (
            <div className="fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-sm" onClick={() => setShowNotifications(false)}>
                <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring', stiffness: 300, damping: 30}} className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaBell className="text-indigo-600"/> Bildirishnomalar</h2>
                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-red-500"><FaTimesCircle size={24}/></button>
                    </div>
                    
                    <div className="space-y-4">
                        {!isPaidThisMonth && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                <h4 className="font-bold text-red-700">To'lov Eslatmasi!</h4>
                                <p className="text-sm text-red-600 mt-1">{currentMonthUz} oyi uchun to'lov qilinmagan. Iltimos, to'lovni amalga oshiring.</p>
                            </div>
                        )}
                        
                        {notifications.length === 0 && isPaidThisMonth ? (
                            <p className="text-center text-gray-400 mt-10">Yangi xabarlar yo'q.</p>
                        ) : (
                            notifications.map((notif, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-800">{notif.title}</h4>
                                        <span className="text-[10px] text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{notif.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className="bg-indigo-800 text-white p-4 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full"><FaUserTie className="text-xl"/></div>
                <div><h1 className="text-lg font-bold leading-tight">{user.name}</h1><p className="text-xs text-indigo-200">Ota-ona Kabineti</p></div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={handleOpenNotifications} className="relative p-2 rounded-full hover:bg-white/20 transition">
                    <FaBell size={20}/>
                    {(!isPaidThisMonth || hasNewMessages) && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                <button onClick={handleLogout} className="text-sm bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition flex items-center gap-2"><FaSignOutAlt /> Chiqish</button>
            </div>
        </div>
      </nav>

      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        {!child ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200 mt-10">
                <FaExclamationTriangle className="text-6xl text-yellow-400 mx-auto mb-4"/>
                <p className="text-slate-600 font-bold text-lg">Sizga hali farzand biriktirilmagan.</p>
                <p className="text-sm text-gray-500 mt-2">Iltimos, o'quv markaz ma'muriyati bilan bog'laning.</p>
            </div>
        ) : (
            <>
                {/* MENU */}
                <div className="hidden md:flex justify-center mb-8 gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-fit mx-auto overflow-x-auto">
                    {[
                        { id: 'home', icon: FaUserGraduate, label: "Farzandim" },
                        { id: 'grades', icon: FaStar, label: "Baholar" },
                        { id: 'exams', icon: FaClipboardList, label: "Imtihon" },
                        { id: 'payments', icon: FaMoneyBillWave, label: "To'lov" },
                        { id: 'attendance', icon: FaCalendarCheck, label: "Davomat" },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <tab.icon /> {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ASOSIY TAB */}
                    {activeTab === 'home' && (
                        <motion.div key="home" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl shadow-inner"><FaUserGraduate/></div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{child.name}</h2>
                                    <p className="text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded text-sm w-fit mt-1">{child.course} o'quvchisi</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Telefon</p>
                                    <p className="font-bold text-slate-700">{child.phone}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Guruh</p>
                                    <p className="font-bold text-slate-700">{childGroup ? childGroup.name : "Biriktirilmagan"}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Rejim</p>
                                    <p className="font-bold text-slate-700">{child.schedule === 'daily' ? 'Har kuni' : 'Kun ora'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Status</p>
                                    <p className={`font-bold ${child.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>{child.status === 'active' ? "O'qimoqda" : "Ketgan"}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* BAHOLAR */}
                    {activeTab === 'grades' && (
                         <motion.div key="grades" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2"><FaStar className="text-yellow-500"/> Baholar Kundaligi</div>
                            {!childGroup || !childGroup.grades ? <div className="text-center py-10 text-gray-400"><FaStar className="text-4xl mx-auto mb-2 opacity-30"/><p>Baholar yo'q</p></div> : 
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                    {childGroup.grades.slice().reverse().map((day, i) => {
                                        const record = day.records.find(r => r.studentId === child._id);
                                        if (!record) return null;
                                        return (
                                            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">{day.date}</p>
                                                    {record.comment ? <p className="text-xs text-slate-500 flex items-center gap-1"><FaComment/> {record.comment}</p> : <span className="text-[10px] text-gray-300">Izohsiz</span>}
                                                </div>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md 
                                                    ${record.score >= 5 ? 'bg-green-500' : record.score === 4 ? 'bg-blue-500' : record.score === 3 ? 'bg-yellow-400' : 'bg-red-500'}`}>
                                                    {record.score}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            }
                        </motion.div>
                    )}
                    
                    {/* DAVOMAT */}
                    {activeTab === 'attendance' && (
                        <motion.div key="attendance" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                             <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2"><FaCalendarCheck className="text-blue-500"/> Davomat</h3>
                             {!childGroup ? <p className="text-center text-gray-400">Guruh ma'lumotlari yo'q</p> : 
                                <div className="space-y-2">
                                    {childGroup.attendance?.slice().reverse().map((day, i) => {
                                        const attRec = day.records.find(r => r.studentId === child._id);
                                        if(!attRec) return null;
                                        return (
                                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <span className="font-bold text-slate-700">{day.date}</span>
                                                {attRec.status === 'present' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">BOR</span>}
                                                {attRec.status === 'absent' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">YO'Q</span>}
                                                {attRec.status === 'late' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">KECH</span>}
                                            </div>
                                        )
                                    })}
                                </div>
                             }
                        </motion.div>
                    )}

                    {/* IMTIHON NATIJALARI */}
                    {activeTab === 'exams' && (
                        <motion.div key="exams" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2"><FaClipboardList className="text-purple-500"/> Imtihon Natijalari</h3>
                            {childExams.length === 0 ? <div className="text-center py-10 text-gray-400"><FaClipboardList className="text-4xl mx-auto mb-2 opacity-30"/><p>Imtihon natijalari mavjud emas.</p></div> : 
                                <div className="space-y-4">
                                    {childExams.map((res, i) => (
                                        <div key={i} className="border border-gray-200 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition">
                                            <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                                                <h4 className="font-bold text-lg text-slate-800">{res.examId?.title || "Imtihon"}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${res.passed ? 'bg-green-500' : 'bg-red-500'}`}>{res.passed ? "MUVAFFAQIYATLI" : "YIQILDI"}</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 text-center">
                                                <div className="bg-white p-2 rounded border border-gray-100"><p className="text-[10px] text-gray-400 font-bold uppercase">Joriy</p><p className="font-bold text-slate-700">{res.dailyScore}</p></div>
                                                <div className="bg-white p-2 rounded border border-gray-100"><p className="text-[10px] text-gray-400 font-bold uppercase">Nazariy</p><p className="font-bold text-slate-700">{res.theoryScore}</p></div>
                                                <div className="bg-white p-2 rounded border border-gray-100"><p className="text-[10px] text-gray-400 font-bold uppercase">Amaliy</p><p className="font-bold text-slate-700">{res.practicalScore}</p></div>
                                                <div className="bg-indigo-50 p-2 rounded border border-indigo-100"><p className="text-[10px] text-indigo-400 font-bold uppercase">Jami</p><p className="font-bold text-indigo-700 text-lg">{res.finalPercentage}%</p></div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-3 text-right">{new Date(res.date).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            }
                        </motion.div>
                    )}

                    {/* TO'LOVLAR */}
                    {activeTab === 'payments' && (
                        <motion.div key="payments" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2"><FaMoneyBillWave className="text-green-500"/> To'lov Tarixi</h3>
                            {(!child.payments || child.payments.length === 0) ? <div className="text-center py-10 text-gray-400"><FaMoneyBillWave className="text-4xl mx-auto mb-2 opacity-30"/><p>To'lovlar tarixi bo'sh.</p></div> : 
                                <div className="space-y-2">
                                    {child.payments.slice().reverse().map((pay, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition">
                                            <div>
                                                <p className="font-bold text-slate-800">{pay.month}</p>
                                                <p className="text-xs text-gray-500">{new Date(pay.date).toLocaleDateString()} • {pay.comment || "Izohsiz"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-indigo-600 text-lg">{pay.amount?.toLocaleString()} so'm</p>
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Tushdi</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
          {[
             { id: 'home', icon: FaUserGraduate, label: "Farzandim" },
             { id: 'grades', icon: FaStar, label: "Baholar" },
             { id: 'exams', icon: FaClipboardList, label: "Imtihon" },
             { id: 'payments', icon: FaMoneyBillWave, label: "To'lov" },
          ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-2 rounded-lg transition ${activeTab === tab.id ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
                  <tab.icon className="text-xl"/> <span className="text-[9px] font-bold mt-1">{tab.label}</span>
              </button>
          ))}
          
           {/* MOBILE NOTIFICATION BUTTON */}
           <button onClick={handleOpenNotifications} className="flex flex-col items-center p-2 rounded-lg transition text-gray-400 relative">
                <FaBell className="text-xl"/> 
                <span className="text-[9px] font-bold mt-1">Xabar</span>
                {(!isPaidThisMonth || hasNewMessages) && <span className="absolute top-2 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
           </button>
      </div>
    </div>
  );
}