import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const gradeColors: Record<string, string> = {
  'A+': 'text-emerald-400',
  'A': 'text-emerald-400',
  'A-': 'text-cyan-400',
  'B+': 'text-accent-light',
  'B': 'text-amber-400',
  'B-': 'text-amber-400',
  'C+': 'text-orange-400',
  'C': 'text-orange-400',
  'D': 'text-red-400',
  'F': 'text-red-500',
};

export function Grades() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [gradeData, setGradeData] = useState({
    component: '',
    score: '',
    maxScore: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: studentData, isLoading: isStudentLoading, error: studentError } = useApi(
    () => !isFaculty ? api.fetchGrades() : Promise.resolve(null),
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

  const handlePostGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !selectedStudent || !gradeData.component || !gradeData.score || !gradeData.maxScore) {
      alert('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.addGrade({
        courseId: selectedCourse,
        studentId: selectedStudent.id,
        component: gradeData.component,
        score: parseFloat(gradeData.score),
        maxScore: parseFloat(gradeData.maxScore)
      });
      alert('Grade posted successfully');
      setGradeData({ component: '', score: '', maxScore: '' });
      setSelectedStudent(null);
    } catch (err: any) {
      let msg = err.message || 'Failed to post grade';
      if (err.details) {
        const details = Object.entries(err.details)
          .map(([field, errors]: [string, any]) => `${field}: ${errors.join(', ')}`)
          .join('\n');
        msg += `\n\nDetails:\n${details}`;
      }
      alert(msg);
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

  if (isFaculty) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Faculty Grading</h1>
            <p className="text-white/40 mt-1">Assign and manage student grades for your courses</p>
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
                    <Award className="w-5 h-5 text-white/70" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{course.code}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{course.name}</h3>
                <p className="text-xs text-white/40 mb-6">{course.enrolledStudents} Students Enrolled</p>
                <div className="flex items-center text-xs font-bold text-white/50 group-hover:text-white transition-colors">
                  Assign Grades <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="text-xs text-white/40 hover:text-white flex items-center gap-1"
                >
                  ← Back to Courses
                </button>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Students</span>
              </div>
              <div className="card-dark overflow-hidden divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {isStudentsLoading ? (
                  <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/20" /></div>
                ) : courseStudents?.students?.map((student: any) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-4 text-left transition-colors hover:bg-white/[0.02] ${
                      selectedStudent?.id === student.id ? 'bg-white/[0.05]' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-white">{student.fullName}</div>
                    <div className="text-[10px] text-white/30">{student.id}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Grading Form */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedStudent ? (
                  <motion.div
                    key={selectedStudent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card-dark p-8"
                  >
                    <h2 className="text-xl font-bold text-white mb-2">Grade for {selectedStudent.fullName}</h2>
                    <p className="text-sm text-white/40 mb-8 border-b border-white/5 pb-4">
                      {facultyCourses?.courses?.find((c: any) => c.id === selectedCourse)?.name}
                    </p>

                    <form onSubmit={handlePostGrade} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Component Name</label>
                          <input
                            type="text"
                            placeholder="e.g., Midterm Exam, Quiz 1, Assignment"
                            value={gradeData.component}
                            onChange={e => setGradeData(prev => ({ ...prev, component: e.target.value }))}
                            className="w-full bg-zinc-950 border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-white/20"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Obtained Score</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={gradeData.score}
                              onChange={e => setGradeData(prev => ({ ...prev, score: e.target.value }))}
                              className="w-full bg-zinc-950 border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-white/20"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Max Score</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="100.00"
                              value={gradeData.maxScore}
                              onChange={e => setGradeData(prev => ({ ...prev, maxScore: e.target.value }))}
                              className="w-full bg-zinc-950 border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-white/20"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Submit Grade
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 text-white/20">
                    <GraduationCap className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-sm">Select a student to start grading</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    );
  }

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
          {typeof studentError === 'string' ? studentError : (studentError as any)?.message || 'Failed to load grades'}
        </p>
      </div>
    );
  }

  const summary = studentData?.courseSummary || [];
  
  // Calculate aggregate stats from summary
  const totalCredits = summary.reduce((s: number, c: any) => s + (c.credits || 0), 0);
  const avgPct = summary.length > 0 ? summary.reduce((s: number, c: any) => s + c.percentage, 0) / summary.length : 0;
  
  // Map percentage to a rough CGPA (out of 10)
  const cgpa = (avgPct / 10).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Academic Performance</h1>
          <p className="text-white/40 mt-1">Detailed breakdown of your results and credits</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'GPA Equivalent', value: cgpa, icon: Award, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Avg Performance', value: `${Math.round(avgPct)}%`, icon: TrendingUp, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Total Credits', value: totalCredits.toString(), icon: BookOpen, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Courses', value: summary.length.toString(), icon: GraduationCap, color: 'text-white', bg: 'bg-white/5' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 bg-zinc-900 border border-zinc-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-8 h-8 rounded flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Grades Table */}
      <div className="bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/50">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Subject</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium">Code</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-center">Credits</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-medium text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {summary.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-white/20 italic">No academic data available</td></tr>
              )}
              {summary.map((g: any, i: number) => (
                <motion.tr
                  key={g.courseId || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{g.name}</div>
                    <div className="text-xs text-white/30 truncate max-w-[200px]">{g.description}</div>
                  </td>
                  <td className="px-6 py-4 text-white/50 font-mono text-xs">{g.code}</td>
                  <td className="px-6 py-4 text-center text-white/70">{g.credits}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${gradeColors[g.grade] || 'text-white'}`}>
                      {g.grade}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
