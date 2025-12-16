import React, { useState, useCallback } from 'react';
import { StepWizard } from './components/StepWizard';
import { AllocationManager } from './components/AllocationManager';
import { ResultsView } from './components/ResultsView';
import { AppStep, SchoolConfig, Subject, Teacher, ClassGroup, Allocation, GeneratedSchedule } from './types';
import { generateSchedule } from './services/geminiService';
import { Trash2, Plus, Sparkles, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

export const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [config, setConfig] = useState<SchoolConfig>({
    daysPerWeek: 5,
    periodsPerDay: 8,
    breakAfterPeriod: 4,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  });

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'sub_1', name: 'Mathematics', color: '#3b82f6' },
    { id: 'sub_2', name: 'Science', color: '#10b981' },
    { id: 'sub_3', name: 'English', color: '#f59e0b' }
  ]);

  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 't_1', name: 'Mr. Smith', subjectIds: ['sub_1'] },
    { id: 't_2', name: 'Ms. Johnson', subjectIds: ['sub_2'] }
  ]);

  const [classes, setClasses] = useState<ClassGroup[]>([
    { id: 'c_1', name: 'Grade 10 A' },
    { id: 'c_2', name: 'Grade 10 B' }
  ]);

  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);

  // --- Handlers ---

  const addSubject = () => {
    const id = crypto.randomUUID();
    const color = COLORS[subjects.length % COLORS.length];
    setSubjects([...subjects, { id, name: 'New Subject', color }]);
  };

  const addTeacher = () => {
    setTeachers([...teachers, { id: crypto.randomUUID(), name: 'New Teacher', subjectIds: [] }]);
  };

  const addClass = () => {
    setClasses([...classes, { id: crypto.randomUUID(), name: 'New Class' }]);
  };

  const toggleTeacherSubject = (teacherId: string, subjectId: string) => {
    setTeachers(teachers.map(t => {
      if (t.id !== teacherId) return t;
      const hasSubject = t.subjectIds.includes(subjectId);
      return {
        ...t,
        subjectIds: hasSubject 
          ? t.subjectIds.filter(id => id !== subjectId)
          : [...t.subjectIds, subjectId]
      };
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateSchedule(config, subjects, teachers, classes, allocations);
      setSchedule(result);
      setStep(AppStep.PREVIEW);
    } catch (err) {
      setError("Failed to generate schedule. Please try again or check your allocations.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Steps ---

  const renderConfig = () => (
    <div className="max-w-2xl mx-auto space-y-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800">School Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Periods Per Day</label>
          <input 
            type="number" min="4" max="12"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={config.periodsPerDay}
            onChange={e => setConfig({...config, periodsPerDay: parseInt(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Break After Period</label>
          <input 
            type="number" min="1" max={config.periodsPerDay - 1}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={config.breakAfterPeriod}
            onChange={e => setConfig({...config, breakAfterPeriod: parseInt(e.target.value)})}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">School Days</label>
          <div className="flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <button
                key={day}
                onClick={() => {
                  const newDays = config.days.includes(day) 
                    ? config.days.filter(d => d !== day) 
                    : [...config.days, day];
                  // Keep sort order correct
                  const sorted = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                    .filter(d => newDays.includes(d));
                  setConfig({...config, days: sorted, daysPerWeek: sorted.length});
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  config.days.includes(day) 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Manage Subjects</h2>
        <button onClick={addSubject} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => (
          <div key={sub.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
            <input 
              type="color" 
              value={sub.color}
              onChange={(e) => setSubjects(subjects.map(s => s.id === sub.id ? {...s, color: e.target.value} : s))}
              className="w-8 h-8 rounded cursor-pointer border-none"
            />
            <input 
              type="text" 
              value={sub.name}
              onChange={(e) => setSubjects(subjects.map(s => s.id === sub.id ? {...s, name: e.target.value} : s))}
              className="flex-1 p-2 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none font-medium"
            />
            <button 
              onClick={() => setSubjects(subjects.filter(s => s.id !== sub.id))}
              className="text-slate-400 hover:text-red-500 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Manage Teachers & Capabilities</h2>
        <button onClick={addTeacher} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {teacher.name.charAt(0)}
              </div>
              <input 
                type="text" 
                value={teacher.name}
                onChange={(e) => setTeachers(teachers.map(t => t.id === teacher.id ? {...t, name: e.target.value} : t))}
                className="flex-1 text-lg font-medium p-2 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
              />
              <button 
                onClick={() => setTeachers(teachers.filter(t => t.id !== teacher.id))}
                className="text-slate-400 hover:text-red-500 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Can Teach:</p>
              <div className="flex flex-wrap gap-2">
                {subjects.map(sub => {
                  const isActive = teacher.subjectIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => toggleTeacherSubject(teacher.id, sub.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        isActive 
                          ? 'bg-white border-indigo-200 text-indigo-700 shadow-sm' 
                          : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                      }`}
                      style={isActive ? { borderColor: sub.color, color: 'black' } : {}}
                    >
                      {isActive && <span className="mr-1.5 inline-block w-2 h-2 rounded-full" style={{backgroundColor: sub.color}} />}
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Manage Classes</h2>
        <button onClick={addClass} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
             <input 
              type="text" 
              value={cls.name}
              onChange={(e) => setClasses(classes.map(c => c.id === cls.id ? {...c, name: e.target.value} : c))}
              className="flex-1 text-lg font-medium p-2 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
            />
            <button 
              onClick={() => setClasses(classes.filter(c => c.id !== cls.id))}
              className="text-slate-400 hover:text-red-500 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Main Layout ---

  if (step === AppStep.PREVIEW && schedule) {
    return (
      <ResultsView 
        schedule={schedule}
        config={config}
        classes={classes}
        teachers={teachers}
        subjects={subjects}
        onBack={() => setStep(AppStep.ALLOCATIONS)}
      />
    );
  }

  const isConfigStep = step === AppStep.CONFIG;
  const isAllocationStep = step === AppStep.ALLOCATIONS;

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <StepWizard currentStep={step} setStep={setStep} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto pb-24">
            
            {/* Step Content */}
            {step === AppStep.CONFIG && renderConfig()}
            {step === AppStep.SUBJECTS && renderSubjects()}
            {step === AppStep.TEACHERS && renderTeachers()}
            {step === AppStep.CLASSES && renderClasses()}
            {step === AppStep.ALLOCATIONS && (
              <AllocationManager 
                allocations={allocations}
                setAllocations={setAllocations}
                subjects={subjects}
                teachers={teachers}
                classes={classes}
                maxPeriods={config.periodsPerDay * config.daysPerWeek}
              />
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button 
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {loading ? (
              <div className="flex items-center gap-3 text-indigo-600 font-medium animate-pulse">
                <Sparkles className="w-5 h-5 animate-spin" />
                Generating Timetable with AI...
              </div>
            ) : (
              <div className="flex gap-4">
                 {error && (
                   <span className="flex items-center gap-2 text-red-600 text-sm">
                     <AlertTriangle className="w-4 h-4" /> {error}
                   </span>
                 )}
                {step === AppStep.ALLOCATIONS ? (
                  <button 
                    onClick={handleGenerate}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-bold"
                  >
                    <Sparkles className="w-4 h-4" /> Generate Timetable
                  </button>
                ) : (
                  <button 
                    onClick={() => setStep(s => Math.min(4, s + 1))}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};