import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Users,
  ChevronRight,
  Save,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export function Attendance() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';
  
  const [view, setView] = useState<'overview' | 'history'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: studentData, isLoading: isStudentLoading, error: studentError } = useApi(
    () => !isFaculty ? api.fetchAttendance() : Promise.resolve(null),
    [isFaculty]
  );

  const { data: facultyCourses, isLoading: isCoursesLoading } = useApi(
    () => isFaculty ? api.fetchCourses() : Promise.resolve(null),
    [isFaculty]
  );

  const { data: courseStudents, isLoading: isStudentsLoading } = useApi(
    () => (isFaculty && selectedCourse) ? api.fetchCourseStudents(selectedCourse) : Promise.resolve(null),
    [isFaculty, selectedCourse]
  );

  // Initialize entries when students are loaded
  useEffect(() => {
    if (courseStudents?.students) {
      const initial: Record<string, 'present' | 'absent' | 'late'> = {};
      courseStudents.students.forEach((s: any) => {
        initial[s.id] = 'present';
      });
      setEntries(initial);
    }
  }, [courseStudents]);

  const handleMarkAttendance = async () => {
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      const markingEntries = Object.entries(entries).map(([studentId, status]) => ({
        studentId,
        status
      }));
      await api.markAttendance({
        courseId: selectedCourse,
        date: markingDate,
        entries: markingEntries
      });
      alert('Attendance marked successfully');
      setSelectedCourse(null);
    } catch (err: any) {
      alert(err.message || 'Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isStudentLoading || isCoursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  // Define faculty rendering logic
  if (isFaculty) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Faculty Attendance</h1>
            <p className="text-white/40 mt-1">Manage and track student attendance for your courses</p>
          </div>
        </div>

        {!selectedCourse ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyCourses?.courses?.map((course: any) => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.02 }}
                className="card-dark p-6 cursor-pointer group"
                onClick={() => setSelectedCourse(course.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white/70" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{course.code}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{course.name}</h3>
                <p className="text-xs text-white/40 mb-6">{course.enrolledStudents} Students Enrolled</p>
                <div className="flex items-center text-xs font-bold text-white/50 group-hover:text-white transition-colors">
                  Mark Attendance <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-dark p-0 overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="text-xs text-white/40 hover:text-white mb-2 flex items-center gap-1"
                >
                  ← Back to Courses
                </button>
                <h2 className="text-xl font-bold text-white">
                  {facultyCourses?.courses?.find((c: any) => c.id === selectedCourse)?.name}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="date" 
                  value={markingDate}
                  onChange={(e) => setMarkingDate(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-zinc-600"
                />
                <button
                  onClick={handleMarkAttendance}
                  disabled={isSubmitting}
                  className="bg-white text-black px-4 py-2 rounded text-xs font-bold flex items-center gap-2 hover:bg-zinc-200 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save Attendance
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold">Student Name</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isStudentsLoading ? (
                    <tr><td colSpan={2} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/20" /></td></tr>
                  ) : courseStudents?.students?.length === 0 ? (
                    <tr><td colSpan={2} className="py-20 text-center text-white/20">No students enrolled in this course</td></tr>
                  ) : courseStudents?.students?.map((student: any) => (
                    <tr key={student.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{student.fullName}</div>
                        <div className="text-[10px] text-white/30">{student.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {(['present', 'absent', 'late'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => setEntries(prev => ({ ...prev, [student.id]: status }))}
                              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                entries[student.id] === status
                                  ? 'bg-white text-black border-white'
                                  : 'bg-transparent text-white/20 border-white/5 hover:border-white/10 hover:text-white/40'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Student rendering (Original logic)
  if (isStudentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  if (studentError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60 gap-3">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <p className="text-sm">
          {typeof studentError === 'string' ? studentError : (studentError as any)?.message || 'Failed to load attendance'}
        </p>
      </div>
    );
  }

  const records = studentData?.attendance || studentData?.records || [];

  // Compute per-subject aggregation
  const subjectMap = new Map<string, { name: string; code: string; attended: number; total: number }>();
  const recentDays: { date: string; day: string; classes: { subject: string; status: string }[] }[] = [];
  const dayMap = new Map<string, { subject: string; status: string }[]>();

  for (const r of records) {
    const courseCode = r.course?.code || r.courseCode;
    const courseName = r.course?.name || r.courseName || r.subject;
    const key = courseCode || courseName || 'Unknown';
    
    if (!subjectMap.has(key)) {
      subjectMap.set(key, { name: courseName || key, code: courseCode || 'Unknown', attended: 0, total: 0 });
    }
    const s = subjectMap.get(key)!;
    s.total++;
    if (r.status === 'present' || r.status === 'late') s.attended++;

    // Group into days for history
    const fullDate = r.date || '';
    if (fullDate) {
      const dateStr = typeof fullDate === 'string' ? fullDate.split('T')[0] : fullDate;
      if (!dayMap.has(dateStr)) dayMap.set(dateStr, []);
      dayMap.get(dateStr)!.push({ subject: s.name, status: r.status });
    }
  }

  const subjects = Array.from(subjectMap.values()).map(s => ({
    ...s,
    status: (() => {
      const perc = s.total > 0 ? (s.attended / s.total) * 100 : 100;
      return perc < 65 ? 'danger' : perc < 75 ? 'warning' : 'safe';
    })(),
  }));

  // Build recent days (last 5)
  const sortedDates = Array.from(dayMap.keys()).sort().slice(-5).reverse();
  for (const d of sortedDates) {
    const dateObj = new Date(d);
    recentDays.push({
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      classes: dayMap.get(d) || [],
    });
  }

  const overallAttended = subjects.reduce((s, sub) => s + sub.attended, 0);
  const overallTotal = subjects.reduce((s, sub) => s + sub.total, 0);
  const overallPerc = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-white/50 mt-1">Track your class attendance</p>
        </div>
        <div className="flex bg-surface-100 rounded-lg p-1">
          {(['overview', 'history'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                view === v ? 'bg-accent text-black' : 'text-white/50 hover:text-white/70'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall', value: `${overallPerc}%`, icon: TrendingUp, color: 'text-white', bg: 'bg-white/10' },
          { label: 'Present', value: `${overallAttended}`, icon: CheckCircle2, color: 'text-white/80', bg: 'bg-white/5' },
          { label: 'Absent', value: `${overallTotal - overallAttended}`, icon: XCircle, color: 'text-white/40', bg: 'bg-white/[0.02]' },
          { label: 'At Risk', value: subjects.filter(s => s.status === 'danger').length.toString(), icon: AlertTriangle, color: 'text-white/20', bg: 'bg-white/[0.01]' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-white/45 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {view === 'overview' ? (
        <div className="card-dark p-5">
          <h3 className="text-base font-semibold text-white mb-4">Subject-wise Attendance</h3>
          <div className="space-y-4">
            {subjects.length === 0 && <p className="text-sm text-white/40 text-center py-6">No attendance records</p>}
            {subjects.map((sub, i) => {
              const perc = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
              return (
                <motion.div
                  key={sub.code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-medium text-white/85">{sub.name}</span>
                        <span className="text-xs text-white/35 ml-2">{sub.code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">{sub.attended}/{sub.total}</span>
                        <span className={`text-sm font-bold ${
                          sub.status === 'danger' ? 'text-red-400' :
                          sub.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{perc}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${perc}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                        className={`h-full rounded-full bg-white ${perc < 65 ? 'opacity-30' : perc < 85 ? 'opacity-60' : 'opacity-100'}`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card-dark p-5">
          <h3 className="text-base font-semibold text-white mb-4">Recent Attendance</h3>
          <div className="space-y-4">
            {recentDays.length === 0 && <p className="text-sm text-white/40 text-center py-6">No recent records</p>}
            {recentDays.map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-white/35" />
                  <span className="text-sm font-semibold text-white/70">{day.day}, {day.date}</span>
                </div>
                <div className="space-y-2 pl-6">
                  {day.classes.map((cls, j) => (
                    <div key={j} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
                      {cls.status === 'present' ? (
                        <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-white/20 flex-shrink-0" />
                      )}
                      <span className="text-sm text-white/75">{cls.subject}</span>
                      <span className={`ml-auto text-xs font-medium ${
                        cls.status === 'present' ? 'text-white/80' : 'text-white/20'
                      }`}>{cls.status}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
