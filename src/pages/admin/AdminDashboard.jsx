import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserGraduate, FaClipboardList, FaBars, FaTimes, FaPlus, 
  FaUsers, FaPaperPlane, FaImage, FaEllipsisV, FaTimesCircle, FaClock, 
  FaCalendarCheck, FaCheck, FaBan, FaRegStickyNote, FaBolt, FaRunning, 
  FaTable, FaList, FaCheckCircle, FaExclamationCircle, FaHistory, FaFileAlt, FaCalendarAlt,
  FaHome, FaBullhorn, FaUserTie, FaLayerGroup, FaPen, FaPhone, FaFilter, FaMoneyBillWave, 
  FaBell, FaStar, FaDownload, FaCommentDollar, FaChartLine, FaChartPie, FaWallet, FaArrowUp, 
  FaLock, FaUnlock, FaTrash, FaCalculator, FaKey, FaSearch, FaPaperclip, FaLink, FaHourglassHalf, FaTrophy
} from 'react-icons/fa';
import { BiLogOut, BiTimeFive } from 'react-icons/bi';
import { MdOutlineSecurity, MdEdit, MdTimer } from 'react-icons/md';
import { useData } from '../../context/DataProvider';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// --- CONSTANTS ---
const MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

const COURSE_OPTIONS = [
    "HTML & CSS",
    "CSS Advanced",
    "JS Beginner",
    "JS Advanced",
    "React Beginner",
    "React Advanced"
];

// --- HELPERS ---
const getTimePerQuestion = (courseName) => {
    if (!courseName) return 60;
    const name = courseName.toLowerCase();
    if (name.includes('html') || name.includes('css')) return 30; 
    if (name.includes('js') || name.includes('javascript')) return 45; 
    if (name.includes('react')) return 60; 
    return 60; 
};

const formatTotalTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes} daq ${secs > 0 ? secs + ' s' : ''}`;
};

const generatePaymentMonths = () => {
    const startYear = 2025; 
    const currentYear = new Date().getFullYear() + 1; 
    let list = []; 
    for (let year = startYear; year <= currentYear; year++) { 
        MONTHS_UZ.forEach(month => { list.push(`${month} ${year}`); }); 
    }
    return list;
};
const paymentMonthsList = generatePaymentMonths();

const getCurrentMonthName = () => { 
    const date = new Date(); 
    return `${MONTHS_UZ[date.getMonth()]} ${date.getFullYear()}`; 
};

const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('.');
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    return dateString;
};

const formatInputToDisplay = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    return dateString;
};

// --- AVATAR COLOR GENERATOR ---
const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // DATA
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]); 
  const [exams, setExams] = useState([]); 
  const [examResults, setExamResults] = useState([]); 
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [stats, setStats] = useState({ students: 0, parents: 0, groups: 0 });
  const [financeStats, setFinanceStats] = useState({ monthlyRevenue: {}, totalRevenue: 0 });

  // FILTERS
  const [filterDays, setFilterDays] = useState('all'); 
  const [userStatusFilter, setUserStatusFilter] = useState('active'); 
  const [paymentFilter, setPaymentFilter] = useState('all'); 
  const [paymentMonth, setPaymentMonth] = useState(getCurrentMonthName());
  const [archiveMonth, setArchiveMonth] = useState(getCurrentMonthName());

  // CHAT
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '', target: 'all' });
  const [chatMessage, setChatMessage] = useState("");
  const [chatFile, setChatFile] = useState(null);
  const fileInputRef = useRef(null); 
  const messagesEndRef = useRef(null);
  
  // ATTENDANCE & GRADES
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [attendanceMap, setAttendanceMap] = useState({}); 
  const [attendanceView, setAttendanceView] = useState('daily'); 
  const [gradeDate, setGradeDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [gradeMap, setGradeMap] = useState({}); 
  const [gradeView, setGradeView] = useState('daily');

  // EXAM GRADING
  const [gradingExamId, setGradingExamId] = useState("");
  const [gradingGroupId, setGradingGroupId] = useState("");
  const [gradingStudentId, setGradingStudentId] = useState("");
  const [calculatedDailyScore, setCalculatedDailyScore] = useState(0); 
  const [theoryScore, setTheoryScore] = useState(0); 
  const [practicalScore, setPracticalScore] = useState(0); 
  const [studentPracticalFile, setStudentPracticalFile] = useState("");

  // MODALS
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentUser, setSelectedPaymentUser] = useState(null);
  const [paymentComment, setPaymentComment] = useState("");
  
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null); 
  const [examFormData, setExamFormData] = useState({ 
      title: "", 
      course: COURSE_OPTIONS[0], 
      practicalDesc: "", 
      practicalLink: "", 
      questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }] 
  });

  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionExam, setPermissionExam] = useState(null);
  
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null); 
  const [groupFormData, setGroupFormData] = useState({ name: '', time: '08:00 - 10:00', days: 'odd_days', selectedStudents: [] });
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [userFormData, setUserFormData] = useState({ name: '', phone: '', password: '', role: 'student', schedule: 'odd_days', course: COURSE_OPTIONS[0], parentId: '', status: 'active' });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' }); 
  const { logout } = useData();
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => { setToast({ show: true, message, type }); setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000); };

  // DATA FETCHING
  const fetchData = async () => {
      try {
          const [usersRes, groupsRes, examsRes, resultsRes, statsRes, financeRes] = await Promise.all([
              axios.get('http://localhost:5000/api/users'),
              axios.get('http://localhost:5000/api/groups'),
              axios.get('http://localhost:5000/api/exams'),
              axios.get('http://localhost:5000/api/exams/results'),
              axios.get('http://localhost:5000/api/dashboard/stats'),
              axios.get('http://localhost:5000/api/dashboard/finance')
          ]);
          setUsers(usersRes.data); setGroups(groupsRes.data); setExams(examsRes.data); setExamResults(resultsRes.data); setStats(statsRes.data); setFinanceStats(financeRes.data);
      } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 5000); return () => clearInterval(interval); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedGroup, selectedGroup?.messages]);

  // HELPERS
  const getCoursePrice = (course, schedule) => schedule === 'daily' ? (course === 'Foundation' ? 650000 : 880000) : (course === 'Foundation' ? 330000 : 440000);
  const filteredGroups = groups.filter(group => { if (filterDays === 'all') return true; return group.days === filterDays; });
  const getFilteredUsers = () => users.filter(u => (userStatusFilter === 'all' ? true : (u.status || 'active') === userStatusFilter));
  const getPaymentUsers = () => users.filter(u => u.role === 'student' && (u.status || 'active') === 'active' && (paymentFilter === 'paid' ? u.payments?.some(p => p.month === paymentMonth) : paymentFilter === 'unpaid' ? !u.payments?.some(p => p.month === paymentMonth) : true));
  const getChartData = () => { const barData = paymentMonthsList.map(month => ({ name: month.split(' ')[0], tushum: financeStats.monthlyRevenue[month] || 0 })); const pieDataMap = {}; users.forEach(u => { if (u.role === 'student' && u.payments) u.payments.forEach(p => { if (!pieDataMap[u.course]) pieDataMap[u.course] = 0; pieDataMap[u.course] += p.amount; }); }); const pieData = Object.keys(pieDataMap).map(key => ({ name: key || "Boshqa", value: pieDataMap[key] })); let maxRev = 0, maxMonth = "-"; Object.entries(financeStats.monthlyRevenue).forEach(([m, val]) => { if(val > maxRev) { maxRev = val; maxMonth = m; } }); return { barData, pieData, totalRev: financeStats.totalRevenue, maxRev, maxMonth }; };
  const { barData, pieData } = getChartData();

  const getFilteredExamResults = () => {
      return examResults.filter(res => {
          const d = new Date(res.date);
          const resMonth = `${MONTHS_UZ[d.getMonth()]} ${d.getFullYear()}`;
          return resMonth === archiveMonth;
      });
  };

  // HANDLERS
  const handlePaymentSubmit = async () => { if (!selectedPaymentUser) return; const price = getCoursePrice(selectedPaymentUser.course, selectedPaymentUser.schedule); try { await axios.post('http://localhost:5000/api/payments/pay', { userId: selectedPaymentUser._id, amount: price, month: paymentMonth, comment: paymentComment || "Izohsiz" }); showToast("To'lov qabul qilindi!", "success"); fetchData(); setIsPaymentModalOpen(false); } catch (e) { showToast("Xatolik", "error"); } };
  const downloadExcel = () => { const data = getPaymentUsers().map(s => ({ "F.I.SH": s.name, "Telefon": s.phone, "Kurs": s.course, "Oy": paymentMonth, "Summa": getCoursePrice(s.course, s.schedule), "Status": s.payments?.some(p => p.month === paymentMonth) ? "TO'LANGAN" : "QARZ" })); const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "To'lovlar"); XLSX.writeFile(wb, `Tolovlar_${paymentMonth}.xlsx`); showToast("Yuklandi", "success"); };
  const handlePaymentReminder = async (user) => { if(!window.confirm("Eslatma?")) return; try { await axios.post('http://localhost:5000/api/dashboard/broadcast', { title: "To'lov!", message: `${paymentMonth} to'lovi`, target: 'individual', userId: user._id }); showToast("Yuborildi", "success"); } catch (e) { showToast("Xato", "error"); } };
  
  // EXAM LOGIC
  const openExamModal = (exam = null) => { 
      setEditingExam(exam); 
      setExamFormData(exam ? { 
          title: exam.title, 
          course: exam.course, 
          type: exam.type, 
          practicalDesc: exam.practicalTask?.description, 
          practicalLink: exam.practicalTask?.resourceLink, 
          questions: exam.questions 
      } : { 
          title: "", 
          course: COURSE_OPTIONS[0], 
          type: "regular", 
          practicalDesc: "", 
          practicalLink: "", 
          questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }] 
      }); 
      setIsExamModalOpen(true); 
  };

  const handleSaveExam = async () => { try { const payload = { ...examFormData, practicalTask: { description: examFormData.practicalDesc, resourceLink: examFormData.practicalLink } }; editingExam ? await axios.put(`http://localhost:5000/api/exams/${editingExam._id}`, payload) : await axios.post('http://localhost:5000/api/exams', payload); showToast(editingExam ? "Yangilandi" : "Yaratildi", "success"); setIsExamModalOpen(false); fetchData(); } catch (e) { showToast("Xato", "error"); } };
  const handleDeleteExam = async (id) => { if (window.confirm("O'chirilsinmi?")) try { await axios.delete(`http://localhost:5000/api/exams/${id}`); showToast("O'chirildi", "success"); fetchData(); } catch (e) { showToast("Xato", "error"); } };
  const openPermissionModal = (exam) => { setPermissionExam(exam); setIsPermissionModalOpen(true); };
  const toggleExamPermission = async (userId, examId, currentStatus) => { try { await axios.post('http://localhost:5000/api/users/permit-exam', { userId, examId, allow: !currentStatus }); showToast(!currentStatus ? "Ochildi" : "Yopildi", "success"); fetchData(); } catch (e) { showToast("Xato", "error"); } };
  
  const handleSelectStudentForGrading = (studentId) => { 
      setGradingStudentId(studentId); 
      if (!gradingGroupId) return; 
      const group = groups.find(g => g._id === gradingGroupId); 
      let totalDaily = 0; 
      if (group?.grades) {
        group.grades.forEach(day => { const rec = day.records.find(r => r.studentId === studentId); if (rec) totalDaily += (rec.score || 0); }); 
      }
      setCalculatedDailyScore(totalDaily > 60 ? 60 : totalDaily);
      if (gradingExamId) {
          const result = examResults.find(r => r.studentId._id === studentId && r.examId._id === gradingExamId);
          if (result) { setTheoryScore(result.theoryScore || 0); setPracticalScore(result.practicalScore || 0); setStudentPracticalFile(result.practicalFile || ""); } else { setTheoryScore(0); setPracticalScore(0); setStudentPracticalFile(""); }
      }
  };

  const handleSaveResult = async () => { 
      if (!gradingExamId || !gradingStudentId) return showToast("Talaba va Imtihonni tanlang", "error"); 
      try { 
          await axios.post('http://localhost:5000/api/exams/results', { studentId: gradingStudentId, examId: gradingExamId, dailyScore: calculatedDailyScore, theoryScore: parseInt(theoryScore), practicalScore: parseInt(practicalScore) }); 
          showToast("Natija saqlandi!", "success"); 
          fetchData(); 
      } catch (e) { showToast("Xato", "error"); } 
  };
  
  const downloadExamResults = () => { 
      const filtered = getFilteredExamResults();
      const data = filtered.map(r => ({ "O'quvchi": r.studentId?.name, "Imtihon": r.examId?.title, "Joriy (60)": r.dailyScore, "Nazariy (50)": r.theoryScore, "Amaliy (50)": r.practicalScore, "Jami (160)": r.totalScore, "Foiz (100%)": `${r.finalPercentage}%`, "Natija": r.passed ? "O'TDI" : "YIQILDI", "Sana": new Date(r.date).toLocaleDateString() })); 
      const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Natijalar"); XLSX.writeFile(wb, `Natijalar_${archiveMonth}.xlsx`); showToast("Yuklandi", "success"); 
  };
  
  // GENERIC HANDLERS
  const openPaymentModal = (user) => { setSelectedPaymentUser(user); setPaymentComment(""); setIsPaymentModalOpen(true); };
  const handleSendBroadcast = async (e) => { e.preventDefault(); if(!broadcastData.title) return; try { await axios.post('http://localhost:5000/api/dashboard/broadcast', broadcastData); showToast("Yuborildi", "success"); setBroadcastData({title:'', message:'', target:'all'}); } catch(e) { showToast("Xato", "error"); } };
  const handleLogout = () => { logout(); navigate('/login'); };
  
  const openAttendance = (group) => { setSelectedGroup(group); setAttendanceView('daily'); loadDailyAttendance(group, attendanceDate); };
  const loadDailyAttendance = (group, date) => { const displayDate = formatInputToDisplay(date); const todayRecord = group.attendance?.find(a => a.date === displayDate); const newMap = {}; group.students.forEach(s => { const r = todayRecord?.records.find(rec => rec.studentId === s._id); newMap[s._id] = { status: r ? r.status : 'present', reason: r ? r.reason : '' }; }); setAttendanceMap(newMap); };
  useEffect(() => { if(selectedGroup && activeTab === 'attendance' && attendanceView === 'daily') { loadDailyAttendance(selectedGroup, attendanceDate); } }, [attendanceDate, selectedGroup, activeTab, attendanceView]);
  const handleStatusChange = (id, s) => setAttendanceMap(prev => ({ ...prev, [id]: { ...prev[id], status: s } }));
  const handleReasonChange = (id, r) => setAttendanceMap(prev => ({ ...prev, [id]: { ...prev[id], reason: r } }));
  const markAllPresent = () => { const newMap = {}; selectedGroup.students.forEach(s => { newMap[s._id] = { status: 'present', reason: '' }; }); setAttendanceMap(newMap); };
  const saveAttendance = async () => { if (!selectedGroup) return; const displayDate = formatInputToDisplay(attendanceDate); const records = Object.keys(attendanceMap).map(id => ({ studentId: id, ...attendanceMap[id] })); try { await axios.post(`http://localhost:5000/api/groups/${selectedGroup._id}/attendance`, { date: displayDate, records }); showToast("Davomat saqlandi!", "success"); fetchData(); } catch (e) { showToast("Xatolik", "error"); } };

  const openGrades = (group) => { setSelectedGroup(group); setGradeView('daily'); loadDailyGrades(group, gradeDate); };
  const loadDailyGrades = (group, date) => { const displayDate = formatInputToDisplay(date); const r = group.grades?.find(g => g.date === displayDate); const m = {}; group.students.forEach(s => { const u = r?.records.find(rec => rec.studentId === s._id); m[s._id] = { score: u ? u.score : 0, comment: u ? u.comment : '' }; }); setGradeMap(m); };
  useEffect(() => { if(selectedGroup && activeTab === 'grades' && gradeView === 'daily') { loadDailyGrades(selectedGroup, gradeDate); } }, [gradeDate, selectedGroup, activeTab, gradeView]);
  const handleScoreChange = (id, v) => setGradeMap(prev => ({ ...prev, [id]: { ...prev[id], score: parseInt(v) || 0 } }));
  const handleCommentChange = (id, v) => setGradeMap(prev => ({ ...prev, [id]: { ...prev[id], comment: v } }));
  const saveGrades = async () => { if (!selectedGroup) return; const displayDate = formatInputToDisplay(gradeDate); const records = Object.keys(gradeMap).map(id => ({ studentId: id, ...gradeMap[id] })); try { await axios.post(`http://localhost:5000/api/groups/${selectedGroup._id}/grades`, { date: displayDate, records }); showToast("Baholar saqlandi!", "success"); fetchData(); } catch (e) { showToast("Xatolik", "error"); } };

  const handleSendMessage = async (e) => { 
      e.preventDefault(); 
      if ((!chatMessage.trim() && !chatFile) || !selectedGroup) return; 
      const fd = new FormData(); 
      fd.append('sender', 'Admin'); 
      fd.append('text', chatMessage); 
      fd.append('time', new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})); 
      if (chatFile) fd.append('file', chatFile); 
      try { 
          const res = await axios.post(`http://localhost:5000/api/groups/${selectedGroup._id}/message`, fd); 
          setSelectedGroup(res.data); 
          setChatMessage(""); 
          setChatFile(null); 
          if(fileInputRef.current) fileInputRef.current.value = ""; 
      } catch(e) { showToast(e.response?.data?.message || "Xato", "error"); } 
  };

  const openCreateModal = () => { setEditingGroup(null); setGroupFormData({ name: '', time: '08:00 - 10:00', days: 'odd_days', selectedStudents: [] }); setIsGroupModalOpen(true); };
  const openEditModal = (e, group) => { e.stopPropagation(); setEditingGroup(group); setGroupFormData({ name: group.name, time: group.time, days: group.days, selectedStudents: group.students.map(s => s._id) }); setIsGroupModalOpen(true); };
  const handleSaveGroup = async (e) => { e.preventDefault(); try { editingGroup ? await axios.put(`http://localhost:5000/api/groups/${editingGroup._id}`, groupFormData) : await axios.post('http://localhost:5000/api/groups', groupFormData); showToast("Saqlandi", "success"); setIsGroupModalOpen(false); fetchData(); } catch(e) { showToast("Xato", "error"); } };
  const openCreateUserModal = () => { setEditingUser(null); setUserFormData({ name: '', phone: '', password: '', role: 'student', schedule: 'odd_days', course: COURSE_OPTIONS[0], parentId: '', status: 'active' }); setIsUserModalOpen(true); };
  const openEditUserModal = (user) => { setEditingUser(user); setUserFormData({ name: user.name, phone: user.phone, password: '', role: user.role, schedule: user.schedule || 'odd_days', course: user.course || COURSE_OPTIONS[0], parentId: user.parentId || '', status: user.status || 'active' }); setIsUserModalOpen(true); };
  const handleSaveUser = async (e) => { e.preventDefault(); try { editingUser ? await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, userFormData) : await axios.post('http://localhost:5000/api/register', userFormData); showToast("Saqlandi", "success"); setIsUserModalOpen(false); fetchData(); } catch(e) { showToast("Xato", "error"); } };

  const pageVariants = { initial: { opacity: 0, y: 10 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -10 } };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans relative">
      <AnimatePresence>{toast.show && (<motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 50, x: "-50%" }} className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl font-bold text-white ${toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'}`}>{toast.type === 'success' ? <FaCheck /> : <FaTimes />} <span>{toast.message}</span></motion.div>)}</AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-gray-100 transform transition-transform duration-300 ease-in-out border-r border-slate-800 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl flex flex-col justify-between`}>
        <div><div className="p-6 flex justify-between items-center border-b border-slate-800"><h2 className="text-2xl font-bold flex items-center gap-2 text-white"><MdOutlineSecurity className="text-indigo-500" /> Admin</h2><button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white"><FaTimes size={24} /></button></div>
        <nav className="mt-6 px-4 space-y-2">
            {[ {id:'dashboard',icon:FaHome,label:'Dashboard'}, {id:'revenue',icon:FaChartLine,label:'Kirim Hisobot'}, {id:'payments',icon:FaMoneyBillWave,label:"To'lovlar"}, {id:'groups',icon:FaClipboardList,label:'Guruhlar'}, {id:'attendance',icon:FaCalendarCheck,label:'Davomat'}, {id:'grades',icon:FaStar,label:'Baholar'}, {id:'exams',icon:FaPen,label:'Imtihonlar'}, {id:'users',icon:FaUserGraduate,label:'Foydalanuvchilar'} ].map(item => (
                <button key={item.id} onClick={() => {setActiveTab(item.id); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}><item.icon /> {item.label}</button>
            ))}
        </nav></div><div className="p-4 border-t border-slate-800 bg-slate-900"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 font-bold"><BiLogOut size={20} /> Chiqish</button></div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 md:ml-64 transition-all duration-300">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden sticky top-0 z-40"><h1 className="text-xl font-bold text-slate-800">Admin Panel</h1><button onClick={() => setSidebarOpen(true)} className="text-slate-800 hover:text-indigo-600"><FaBars size={24} /></button></header>
        <div className="p-6 md:p-10 w-full h-full"><AnimatePresence mode="wait">
            
            {activeTab === 'dashboard' && (<motion.div key="dashboard" initial="initial" animate="in" exit="out" variants={pageVariants}><h2 className="text-3xl font-bold text-slate-800 mb-8">Boshqaruv Paneli</h2><div className="grid md:grid-cols-4 gap-6 mb-10"><div className="bg-gradient-to-r from-green-600 to-green-500 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between"><div><p className="text-green-100 text-sm font-bold uppercase">Joriy Oy Tushumi</p><h3 className="text-2xl font-bold mt-1">{(financeStats.monthlyRevenue[getCurrentMonthName()] || 0).toLocaleString()} so'm</h3></div><div className="bg-white/20 p-4 rounded-xl text-3xl"><FaMoneyBillWave /></div></div><div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between"><div><p className="text-blue-100 text-sm font-bold uppercase">O'quvchilar</p><h3 className="text-3xl font-bold mt-1">{stats.students}</h3></div><div className="bg-white/20 p-4 rounded-xl text-3xl"><FaUserGraduate /></div></div><div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between"><div><p className="text-orange-100 text-sm font-bold uppercase">Ota-onalar</p><h3 className="text-3xl font-bold mt-1">{stats.parents}</h3></div><div className="bg-white/20 p-4 rounded-xl text-3xl"><FaUserTie /></div></div><div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between"><div><p className="text-emerald-100 text-sm font-bold uppercase">Guruhlar</p><h3 className="text-3xl font-bold mt-1">{stats.groups}</h3></div><div className="bg-white/20 p-4 rounded-xl text-3xl"><FaLayerGroup /></div></div></div><div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"><div className="flex items-center gap-3 mb-6 pb-4 border-b"><div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><FaBullhorn size={24} /></div><div><h3 className="text-xl font-bold text-slate-800">E'lon Yuborish</h3><p className="text-sm text-gray-500">Barcha foydalanuvchilarga xabar tarqating</p></div></div><form onSubmit={handleSendBroadcast} className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-gray-700 mb-1">Mavzu</label><input type="text" placeholder="Mavzu" className="w-full p-3 border rounded-lg" value={broadcastData.title} onChange={e => setBroadcastData({...broadcastData, title: e.target.value})} /></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Kimga?</label><select className="w-full p-3 border rounded-lg bg-white" value={broadcastData.target} onChange={e => setBroadcastData({...broadcastData, target: e.target.value})}><option value="all">Barchaga</option><option value="student">O'quvchilarga</option><option value="parent">Ota-onalarga</option></select></div></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Matn</label><textarea rows="4" placeholder="Xabar..." className="w-full p-3 border rounded-lg" value={broadcastData.message} onChange={e => setBroadcastData({...broadcastData, message: e.target.value})}></textarea></div><div className="flex justify-end"><button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg flex items-center gap-2"><FaPaperPlane /> Yuborish</button></div></form></div></motion.div>)}
            {activeTab === 'revenue' && (<motion.div key="revenue" initial="initial" animate="in" exit="out" variants={pageVariants}><div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-bold text-slate-800">Moliya & Kirimlar</h2><div className="bg-green-100 text-green-700 px-6 py-2 rounded-xl font-bold text-lg border border-green-200">Jami Tushum: {financeStats.totalRevenue.toLocaleString()} so'm</div></div><div className="grid md:grid-cols-2 gap-8 mb-10"><div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"><h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2"><FaChartLine className="text-indigo-500"/> Oylik Tushumlar</h3><div style={{width:'100%',height:300}}><ResponsiveContainer width="99%" height="100%" minWidth={0}><BarChart data={barData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} /><Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} /><Bar dataKey="tushum" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></div></div><div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"><h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2"><FaChartPie className="text-green-500"/> Kurslar Kesimida</h3><div style={{width:'100%',height:300}}><ResponsiveContainer width="99%" height="100%" minWidth={0}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /><Legend verticalAlign="bottom" height={36}/></PieChart></ResponsiveContainer></div></div></div><div className="bg-white rounded-xl shadow-sm border overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="p-4">Oy</th><th className="p-4 text-right">Tushum</th><th className="p-4 text-right">Holat</th></tr></thead><tbody>{paymentMonthsList.map((month, idx) => { const amount = financeStats.monthlyRevenue[month] || 0; return (<tr key={idx} className="border-b hover:bg-slate-50 last:border-0"><td className="p-4 font-bold text-slate-700">{month}</td><td className="p-4 text-right font-mono font-bold text-indigo-600">{amount.toLocaleString()} so'm</td><td className="p-4 text-right">{amount > 0 ? <span className="text-green-500 text-xs font-bold bg-green-100 px-2 py-1 rounded">FOYDA</span> : <span className="text-gray-400 text-xs">-</span>}</td></tr>) })}</tbody></table></div></motion.div>)}
            {activeTab === 'payments' && (<motion.div key="payments" initial="initial" animate="in" exit="out" variants={pageVariants}><div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-bold text-slate-800">To'lovlar</h2><div className="flex gap-3"><button onClick={downloadExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg"><FaDownload /> Excel</button><select className="p-2 border rounded-lg bg-white text-gray-600 font-bold" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}><option value="all">Barchasi</option><option value="paid">To'laganlar</option><option value="unpaid">Qarzdorlar</option></select><select className="p-2 border rounded-lg shadow-sm font-bold bg-white text-indigo-600" value={paymentMonth} onChange={e => setPaymentMonth(e.target.value)}>{paymentMonthsList.map(month => (<option key={month} value={month}>{month}</option>))}</select></div></div><div className="bg-white rounded-xl shadow-sm border overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="p-4">O'quvchi</th><th className="p-4">Kurs & Rejim</th><th className="p-4">Summa</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Amallar</th></tr></thead><tbody>{getPaymentUsers().length === 0 ? <tr><td colSpan="5" className="p-6 text-center text-gray-400">O'quvchilar yo'q.</td></tr> : getPaymentUsers().map((student, i) => { const paymentInfo = student.payments?.find(p => p.month === paymentMonth); const isPaid = !!paymentInfo; const price = getCoursePrice(student.course || 'Foundation', student.schedule || 'odd_days'); return (<tr key={i} className="border-b hover:bg-slate-50"><td className="p-4"><div className="font-bold text-slate-700">{student.name}</div>{isPaid && <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1"><FaCommentDollar /> {paymentInfo.comment}</div>}</td><td className="p-4"><span className="font-bold">{student.course || 'Foundation'}</span><br/><span className="text-xs text-gray-500">{student.schedule === 'daily' ? 'Har kuni' : student.schedule === 'even_days' ? 'Sesh-Pay-Shan' : 'Dush-Chor-Juma'}</span></td><td className="p-4 font-mono font-bold text-indigo-600">{price.toLocaleString()} so'm</td><td className="p-4 text-center">{isPaid ? <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">TO'LANGAN</span> : <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">QARZ</span>}</td><td className="p-4 flex justify-center gap-2">{!isPaid && (<><button onClick={() => openPaymentModal(student)} className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600"><FaCheck /></button><button onClick={() => handlePaymentReminder(student)} className="bg-yellow-400 text-white p-2 rounded-lg hover:bg-yellow-500"><FaBell /></button></>)}{isPaid && <span className="text-green-500 text-2xl"><FaCheckCircle /></span>}</td></tr>) })}</tbody></table></div></motion.div>)}
            {activeTab === 'groups' && (<motion.div key="groups" initial="initial" animate="in" exit="out" variants={pageVariants} className="h-full flex flex-col">{!selectedGroup ? (<><div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-bold text-slate-800">Guruhlar</h2><div className="flex gap-3"><div className="relative"><FaFilter className="absolute left-3 top-3 text-indigo-500" /><select className="pl-9 pr-4 py-2.5 border rounded-lg bg-white" value={filterDays} onChange={(e) => setFilterDays(e.target.value)}><option value="all">Barcha</option><option value="odd_days">Dush-Chor-Juma</option><option value="even_days">Sesh-Pay-Shan</option><option value="daily">Har kuni</option></select></div><button onClick={openCreateModal} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700"><FaPlus /> Guruh Yaratish</button></div></div>{filteredGroups.length === 0 ? <p className="text-center text-gray-400">Guruhlar yo'q.</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredGroups.map(group => (<div key={group._id} onClick={() => setSelectedGroup(group)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg relative overflow-hidden group"><div className="flex justify-between items-center mb-2"><div className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full"><FaClock /> {group.time}</div><div className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full"><FaCalendarAlt /> {group.days === 'odd_days' ? 'Dush-Chor-Juma' : group.days === 'even_days' ? 'Sesh-Pay-Shan' : 'Har kuni'}</div></div><h3 className="text-xl font-bold text-slate-800 mb-1">{group.name}</h3><p className="text-gray-500 text-sm">{group.students.length} ta o'quvchi</p></div>))}</div>}</>) : (
                <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedGroup(null)} className="text-gray-400 hover:text-white mr-2">← Orqaga</button>
                            <div className="font-bold">{selectedGroup.name} (Chat)</div>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
                        {selectedGroup.messages.map((msg, idx) => {
                            const isMe = msg.sender === 'Admin';
                            const senderColor = stringToColor(msg.sender);
                            const senderInitial = msg.sender.charAt(0).toUpperCase();

                            return (
                                <div key={idx} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {/* Agar admin bo'lmasa, avatar chapda */}
                                    {!isMe && (
                                        <div className="group relative">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1 shadow-sm cursor-pointer" style={{ backgroundColor: senderColor }}>
                                                {senderInitial}
                                            </div>
                                            {/* TOOLTIP: Hover qilinganda user ma'lumotlari chiqadi */}
                                            <div className="absolute bottom-10 left-0 bg-white p-3 rounded-lg shadow-xl border border-gray-100 w-48 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                                                <p className="font-bold text-slate-800 text-sm">{msg.sender}</p>
                                                {/* Bu yerda o'quvchini topib, telefonini chiqarishimiz mumkin */}
                                                {(() => {
                                                    const user = users.find(u => u.name === msg.sender);
                                                    return user ? <p className="text-xs text-gray-500 mt-1">{user.phone} • {user.role === 'student' ? "O'quvchi" : "Ota-ona"}</p> : <p className="text-xs text-gray-400">Ma'lumot topilmadi</p>
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm relative ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-gray-100 rounded-bl-none'}`}>
                                        {!isMe && <p className="text-[10px] font-bold mb-1 opacity-70" style={{ color: senderColor }}>{msg.sender}</p>}
                                        {msg.text} 
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
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={e => setChatFile(e.target.files[0])} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current.click()} className={`p-3 rounded-full transition ${chatFile ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <FaPaperclip />
                        </button>
                        
                        <div className="flex-1 relative">
                            {chatFile && (
                                <div className="absolute -top-10 left-0 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full shadow flex items-center gap-2">
                                    <FaFileAlt/> {chatFile.name} 
                                    <button type="button" onClick={()=>{setChatFile(null); fileInputRef.current.value=""}}><FaTimesCircle/></button>
                                </div>
                            )}
                            <input 
                                type="text" 
                                placeholder="Xabar..." 
                                className="w-full bg-gray-100 border-0 rounded-full px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-indigo-500" 
                                value={chatMessage} 
                                onChange={(e) => setChatMessage(e.target.value)} 
                            />
                        </div>
                        <button className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 shadow-lg">
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}</motion.div>)}
            
            {activeTab === 'attendance' && (<motion.div key="attendance" initial="initial" animate="in" exit="out" variants={pageVariants} className="h-full">{!selectedGroup ? (<><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-slate-800">Davomat: Guruhni tanlang</h2><div className="flex gap-3"><div className="relative"><FaFilter className="absolute left-3 top-3 text-indigo-500" /><select className="pl-9 pr-4 py-2.5 border rounded-lg bg-white" value={filterDays} onChange={(e) => setFilterDays(e.target.value)}><option value="all">Barcha</option><option value="odd_days">Dush-Chor-Juma</option><option value="even_days">Sesh-Pay-Shan</option><option value="daily">Har kuni</option></select></div></div></div><div className="grid md:grid-cols-3 gap-6">{filteredGroups.map(group => (<div key={group._id} onClick={() => openAttendance(group)} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg cursor-pointer border border-gray-200 transition"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl"><FaCalendarCheck /></div><div><h3 className="font-bold text-lg text-slate-800">{group.name}</h3><p className="text-sm text-gray-500">{group.time}</p><p className="text-xs text-gray-400">{group.students.length} ta o'quvchi</p></div></div></div>))}</div></>) : (<div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col"><div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl"><div className="flex items-center gap-3"><button onClick={() => setSelectedGroup(null)} className="text-gray-500 hover:text-indigo-600 font-bold">← Orqaga</button><h2 className="text-2xl font-bold text-slate-800">{selectedGroup.name} - Davomat</h2></div><div className="flex bg-gray-100 p-1 rounded-lg"><button onClick={() => setAttendanceView('daily')} className={`px-4 py-2 rounded-md text-sm font-bold ${attendanceView === 'daily' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}><FaList /> Kunlik</button><button onClick={() => setAttendanceView('history')} className={`px-4 py-2 rounded-md text-sm font-bold ${attendanceView === 'history' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}><FaTable /> Jurnal</button></div></div>
            {attendanceView === 'daily' && (<><div className="p-4 flex justify-between items-center border-b bg-indigo-50/50"><div className="flex gap-2 items-center"><label className="text-sm font-bold text-gray-700">Sana:</label><input type="date" className="p-2 border rounded-lg text-sm font-bold text-center" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} /></div><button onClick={markAllPresent} className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-200 transition flex items-center gap-2"><FaBolt /> Hammasi Bor</button></div><div className="p-6 overflow-y-auto flex-1"><table className="w-full text-left border-collapse"><thead><tr className="border-b text-gray-500 text-sm uppercase"><th className="p-3">O'quvchi</th><th className="p-3 text-center">Holat</th><th className="p-3">Izoh</th></tr></thead><tbody>{selectedGroup.students.map(student => { const status = attendanceMap[student._id]?.status || 'present'; const reason = attendanceMap[student._id]?.reason || ''; return (<tr key={student._id} className="border-b hover:bg-gray-50"><td className="p-4 font-bold text-slate-700">{student.name}</td><td className="p-4"><div className="flex justify-center gap-2"><button onClick={() => handleStatusChange(student._id, 'present')} className={`flex-1 py-2 rounded-lg font-bold text-xs ${status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>BOR</button><button onClick={() => handleStatusChange(student._id, 'absent')} className={`flex-1 py-2 rounded-lg font-bold text-xs ${status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}>YO'Q</button></div></td><td className="p-4">{status === 'absent' ? <input type="text" placeholder="Sababi..." className="w-full border rounded p-2 text-sm" value={reason} onChange={(e) => handleReasonChange(student._id, e.target.value)} /> : <span className="text-gray-400">-</span>}</td></tr>); })}</tbody></table></div><div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end"><button onClick={saveAttendance} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg"><FaCheck /> Saqlash</button></div></>)}
            {attendanceView === 'history' && (<div className="p-6 overflow-auto"><table className="w-full text-left border-collapse border border-gray-200"><thead><tr><th className="p-3 border bg-gray-50 text-sm font-bold min-w-[200px] sticky left-0 z-10">F.I.SH</th>{selectedGroup.attendance?.map((day, idx) => <th key={idx} className="p-3 border bg-gray-50 text-center text-xs font-bold min-w-[80px]">{day.date}</th>)}</tr></thead><tbody>{selectedGroup.students.map(student => (<tr key={student._id} className="hover:bg-gray-50"><td className="p-3 border font-medium text-slate-700 sticky left-0 bg-white">{student.name}</td>{selectedGroup.attendance?.map((day, idx) => { const record = day.records.find(r => r.studentId === student._id); const status = record ? record.status : '-'; return (<td key={idx} className="p-3 border text-center">{status === 'present' ? <FaCheckCircle className="text-green-500 inline" /> : status === 'absent' ? <FaTimesCircle className="text-red-500 inline" /> : '-'}</td>); })}</tr>))}</tbody></table></div>)}</div>)}</motion.div>)}
            {activeTab === 'grades' && (<motion.div key="grades" initial="initial" animate="in" exit="out" variants={pageVariants}>{!selectedGroup ? (<><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold text-slate-800">Baholash: Guruhni tanlang</h2></div><div className="grid md:grid-cols-3 gap-6">{groups.map(group => (<div key={group._id} onClick={() => openGrades(group)} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg cursor-pointer border border-gray-200 transition"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xl"><FaStar /></div><div><h3 className="font-bold text-lg text-slate-800">{group.name}</h3><p className="text-sm text-gray-500">{group.students.length} o'quvchi</p></div></div></div>))}</div></>) : (<div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col"><div className="p-4 flex justify-between items-center border-b bg-indigo-50/50 rounded-t-2xl"><div className="flex items-center gap-3"><button onClick={() => setSelectedGroup(null)} className="text-gray-500 hover:text-indigo-600 font-bold">← Orqaga</button><h2 className="text-2xl font-bold text-slate-800">{selectedGroup.name} (Baholar)</h2></div><div className="flex bg-gray-100 p-1 rounded-lg"><button onClick={() => setGradeView('daily')} className={`px-4 py-2 rounded-md text-sm font-bold ${gradeView === 'daily' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}><FaList /> Kunlik</button><button onClick={() => setGradeView('history')} className={`px-4 py-2 rounded-md text-sm font-bold ${gradeView === 'history' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}><FaTable /> Jurnal</button></div></div>
            {gradeView === 'daily' && (<><div className="p-4 flex justify-between items-center border-b bg-indigo-50/50"><div className="flex gap-2 items-center"><input type="date" className="p-2 border rounded-lg text-sm font-bold w-40 text-center" value={gradeDate} onChange={(e) => setGradeDate(e.target.value)} /></div></div><div className="p-6 overflow-y-auto flex-1"><table className="w-full text-left border-collapse"><thead><tr className="border-b text-gray-500 text-sm uppercase"><th className="p-3">O'quvchi</th><th className="p-3 text-center">Baho (1-5)</th><th className="p-3">Izoh</th></tr></thead><tbody>{selectedGroup.students.map(student => { const score = gradeMap[student._id]?.score || ''; const comment = gradeMap[student._id]?.comment || ''; return (<tr key={student._id} className="border-b hover:bg-gray-50"><td className="p-4 font-bold text-slate-700">{student.name}</td><td className="p-4 text-center"><input type="number" min="1" max="5" className="w-16 p-2 border rounded-lg text-center font-bold focus:ring-2 focus:ring-yellow-400 outline-none" value={score} onChange={(e) => handleScoreChange(student._id, e.target.value)} /></td><td className="p-4"><input type="text" placeholder="Izoh..." className="w-full border rounded p-2 text-sm" value={comment} onChange={(e) => handleCommentChange(student._id, e.target.value)} /></td></tr>); })}</tbody></table></div><div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end"><button onClick={saveGrades} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg"><FaCheck /> Saqlash</button></div></>)}
            {gradeView === 'history' && (<div className="p-6 overflow-auto"><table className="w-full text-left border-collapse border border-gray-200"><thead><tr><th className="p-3 border bg-gray-50 text-sm font-bold min-w-[200px] sticky left-0 z-10 bg-gray-50">F.I.SH</th>{selectedGroup.grades?.map((g, idx) => <th key={idx} className="p-3 border bg-gray-50 text-center text-xs font-bold min-w-[50px]">{g.date}</th>)}</tr></thead><tbody>{selectedGroup.students.map(student => (<tr key={student._id} className="hover:bg-gray-50"><td className="p-3 border font-medium text-slate-700 sticky left-0 bg-white">{student.name}</td>{selectedGroup.grades?.map((g, idx) => { const record = g.records.find(r => r.studentId === student._id); return (<td key={idx} className="p-3 border text-center font-bold">{record && record.score > 0 ? <span className={`px-2 py-1 rounded text-xs ${record.score >= 4 ? 'bg-green-100 text-green-700' : record.score === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{record.score}</span> : <span className="text-gray-300">-</span>}</td>); })}</tr>))}</tbody></table>{selectedGroup.grades?.length === 0 && <p className="text-center text-gray-400 mt-10">Baholar yo'q.</p>}</div>)}</div>)}</motion.div>)}
            {activeTab === 'users' && (<motion.div key="users" initial="initial" animate="in" exit="out" variants={pageVariants}><div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-bold text-slate-800">Foydalanuvchilar</h2><div className="flex gap-2"><select className="p-2 border rounded-lg bg-white text-gray-600 font-bold" value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}><option value="active">O'qiyotganlar</option><option value="left">Chiqib ketganlar</option><option value="all">Barchasi</option></select><button onClick={openCreateUserModal} className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex gap-2 items-center"><FaPlus /> Yangi</button></div></div><div className="bg-white rounded-xl shadow-sm border overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="p-4">F.I.SH</th><th className="p-4">Telefon</th><th className="p-4">Rol</th><th className="p-4">Ota-ona</th><th className="p-4">Status</th><th className="p-4 text-center">Amallar</th></tr></thead><tbody>{getFilteredUsers().map((u, i) => { const parent = u.parentId ? users.find(p => p._id === u.parentId) : null; return (<tr key={i} className={`hover:bg-slate-50 transition ${u.status === 'left' ? 'bg-red-50' : ''}`}><td className="p-4 font-bold text-slate-700">{u.name}</td><td className="p-4 font-mono text-slate-600">{u.phone}</td><td className="p-4 capitalize"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'parent' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role === 'student' ? "O'quvchi" : u.role === 'parent' ? "Ota-ona" : "Admin"}</span></td><td className="p-4">{u.role === 'student' ? (parent ? (<div className="flex items-center gap-2"><div className="bg-orange-100 p-1.5 rounded-full text-orange-600 text-xs"><FaUserTie/></div><div><div className="text-sm font-bold text-slate-700">{parent.name}</div><div className="text-[10px] text-gray-500">{parent.phone}</div></div></div>) : (<span className="text-red-400 text-xs italic flex items-center gap-1"><FaExclamationCircle/> Biriktirilmagan</span>)) : (<span className="text-gray-300">-</span>)}</td><td className="p-4 text-sm font-bold">{(u.status === 'active' || !u.status) ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded">O'qimoqda</span> : <span className="text-red-500 bg-red-50 px-2 py-1 rounded">Chiqib ketgan</span>}</td><td className="p-4 flex justify-center"><button onClick={() => openEditUserModal(u)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"><FaPen /></button></td></tr>); })}</tbody></table></div></motion.div>)}
            
            {/* --- IMTIHONLAR TABI (OPTIMALLASHTIRILGAN) --- */}
            {activeTab === 'exams' && (
                <motion.div key="exams" initial="initial" animate="in" exit="out" variants={pageVariants}>
                    
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800">Imtihonlar Boshqaruvi</h2>
                            <p className="text-gray-500 text-sm mt-1">Har oy oxirida majburiy imtihonlar</p>
                        </div>
                        <button onClick={() => openExamModal(null)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex gap-2 items-center font-bold shadow-lg hover:bg-indigo-700 transition transform hover:scale-105">
                            <FaPlus /> Imtihon Yaratish
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                        {exams.length === 0 ? (
                            <div className="col-span-full text-center py-10 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                                <p className="text-gray-400 font-bold">Hozircha imtihonlar yo'q.</p>
                            </div>
                        ) : (
                            exams.map(exam => {
                                const timePerQ = getTimePerQuestion(exam.course);
                                const totalTime = formatTotalTime(25 * timePerQ);

                                return (
                                    <div key={exam._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative group hover:shadow-xl transition-all duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                                                <FaFileAlt size={24} />
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openExamModal(exam)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:bg-blue-100"><MdEdit /></button>
                                                <button onClick={() => handleDeleteExam(exam._id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100"><FaTrash /></button>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-slate-800 mb-1">{exam.title}</h3>
                                        <p className="text-sm font-bold text-gray-500 uppercase mb-4">{exam.course}</p>
                                        
                                        <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex justify-between">
                                                <span><FaList className="inline mr-1 text-gray-400"/> Savollar:</span>
                                                <span className="font-bold">25 ta</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span><FaHourglassHalf className="inline mr-1 text-gray-400"/> 1 savolga:</span>
                                                <span className="font-bold text-indigo-600">{timePerQ} soniya</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2 mt-2">
                                                <span><BiTimeFive className="inline mr-1 text-gray-400"/> Jami vaqt:</span>
                                                <span className="font-bold text-green-600">{totalTime}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            <button 
                                                onClick={() => openPermissionModal(exam)} 
                                                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-md"
                                            >
                                                <FaLock /> O'quvchilarga Ruxsat Berish
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* --- NATIJALAR VA ANALITIKA --- */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500 p-2 rounded-lg text-white"><FaChartLine size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-bold">Natijalar Tahlili</h3>
                                    <p className="text-xs text-slate-400 opacity-80">Joriy oy: {archiveMonth}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg p-2.5 outline-none font-bold" value={archiveMonth} onChange={(e) => setArchiveMonth(e.target.value)}>
                                    {paymentMonthsList.map(month => <option key={month} value={month}>{month}</option>)}
                                </select>
                                <button onClick={downloadExamResults} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition">
                                    <FaDownload /> Excel
                                </button>
                            </div>
                        </div>

                        <div className="p-8 pb-0">
                            <div className="grid md:grid-cols-3 gap-6 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Imtihon</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium" onChange={(e) => setGradingExamId(e.target.value)}>
                                        <option value="">-- Tanlang --</option>
                                        {exams.map(e => <option key={e._id} value={e._id}>{e.title} ({e.course})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">2. Guruh</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium" onChange={(e) => setGradingGroupId(e.target.value)}>
                                        <option value="">-- Tanlang --</option>
                                        {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">3. O'quvchi</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium" onChange={(e) => handleSelectStudentForGrading(e.target.value)}>
                                        <option value="">-- Tanlang --</option>
                                        {groups.find(g => g._id === gradingGroupId)?.students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <AnimatePresence>
                            {gradingStudentId && gradingExamId && (
                                <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="mb-10">
                                    <div className="bg-indigo-600 rounded-2xl p-1 shadow-lg">
                                        <div className="bg-white rounded-xl p-6">
                                            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2">
                                                <FaPen className="text-indigo-600"/> Baholash: <span className="text-indigo-600">{users.find(u => u._id === gradingStudentId)?.name}</span>
                                            </h4>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
                                                <div className="relative group">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Joriy (Max 60)</label>
                                                    <div className="w-full p-4 bg-gray-100 border border-gray-200 rounded-xl font-mono text-xl font-bold text-gray-700 text-center">
                                                        {calculatedDailyScore > 60 ? 60 : calculatedDailyScore}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Nazariy (Max 50)</label>
                                                    <input type="number" max="50" className="w-full p-4 border-2 border-indigo-100 rounded-xl font-mono text-xl font-bold text-center text-indigo-700 focus:border-indigo-500 outline-none" value={theoryScore} onChange={(e) => setTheoryScore(e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Amaliy (Max 50)</label>
                                                    <input type="number" max="50" className="w-full p-4 border-2 border-indigo-100 rounded-xl font-mono text-xl font-bold text-center text-indigo-700 focus:border-indigo-500 outline-none" value={practicalScore} onChange={(e) => setPracticalScore(e.target.value)} />
                                                </div>
                                                <button onClick={handleSaveResult} className="w-full h-[60px] bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition transform active:scale-95 flex flex-col justify-center items-center">
                                                    <span>HISOBLASH</span>
                                                    <span className="text-[10px] opacity-80 font-normal">VA SAQLASH</span>
                                                </button>
                                            </div>

                                            <div className="mt-6 flex flex-col md:flex-row justify-center items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <div className="text-center">
                                                    <div className="text-xs font-bold text-gray-400 uppercase">Jami Ball</div>
                                                    <div className="text-xl font-bold text-gray-700">
                                                        {(Math.min(calculatedDailyScore, 60) + (parseInt(theoryScore)||0) + (parseInt(practicalScore)||0))} / 160
                                                    </div>
                                                </div>
                                                <div className="hidden md:block h-10 w-px bg-gray-300"></div>
                                                <div className="text-center">
                                                    <div className="text-xs font-bold text-gray-400 uppercase">Yakuniy Foiz</div>
                                                    <div className={`text-3xl font-extrabold ${( (Math.min(calculatedDailyScore, 60) + (parseInt(theoryScore)||0) + (parseInt(practicalScore)||0)) / 1.6 ) >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {(( (Math.min(calculatedDailyScore, 60) + (parseInt(theoryScore)||0) + (parseInt(practicalScore)||0)) / 1.6 )).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {studentPracticalFile && (
                                                <div className="mt-4 text-center">
                                                    <a href={`http://localhost:5000${studentPracticalFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm font-bold hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-full inline-flex items-center gap-2">
                                                        <FaPaperclip/> O'quvchi yuklagan amaliy ish fayli
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>

                        <div className="p-8 pt-0">
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="p-4">O'quvchi</th>
                                            <th className="p-4">Imtihon</th>
                                            <th className="p-4 text-center">Tarkibiy Ballar</th>
                                            <th className="p-4 text-center">Progress</th>
                                            <th className="p-4 text-center">Foiz</th>
                                            <th className="p-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {getFilteredExamResults().length === 0 ? (
                                            <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">Tanlangan oy uchun natijalar mavjud emas.</td></tr>
                                        ) : (
                                            getFilteredExamResults().slice().reverse().map((res, idx) => {
                                                const percentage = parseFloat(res.finalPercentage);
                                                const isPassed = res.passed;
                                                
                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50 transition group">
                                                        <td className="p-4">
                                                            <div className="font-bold text-slate-700">{res.studentId?.name}</div>
                                                            <div className="text-[10px] text-gray-400">{new Date(res.date).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-xs font-bold text-indigo-600">{res.examId?.title}</div>
                                                            <div className="text-[10px] text-gray-500">{res.examId?.course}</div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex justify-center gap-1 text-[10px] font-bold">
                                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded" title="Joriy">J: {res.dailyScore}</span>
                                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded" title="Nazariy">N: {res.theoryScore}</span>
                                                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded" title="Amaliy">A: {res.practicalScore}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 w-48">
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                                <div className={`h-2.5 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="font-mono font-black text-lg text-slate-700">{percentage}%</div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {isPassed ? 
                                                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm border border-green-200"><FaCheckCircle/> O'tdi</span> : 
                                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm border border-red-200"><FaTimesCircle/> Yiqildi</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            
        </AnimatePresence></div>

        {/* --- MODALLAR --- */}
        {isPermissionModalOpen && permissionExam && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-lg p-0 shadow-2xl flex flex-col max-h-[85vh]">
                    <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">Imtihon Ruxsati</h3>
                            <p className="text-sm text-indigo-600 font-bold">{permissionExam.title} <span className="text-gray-400">({permissionExam.course})</span></p>
                        </div>
                        <button onClick={() => setIsPermissionModalOpen(false)} className="text-gray-400 hover:text-red-500 transition"><FaTimes size={20}/></button>
                    </div>
                    
                    <div className="p-4 bg-white border-b">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3.5 text-gray-400"/>
                            <input placeholder="O'quvchini qidirish..." className="w-full pl-10 p-3 bg-gray-100 rounded-xl border-none outline-none font-medium text-slate-700"/>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-4 space-y-2">
                        {users.filter(u => u.role === 'student').length === 0 ? (
                            <div className="text-center py-10">
                                <FaUserGraduate className="mx-auto text-gray-300 text-4xl mb-3"/>
                                <p className="text-gray-400">O'quvchilar topilmadi.</p>
                            </div>
                        ) : (
                            users.filter(u => u.role === 'student').map(user => {
                                const isAllowed = user.examPermission?.allowed && user.examPermission?.examId === permissionExam._id;
                                const isCourseMatch = user.course === permissionExam.course;
                                
                                return (
                                    <div key={user._id} className={`flex justify-between items-center p-4 rounded-xl border transition ${isAllowed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-indigo-200'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${isAllowed ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700">{user.name}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">{user.phone}</span>
                                                    {!isCourseMatch && (
                                                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded border border-yellow-200">
                                                            Kursi: {user.course || "Yo'q"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={isAllowed}
                                                onChange={() => toggleExamPermission(user._id, permissionExam._id, isAllowed)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-b-2xl border-t text-center text-xs text-gray-400">
                        Ruxsat berilgandan so'ng o'quvchi imtihonni ko'ra oladi.
                    </div>
                </div>
            </div>
        )}

        {/* EXAM CREATION MODAL */}
        {isExamModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl"><h3 className="text-2xl font-bold text-slate-800 mb-6">{editingExam ? "Imtihonni Tahrirlash" : "Yangi Imtihon Yaratish"}</h3><div className="space-y-6"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-gray-700 mb-1">Nomi</label><input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masalan: Yanvar Foundation" value={examFormData.title} onChange={e => setExamFormData({...examFormData, title: e.target.value})} /></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Kurs</label><select className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={examFormData.course} onChange={e => setExamFormData({...examFormData, course: e.target.value})}><option value="HTML & CSS">HTML & CSS</option><option value="CSS Advanced">CSS Advanced</option><option value="JS Beginner">JS Beginner</option><option value="JS Advanced">JS Advanced</option><option value="React Beginner">React Beginner</option><option value="React Advanced">React Advanced</option></select></div></div><div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100"><h4 className="font-bold text-indigo-700 mb-3">Amaliy Topshiriq</h4><input className="w-full p-3 border rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Vazifa matni (Masalan: Figma maketini yasang...)" value={examFormData.practicalDesc} onChange={e => setExamFormData({...examFormData, practicalDesc: e.target.value})} /><input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Figma yoki Rasm Linki (Ixtiyoriy)" value={examFormData.practicalLink} onChange={e => setExamFormData({...examFormData, practicalLink: e.target.value})} /></div><div><div className="flex justify-between items-center mb-3"><h4 className="font-bold text-slate-700">Test Savollari</h4><button onClick={() => setExamFormData({...examFormData, questions: [...examFormData.questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }] })} className="text-indigo-600 text-sm font-bold hover:underline">+ Savol Qo'shish</button></div>{examFormData.questions.map((q, qIdx) => (<div key={qIdx} className="mb-4 p-4 border rounded-xl bg-gray-50 relative group"><button onClick={() => {const n=[...examFormData.questions];n.splice(qIdx,1);setExamFormData({...examFormData,questions:n})}} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><FaTrash/></button><input className="w-full p-2 border rounded mb-2 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={`${qIdx+1}-savol matni`} value={q.question} onChange={e => {const n=[...examFormData.questions];n[qIdx].question=e.target.value;setExamFormData({...examFormData,questions:n})}} /><div className="grid grid-cols-2 gap-2">{q.options.map((opt, oIdx) => (<div key={oIdx} className="flex items-center"><input type="radio" name={`q-${qIdx}`} checked={q.correctAnswer === oIdx} onChange={() => {const n=[...examFormData.questions];n[qIdx].correctAnswer=oIdx;setExamFormData({...examFormData,questions:n})}} className="mr-2 cursor-pointer" /><input className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={`Variant ${String.fromCharCode(65+oIdx)}`} value={opt} onChange={e => {const n=[...examFormData.questions];n[qIdx].options[oIdx]=e.target.value;setExamFormData({...examFormData,questions:n})}} /></div>))}</div></div>))}</div></div><div className="flex gap-3 mt-8"><button onClick={() => setIsExamModalOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Bekor qilish</button><button onClick={handleSaveExam} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition">{editingExam ? "Yangilash" : "Yaratish"}</button></div></div></div>)}
        
        {/* PAYMENT MODAL */}
        {isPaymentModalOpen && selectedPaymentUser && (<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative"><button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><FaTimes /></button><div className="text-center mb-6"><div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 text-3xl"><FaMoneyBillWave /></div><h3 className="text-xl font-bold text-slate-800">To'lovni Tasdiqlash</h3><p className="text-sm text-gray-500 mt-1">{selectedPaymentUser.name}</p></div><div className="space-y-4"><div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center"><p className="text-xs text-gray-500 uppercase font-bold">To'lov Summasi</p><p className="text-2xl font-bold text-indigo-600 font-mono mt-1">{getCoursePrice(selectedPaymentUser.course, selectedPaymentUser.schedule).toLocaleString()} so'm</p></div><div><label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Izoh (Kim qabul qildi?)</label><textarea className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows="3" placeholder="Masalan: Naqd pul, Admin (Otabek)..." value={paymentComment} onChange={(e) => setPaymentComment(e.target.value)}></textarea></div><button onClick={handlePaymentSubmit} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition shadow-lg flex items-center justify-center gap-2"><FaCheck /> Tasdiqlash</button></div></div></div>)}
        
        {/* GROUP MODAL */}
        {isGroupModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6"><h3 className="text-xl font-bold text-slate-800 mb-4">{editingGroup ? "Guruhni Tahrirlash" : "Guruh Yaratish"}</h3><div className="space-y-4"><div><label className="block text-sm font-bold text-gray-700 mb-1">Guruh Nomi</label><input type="text" placeholder="Frontend-24" className="w-full p-3 border rounded-lg" value={groupFormData.name} onChange={e => setGroupFormData({...groupFormData, name: e.target.value})} /></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Dars Kunlari</label><select className="w-full p-3 border rounded-lg bg-white" value={groupFormData.days} onChange={e => setGroupFormData({...groupFormData, days: e.target.value})}><option value="odd_days">Dush-Chor-Juma</option><option value="even_days">Sesh-Pay-Shan</option><option value="daily">Har kuni</option></select></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Dars Vaqti</label><select className="w-full p-3 border rounded-lg bg-white" value={groupFormData.time} onChange={e => setGroupFormData({...groupFormData, time: e.target.value})}><option value="" disabled>Vaqtni tanlang</option><option value="08:00 - 10:00">08:00 - 10:00</option><option value="10:00 - 12:00">10:00 - 12:00</option><option value="13:00 - 15:00">13:00 - 15:00</option><option value="15:00 - 17:00">15:00 - 17:00</option></select></div><div><label className="block text-sm font-bold text-gray-700 mb-1">O'quvchilarni tanlang</label><div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">{users.filter(u => u.role === 'student' && (u.status === 'active' || !u.status)).map(s => (<label key={s._id} className="block"><input type="checkbox" checked={groupFormData.selectedStudents.includes(s._id)} onChange={e => { if (e.target.checked) setGroupFormData({...groupFormData, selectedStudents: [...groupFormData.selectedStudents, s._id]}); else setGroupFormData({...groupFormData, selectedStudents: groupFormData.selectedStudents.filter(id => id !== s._id)}) }} /> {s.name}</label>))}</div></div></div><div className="flex gap-2 mt-4"><button onClick={() => setIsGroupModalOpen(false)} className="flex-1 bg-gray-200 py-2 rounded-lg font-bold">Bekor</button><button onClick={handleSaveGroup} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold">Saqlash</button></div></div></div>)}
        
        {/* USER MODAL */}
        {isUserModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative"><button onClick={() => setIsUserModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><FaTimes /></button><h3 className="text-xl font-bold mb-4 text-slate-800">{editingUser ? "Foydalanuvchini Tahrirlash" : "Yangi Foydalanuvchi"}</h3><div className="space-y-3"><div><label className="block text-xs text-gray-500 mb-1 font-bold">F.I.SH</label><input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ism Familiya" value={userFormData.name} onChange={e=>setUserFormData({...userFormData, name: e.target.value})}/></div><div><label className="block text-xs text-gray-500 mb-1 font-bold">Telefon Raqam (Login)</label><input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="991234567" value={userFormData.phone} onChange={e=>setUserFormData({...userFormData, phone: e.target.value})}/></div><div><label className="block text-xs text-gray-500 mb-1 font-bold">Parol</label><input className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="********" value={userFormData.password} onChange={e=>setUserFormData({...userFormData, password: e.target.value})}/></div><div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100"><label className="block text-xs text-indigo-800 mb-1 font-bold uppercase">Foydalanuvchi Roli</label><select className="w-full p-2 border rounded-lg bg-white font-bold text-slate-700" value={userFormData.role} onChange={e=>setUserFormData({...userFormData, role:e.target.value})}><option value="student">👨‍🎓 O'quvchi</option><option value="parent">👨‍👩‍👧 Ota-ona</option><option value="admin">🛡️ Admin</option></select></div>{userFormData.role === 'student' && (<motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="space-y-3 pt-2 border-t border-gray-100"><div className="grid grid-cols-2 gap-2"><div><label className="block text-xs text-gray-500 mb-1 font-bold">Rejim</label><select className="w-full p-2 border rounded-lg bg-white text-sm" value={userFormData.schedule} onChange={e=>setUserFormData({...userFormData, schedule:e.target.value})}><option value="odd_days">Toq kunlar</option><option value="even_days">Juft kunlar</option><option value="daily">Har kuni</option></select></div><div><label className="block text-xs text-gray-500 mb-1 font-bold">Kurs</label><select className="w-full p-2 border rounded-lg bg-white text-sm" value={userFormData.course} onChange={e=>setUserFormData({...userFormData, course:e.target.value})}><option value="HTML & CSS">HTML & CSS</option><option value="CSS Advanced">CSS Advanced</option><option value="JS Beginner">JS Beginner</option><option value="JS Advanced">JS Advanced</option><option value="React Beginner">React Beginner</option><option value="React Advanced">React Advanced</option></select></div></div><div><label className="block text-xs text-indigo-600 mb-1 font-bold uppercase">Ota-onasini tanlang</label><select className="w-full p-2 border-2 border-indigo-100 rounded-lg bg-white text-slate-700 font-medium focus:border-indigo-500 outline-none" value={userFormData.parentId} onChange={e=>setUserFormData({...userFormData, parentId:e.target.value})}><option value="">-- Tanlanmagan --</option>{users.filter(u => u.role === 'parent').map(parent => (<option key={parent._id} value={parent._id}>{parent.name} ({parent.phone})</option>))}</select><p className="text-[10px] text-gray-400 mt-1">* Agar ro'yxatda yo'q bo'lsa, avval Ota-onani yarating.</p></div></motion.div>)}<button onClick={handleSaveUser} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition mt-4 shadow-lg flex justify-center items-center gap-2"><FaCheck /> Saqlash</button></div></div></div>)}
      </main>
    </div>
  );
}