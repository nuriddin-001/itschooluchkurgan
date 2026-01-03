import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useData } from '../../context/DataProvider';
import { useNavigate } from 'react-router-dom';
import { 
    FaSignOutAlt, FaUserCircle, FaMoneyBillWave, FaCalendarCheck, 
    FaClipboardList, FaCheckCircle, FaTimesCircle, FaUserGraduate, 
    FaHome, FaAngleRight, FaClock, FaStar, FaComment, FaCheckDouble, 
    FaBell, FaUsers, FaPaperPlane, FaPaperclip, FaFileAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// --- VAQT HISOBLASH ---
const getTimePerQuestion = (courseName) => {
    if (!courseName) return 60;
    const name = courseName.toLowerCase();
    if (name.includes('html') || name.includes('css')) return 30; 
    if (name.includes('js') || name.includes('javascript')) return 45; 
    if (name.includes('react')) return 60; 
    return 60; 
};

// --- ISMDAN RANK OLISH (AVATAR UCHUN) ---
const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export default function StudentDashboard() {
  const { user, logout } = useData();
  const navigate = useNavigate();
  
  // STATE
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [myGroup, setMyGroup] = useState(null);
  const [myExamResults, setMyExamResults] = useState([]);
  
  // NOTIFICATIONS
  const [notifications, setNotifications] = useState([]); 
  const [showNotifications, setShowNotifications] = useState(false); 
  const [hasNewMessages, setHasNewMessages] = useState(false);
  
  // CHAT STATE
  const [chatMessage, setChatMessage] = useState("");
  const [chatFile, setChatFile] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // EXAM STATE
  const [activeExam, setActiveExam] = useState(null); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(null);

  // RESULT MODAL
  const [showResultModal, setShowResultModal] = useState(false);
  const [examScore, setExamScore] = useState(0);

  // --- DATA LOADING ---
  const refreshData = async () => {
      if (user) {
        try {
            const userId = user._id || user.id;
            const [groupsRes, resultsRes, examsRes, meRes, notifRes] = await Promise.all([
                axios.get('http://localhost:5000/api/groups'),
                axios.get('http://localhost:5000/api/exams/results'),
                axios.get('http://localhost:5000/api/exams'),
                axios.get(`http://localhost:5000/api/users`),
                axios.get(`http://localhost:5000/api/notifications/${userId}`)
            ]);

            const group = groupsRes.data.find(g => g.students.some(s => s._id === userId));
            setMyGroup(group);

            const myRes = resultsRes.data.filter(r => r.studentId._id === userId);
            setMyExamResults(myRes);

            setNotifications(notifRes.data);
            const serverCount = notifRes.data.length;
            const localCount = parseInt(localStorage.getItem(`read_notif_count_${userId}`) || '0');
            if (serverCount > localCount) setHasNewMessages(true);

            const currentUser = meRes.data.find(u => u._id === userId);
            if (currentUser?.examPermission?.allowed && currentUser?.examPermission?.examId) {
                const exam = examsRes.data.find(e => e._id === currentUser.examPermission.examId);
                setActiveExam(exam);
            } else {
                setActiveExam(null);
            }
        } catch (error) {
            console.error("Xatolik:", error);
        } finally {
            setLoading(false);
        }
      }
  };

  useEffect(() => { refreshData(); }, [user]);

  // CHAT SCROLL
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [myGroup, activeTab]);

  // TIMER
  useEffect(() => {
    if (activeTab === 'taking_exam' && activeExam) {
        const timePerQ = getTimePerQuestion(activeExam.course);
        setTimeLeft(timePerQ);
    }
  }, [currentQuestionIndex, activeTab, activeExam]);

  useEffect(() => {
    if (activeTab === 'taking_exam' && timeLeft !== null && timeLeft > 0) {
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    } else if (activeTab === 'taking_exam' && timeLeft === 0) {
        handleNextQuestion();
    }
  }, [timeLeft, activeTab]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleOpenNotifications = () => {
      setShowNotifications(true);
      setHasNewMessages(false); 
      const userId = user._id || user.id;
      localStorage.setItem(`read_notif_count_${userId}`, notifications.length);
  };

  // --- CHAT FUNCTIONALITY ---
  const handleSendMessage = async (e) => {
      e.preventDefault();
      if ((!chatMessage.trim() && !chatFile) || !myGroup) return;

      const formData = new FormData();
      formData.append('sender', user.name); 
      formData.append('text', chatMessage);
      formData.append('time', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (chatFile) {
          formData.append('file', chatFile);
      }

      try {
          const res = await axios.post(`http://localhost:5000/api/groups/${myGroup._id}/message`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setMyGroup(res.data);
          setChatMessage("");
          setChatFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
          alert("Xabar yuborishda xatolik: " + (error.response?.data?.message || "Server xatosi"));
      }
  };

  // EXAM HANDLERS
  const handleAnswerSelect = (optionIndex) => { setUserAnswers({ ...userAnswers, [currentQuestionIndex]: optionIndex }); };

  const handleNextQuestion = () => {
      if (activeExam && currentQuestionIndex < activeExam.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
          if (timeLeft === 0) handleSubmitExam(true);
      }
  };

  const handleSubmitExam = async (isAuto = false) => {
      if (!isAuto && timeLeft > 0 && !window.confirm("Imtihonni yakunlaysizmi?")) return;
      const answersArray = activeExam.questions.map((_, idx) => userAnswers[idx] ?? -1);
      try {
          const res = await axios.post('http://localhost:5000/api/exams/submit-answers', { 
              userId: user._id, examId: activeExam._id, answers: answersArray 
          });
          setExamScore(res.data.theoryScore);
          setShowResultModal(true);
          setActiveExam(null);
          setTimeLeft(null);
          setCurrentQuestionIndex(0);
          setUserAnswers({});
          refreshData(); 
      } catch (error) { alert("Xatolik yuz berdi"); }
  };

  const closeResultModal = () => { setShowResultModal(false); setActiveTab('exams'); };

  if (!user || loading) return <div className="flex items-center justify-center h-screen text-indigo-600 font-bold bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mr-3"></div> Yuklanmoqda...</div>;

  const monthsUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const date = new Date();
  const currentMonthUz = `${monthsUz[date.getMonth()]} ${date.getFullYear()}`;
  const isPaidThisMonth = user.payments?.some(p => p.month === currentMonthUz);

  // --- IMTIHON EKRANI ---
  if (activeTab === 'taking_exam' && activeExam) {
      const question = activeExam.questions[currentQuestionIndex];
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
              <div className="bg-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50">
                  <h2 className="font-bold text-lg text-slate-800 truncate w-1/2">{activeExam.title}</h2>
                  <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1 font-mono font-bold text-xl ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}><FaClock/> {timeLeft || 0}s</div>
                      <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg font-bold text-sm">{currentQuestionIndex + 1} / {activeExam.questions.length}</div>
                  </div>
              </div>
              <div className="flex-1 p-6 pb-24 overflow-y-auto max-w-3xl mx-auto w-full">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">{currentQuestionIndex + 1}. {question.question}</h3>
                      <div className="space-y-3">
                          {question.options.map((opt, idx) => (
                              <button key={idx} onClick={() => handleAnswerSelect(idx)} className={`w-full p-4 rounded-xl text-left border-2 transition-all font-medium ${userAnswers[currentQuestionIndex] === idx ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}>
                                  <span className="font-bold mr-2 w-6 inline-block">{String.fromCharCode(65+idx)}.</span> {opt}
                              </button>
                          ))}
                      </div>
                  </div>
                  {activeExam.practicalTask && (
                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
                          <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><FaClipboardList/> Amaliy Vazifa</h4>
                          <p className="text-sm text-blue-900 mb-4">{activeExam.practicalTask.description}</p>
                          {activeExam.practicalTask.resourceLink && <a href={activeExam.practicalTask.resourceLink} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 inline-block">Faylni Yuklash</a>}
                      </div>
                  )}
              </div>
              <div className="fixed bottom-0 w-full bg-white p-4 border-t border-gray-200 flex justify-between items-center max-w-3xl mx-auto left-0 right-0">
                  <button onClick={() => { setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1)); setTimeLeft(getTimePerQuestion(activeExam.course)); }} disabled={currentQuestionIndex === 0} className="px-6 py-3 rounded-xl font-bold text-gray-500 disabled:opacity-50 hover:bg-gray-100">Ortga</button>
                  {currentQuestionIndex === activeExam.questions.length - 1 ? (
                      <button onClick={() => handleSubmitExam(false)} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transform active:scale-95 transition">Yakunlash</button>
                  ) : (
                      <button onClick={handleNextQuestion} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2 transform active:scale-95 transition">Keyingi <FaAngleRight/></button>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24 md:pb-0 relative">
      
      {/* RESULT MODAL */}
      <AnimatePresence>
          {showResultModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheckDouble className="text-4xl text-green-600"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Imtihon Yakunlandi!</h2>
                    <p className="text-gray-500 mb-6">Javoblaringiz muvaffaqiyatli yuborildi.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6"><p className="text-xs text-gray-400 font-bold uppercase mb-1">Dastlabki Natija (Nazariy)</p><p className="text-3xl font-black text-indigo-600">{examScore} <span className="text-lg text-gray-400 font-medium">/ 50</span></p></div>
                    <button onClick={closeResultModal} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Tushunarli</button>
                </motion.div>
            </div>
          )}
      </AnimatePresence>

      {/* NOTIFICATION MODAL */}
      <AnimatePresence>
        {showNotifications && (
            <div className="fixed inset-0 z-[100] flex justify-end bg-black/20 backdrop-blur-sm" onClick={() => setShowNotifications(false)}>
                <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring', stiffness: 300, damping: 30}} className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaBell className="text-indigo-600"/> Bildirishnomalar</h2><button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-red-500"><FaTimesCircle size={24}/></button></div>
                    <div className="space-y-4">
                        {!isPaidThisMonth && (<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"><h4 className="font-bold text-red-700">To'lov Eslatmasi!</h4><p className="text-sm text-red-600 mt-1">{currentMonthUz} oyi uchun to'lov qilinmagan.</p></div>)}
                        {notifications.length === 0 && isPaidThisMonth ? (<p className="text-center text-gray-400 mt-10">Yangi xabarlar yo'q.</p>) : (notifications.map((notif, i) => (<div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100"><div className="flex justify-between items-start mb-1"><h4 className="font-bold text-slate-800">{notif.title}</h4><span className="text-[10px] text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</span></div><p className="text-sm text-gray-600">{notif.message}</p></div>)))}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* DESKTOP NAVBAR */}
      <nav className="bg-indigo-600 text-white p-4 shadow-lg sticky top-0 z-40 hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-full"><FaUserGraduate className="text-xl"/></div><div><h1 className="text-lg font-bold leading-tight">{user.name}</h1><p className="text-xs text-indigo-200 uppercase">{user.course}</p></div></div>
            <div className="flex items-center gap-4">
                <button onClick={handleOpenNotifications} className="relative p-2 rounded-full hover:bg-white/20 transition"><FaBell size={20}/>{(!isPaidThisMonth || hasNewMessages) && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-indigo-600"></span>}</button>
                <button onClick={handleLogout} className="flex items-center gap-2 bg-indigo-800/50 px-3 py-1.5 rounded-lg hover:bg-indigo-800 transition text-sm font-bold border border-indigo-500"><FaSignOutAlt /> Chiqish</button>
            </div>
        </div>
      </nav>

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-indigo-600 text-white p-6 rounded-b-[30px] shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
              <div><p className="text-indigo-200 text-sm">Xush kelibsiz,</p><h1 className="text-2xl font-bold">{user.name}</h1><span className="inline-block bg-indigo-500/50 px-3 py-1 rounded-full text-xs mt-2 border border-indigo-400 font-bold">{user.course}</span></div>
              <div className="flex gap-2">
                  <button onClick={handleOpenNotifications} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition relative"><FaBell/>{(!isPaidThisMonth || hasNewMessages) && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-indigo-600"></span>}</button>
                  <button onClick={handleLogout} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"><FaSignOutAlt/></button>
              </div>
          </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        {/* DESKTOP MENU */}
        <div className="hidden md:flex justify-center mb-8 gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-fit mx-auto">
            {['home', 'group', 'grades', 'payments', 'attendance', 'exams'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {tab === 'home' && <><FaUserCircle/> Asosiy</>}
                    {tab === 'group' && <><FaUsers/> Guruhim</>}
                    {tab === 'grades' && <><FaStar/> Baholar</>}
                    {tab === 'payments' && <><FaMoneyBillWave/> To'lov</>}
                    {tab === 'attendance' && <><FaCalendarCheck/> Davomat</>}
                    {tab === 'exams' && <><FaClipboardList/> Imtihon</>}
                </button>
            ))}
        </div>

        <AnimatePresence mode="wait">
            {/* 1. HOME TAB */}
            {activeTab === 'home' && (
                <motion.div key="home" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 text-6xl ${user.status === 'active' ? 'text-green-500' : 'text-red-500'}`}><FaUserGraduate/></div>
                        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Mening Holatim</h2>
                        <div className="mt-2"><span className={`px-3 py-1 rounded-full text-sm font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status === 'active' ? "O'QIMOQDA" : "CHIQIB KETGAN"}</span></div>
                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div><p className="text-gray-400 text-xs">Kurs</p><p className="font-bold text-slate-800">{user.course}</p></div>
                            <div><p className="text-gray-400 text-xs">Rejim</p><p className="font-bold text-slate-800">{user.schedule === 'daily' ? 'Har kuni' : 'Kun ora'}</p></div>
                        </div>
                    </div>
                    <div className={`p-6 rounded-2xl shadow-lg border relative overflow-hidden text-white ${isPaidThisMonth ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-600' : 'bg-gradient-to-br from-red-500 to-pink-600 border-red-600'}`}>
                        <div className="absolute -bottom-4 -right-4 opacity-20 text-8xl"><FaMoneyBillWave/></div>
                        <h2 className="text-white/80 text-xs font-bold uppercase tracking-wider">{currentMonthUz} to'lovi</h2>
                        <h3 className="text-3xl font-bold mt-2 flex items-center gap-2">{isPaidThisMonth ? <><FaCheckCircle/> TO'LANGAN</> : <><FaTimesCircle/> QARZ</>}</h3>
                    </div>
                </motion.div>
            )}

            {/* 2. GROUP CHAT TAB */}
            {activeTab === 'group' && (
                <motion.div key="group" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[70vh]">
                     {!myGroup ? <div className="flex-1 flex flex-col items-center justify-center text-gray-400"><FaUsers className="text-6xl opacity-20 mb-4"/><p>Siz guruhga biriktirilmagansiz.</p></div> : 
                        <>
                            <div className="p-4 bg-slate-900 text-white flex justify-between items-center shadow-md">
                                <div><h3 className="font-bold text-lg flex items-center gap-2"><FaUsers/> {myGroup.name}</h3><p className="text-xs text-slate-400">{myGroup.students.length} ishtirokchi</p></div>
                                <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{myGroup.time}</div>
                            </div>
                            
                            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                                {myGroup.messages.map((msg, idx) => {
                                    const isMe = msg.sender === user.name;
                                    const senderColor = stringToColor(msg.sender); // Rang generatsiyasi
                                    const senderInitial = msg.sender.charAt(0).toUpperCase();

                                    return (
                                        <div key={idx} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {/* Boshqalar uchun Avatar (Chapda) */}
                                            {!isMe && (
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1 shadow-sm" style={{ backgroundColor: senderColor }}>
                                                    {senderInitial}
                                                </div>
                                            )}

                                            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative group ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-gray-100 rounded-bl-none'}`}>
                                                {!isMe && <p className="text-[10px] font-bold mb-1 opacity-70" style={{ color: senderColor }}>{msg.sender}</p>}
                                                {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                                                
                                                {msg.file && (
                                                    <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 ${isMe ? 'bg-indigo-700/50' : 'bg-gray-100'}`}>
                                                        <div className="p-2 bg-white/20 rounded-full"><FaFileAlt/></div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs truncate font-bold">{msg.fileName || "Fayl"}</p>
                                                            <a href={`http://localhost:5000${msg.file}`} target="_blank" rel="noopener noreferrer" className="text-[10px] underline opacity-80 hover:opacity-100">Yuklab olish</a>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className={`text-[9px] text-right mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>{msg.time}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={chatEndRef}/>
                            </div>

                            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                                <input type="file" ref={fileInputRef} className="hidden" onChange={e => setChatFile(e.target.files[0])} />
                                <button type="button" onClick={() => fileInputRef.current.click()} className={`p-3 rounded-full transition ${chatFile ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-100'}`}><FaPaperclip/></button>
                                <div className="flex-1 relative">
                                    {chatFile && (
                                        <div className="absolute -top-10 left-0 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full shadow flex items-center gap-2">
                                            <FaFileAlt/> {chatFile.name} <button type="button" onClick={()=>{setChatFile(null); fileInputRef.current.value=""}}><FaTimesCircle/></button>
                                        </div>
                                    )}
                                    <input type="text" placeholder="Xabar yozish..." className="w-full bg-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={chatMessage} onChange={e => setChatMessage(e.target.value)}/>
                                </div>
                                <button type="submit" disabled={!chatMessage.trim() && !chatFile} className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"><FaPaperPlane/></button>
                            </form>
                        </>
                     }
                </motion.div>
            )}

            {/* 3. GRADES TAB */}
            {activeTab === 'grades' && (
                <motion.div key="grades" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2"><FaStar className="text-yellow-500"/> Mening Baholarim</div>
                        {!myGroup || !myGroup.grades ? <div className="text-center py-12 text-gray-400"><FaStar className="text-4xl mx-auto mb-2 opacity-30"/><p>Baholar yo'q.</p></div> : 
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                {myGroup.grades.slice().reverse().map((day, i) => {
                                    const record = day.records.find(r => r.studentId === (user._id || user.id));
                                    if (!record) return null;
                                    return (
                                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition flex items-center justify-between">
                                            <div><p className="text-xs text-gray-400 font-bold uppercase mb-1">{day.date}</p>{record.comment ? <p className="text-xs text-slate-500 flex items-center gap-1"><FaComment/> {record.comment}</p> : <span className="text-[10px] text-gray-300">Izohsiz</span>}</div>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${record.score >= 5 ? 'bg-green-500' : record.score === 4 ? 'bg-blue-500' : record.score === 3 ? 'bg-yellow-400' : 'bg-red-500'}`}>{record.score}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                    </div>
                </motion.div>
            )}

            {/* 4. PAYMENTS TAB */}
            {activeTab === 'payments' && (
                <motion.div key="payments" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2"><FaMoneyBillWave className="text-green-500"/> To'lovlar Tarixi</div>
                        {(!user.payments || user.payments.length === 0) ? <div className="text-center py-12 text-gray-400"><FaMoneyBillWave className="text-4xl mx-auto mb-2 opacity-30"/><p>Hozircha to'lovlar yo'q.</p></div> : 
                            user.payments.slice().reverse().map((pay, i) => (
                                <div key={i} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-gray-50 transition">
                                    <div><p className="font-bold text-slate-800">{pay.month}</p><p className="text-xs text-gray-500">{new Date(pay.date).toLocaleDateString()} • {pay.comment || "Izohsiz"}</p></div>
                                    <div className="text-right"><p className="font-bold text-indigo-600">{pay.amount?.toLocaleString()} so'm</p><span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Muvaffaqiyatli</span></div>
                                </div>
                            ))
                        }
                     </div>
                </motion.div>
            )}

            {/* 5. ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
                <motion.div key="attendance" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2"><FaCalendarCheck className="text-blue-500"/> Davomat</div>
                        {!myGroup ? <div className="text-center py-12 text-gray-400"><FaCalendarCheck className="text-4xl mx-auto mb-2 opacity-30"/><p>Guruhga biriktirilmagansiz.</p></div> : 
                            myGroup.attendance.slice().reverse().map((day, i) => {
                                const myRecord = day.records.find(r => r.studentId === (user._id || user.id));
                                if (!myRecord) return null;
                                return (
                                    <div key={i} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-gray-50 transition">
                                        <div className="font-bold text-slate-700">{day.date}</div>
                                        <div>
                                            {myRecord.status === 'present' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">BOR</span>}
                                            {myRecord.status === 'absent' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">YO'Q</span>}
                                            {myRecord.status === 'late' && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">KECH</span>}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </motion.div>
            )}

            {/* 6. EXAMS TAB */}
            {activeTab === 'exams' && (
                <motion.div key="exams" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                    {activeExam && (
                        <div className="mb-6 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg text-white text-center relative overflow-hidden">
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                            <h3 className="text-xl font-bold mb-2 relative z-10">Imtihon Mavjud!</h3>
                            <p className="mb-4 text-white/80 relative z-10">{activeExam.title} ({activeExam.course})</p>
                            <button onClick={() => setActiveTab('taking_exam')} className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition relative z-10 animate-pulse">
                                Imtihonni Boshlash
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                         <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2"><FaClipboardList className="text-purple-500"/> Natijalarim</div>
                         {myExamResults.length === 0 ? <div className="text-center py-12 text-gray-400"><FaClipboardList className="text-4xl mx-auto mb-2 opacity-30"/><p>Natijalar yo'q.</p></div> : 
                             myExamResults.slice().reverse().map((res, i) => (
                                 <div key={i} className="p-4 border-b last:border-0 hover:bg-gray-50 transition">
                                     <div className="flex justify-between items-start mb-3">
                                         <div>
                                            <h4 className="font-bold text-slate-800">{res.examId?.title || "Imtihon"}</h4>
                                            <p className="text-[10px] text-gray-400">{new Date(res.date).toLocaleDateString()}</p>
                                         </div>
                                         <span className={`text-xs font-bold px-3 py-1 rounded-full ${res.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{res.passed ? "O'TDI" : "YIQILDI"}</span>
                                     </div>
                                     <div className="grid grid-cols-4 gap-2 text-center text-xs bg-gray-100 p-3 rounded-xl">
                                         <div><span className="block text-gray-400 uppercase font-bold text-[10px]">Joriy</span><b className="text-slate-700">{res.dailyScore}</b></div>
                                         <div><span className="block text-gray-400 uppercase font-bold text-[10px]">Nazariy</span><b className="text-slate-700">{res.theoryScore}</b></div>
                                         <div><span className="block text-gray-400 uppercase font-bold text-[10px]">Amaliy</span><b className="text-slate-700">{res.practicalScore}</b></div>
                                         <div className="border-l border-gray-300 pl-2"><span className="block text-gray-400 uppercase font-bold text-[10px]">Jami</span><b className="text-indigo-600 text-sm">{res.finalPercentage}%</b></div>
                                     </div>
                                 </div>
                             ))
                         }
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
          {[
             { id: 'home', icon: FaHome, label: 'Asosiy' },
             { id: 'group', icon: FaUsers, label: 'Guruhim' }, // Guruhim qo'shildi
             { id: 'grades', icon: FaStar, label: 'Baholar' },
             { id: 'payments', icon: FaMoneyBillWave, label: "To'lov" },
             { id: 'attendance', icon: FaCalendarCheck, label: 'Davomat' },
             { id: 'exams', icon: FaClipboardList, label: 'Imtihon' },
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