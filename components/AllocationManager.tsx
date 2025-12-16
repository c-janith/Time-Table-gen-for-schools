import React, { useState } from 'react';
import { Allocation, ClassGroup, Subject, Teacher } from '../types';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface AllocationManagerProps {
  allocations: Allocation[];
  setAllocations: React.Dispatch<React.SetStateAction<Allocation[]>>;
  subjects: Subject[];
  teachers: Teacher[];
  classes: ClassGroup[];
  maxPeriods: number;
}

export const AllocationManager: React.FC<AllocationManagerProps> = ({
  allocations,
  setAllocations,
  subjects,
  teachers,
  classes,
  maxPeriods
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [periods, setPeriods] = useState<number>(4);

  // Filter teachers who teach the selected subject
  const availableTeachers = teachers.filter(t => 
    selectedSubject ? t.subjectIds.includes(selectedSubject) : true
  );

  const handleAdd = () => {
    if (!selectedClass || !selectedSubject || !selectedTeacher) return;

    const newAllocation: Allocation = {
      id: crypto.randomUUID(),
      classId: selectedClass,
      subjectId: selectedSubject,
      teacherId: selectedTeacher,
      periodsPerWeek: periods,
    };

    setAllocations([...allocations, newAllocation]);
  };

  const handleRemove = (id: string) => {
    setAllocations(allocations.filter(a => a.id !== id));
  };

  const currentClassAllocations = allocations.filter(a => a.classId === selectedClass);
  const totalPeriodsAssigned = currentClassAllocations.reduce((sum, a) => sum + a.periodsPerWeek, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-indigo-900">Assign Workload</h2>
          <p className="text-indigo-700 text-sm">Define who teaches what for each class.</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-bold ${totalPeriodsAssigned > maxPeriods ? 'bg-red-100 text-red-700' : 'bg-white text-indigo-600'}`}>
          {totalPeriodsAssigned} / {maxPeriods} Periods Assigned
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Input Column */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">New Assignment</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
              <select 
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select 
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedTeacher(''); // Reset teacher when subject changes
                }}
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
              <select 
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                disabled={!selectedSubject}
              >
                <option value="">{selectedSubject ? 'Select Teacher...' : 'Select Subject First'}</option>
                {availableTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Periods per Week</label>
              <input 
                type="number" 
                min="1" 
                max={maxPeriods}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={periods}
                onChange={(e) => setPeriods(parseInt(e.target.value))}
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!selectedClass || !selectedSubject || !selectedTeacher}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Plus className="w-4 h-4" /> Add Assignment
            </button>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Assignments for {classes.find(c => c.id === selectedClass)?.name}</h3>
            {totalPeriodsAssigned > maxPeriods && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                <AlertCircle className="w-4 h-4" /> Over capacity
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {currentClassAllocations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>No subjects assigned to this class yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentClassAllocations.map(alloc => {
                  const sub = subjects.find(s => s.id === alloc.subjectId);
                  const teach = teachers.find(t => t.id === alloc.teacherId);
                  return (
                    <div key={alloc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-10 rounded-full" style={{ backgroundColor: sub?.color || '#ccc' }}></div>
                        <div>
                          <div className="font-medium text-slate-900">{sub?.name}</div>
                          <div className="text-sm text-slate-500">{teach?.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium bg-slate-100 px-2.5 py-1 rounded text-slate-600">
                          {alloc.periodsPerWeek} pds
                        </span>
                        <button 
                          onClick={() => handleRemove(alloc.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};