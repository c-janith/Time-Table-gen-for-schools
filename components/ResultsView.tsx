import React, { useRef, useState } from 'react';
import { GeneratedSchedule, SchoolConfig, ClassGroup, Teacher, Subject } from '../types';
import { Download, Printer, Users, User, ArrowLeft } from 'lucide-react';

interface ResultsViewProps {
  schedule: GeneratedSchedule;
  config: SchoolConfig;
  classes: ClassGroup[];
  teachers: Teacher[];
  subjects: Subject[];
  onBack: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  schedule,
  config,
  classes,
  teachers,
  subjects,
  onBack
}) => {
  const [viewMode, setViewMode] = useState<'classes' | 'teachers'>('classes');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const getSlot = (entityId: string, dayIdx: number, periodIdx: number, isTeacher: boolean) => {
    return schedule.slots.find(s => 
      s.dayIndex === dayIdx && 
      s.periodIndex === periodIdx && 
      (isTeacher ? s.teacherId === entityId : s.classId === entityId)
    );
  };

  const entities = viewMode === 'classes' ? classes : teachers;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white border-b border-slate-200 gap-4 no-print">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('classes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'classes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" /> Class View
            </button>
            <button
              onClick={() => setViewMode('teachers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'teachers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" /> Teacher View
            </button>
          </div>
        </div>
        
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-auto p-4 sm:p-8" ref={printRef}>
        <div className="max-w-7xl mx-auto space-y-12 print:space-y-0">
          
          {/* Loop through each entity (Class or Teacher) to generate a table for them */}
          {entities.map((entity) => (
            <div key={entity.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:break-after page-break-always mb-8 print:mb-0 print:h-screen">
              <div className="bg-indigo-600 text-white p-4 print:bg-white print:text-black print:border-b-2 print:border-black">
                <h2 className="text-xl font-bold flex justify-between items-center">
                  <span>{viewMode === 'classes' ? 'Class' : 'Teacher'}: {entity.name}</span>
                  <span className="text-sm font-normal opacity-80 print:hidden">Timetable</span>
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 print:text-black print:bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium w-24">Day / Period</th>
                      {Array.from({ length: config.periodsPerDay }).map((_, i) => (
                        <React.Fragment key={i}>
                          {i === config.breakAfterPeriod && (
                            <th className="px-2 py-3 bg-slate-100 text-center w-12 border-l border-r border-slate-200 text-slate-400 print:bg-gray-200">
                              Break
                            </th>
                          )}
                          <th className="px-4 py-3 font-medium text-center border-r border-slate-100 last:border-0">
                            {i + 1}
                          </th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config.days.map((day, dayIdx) => (
                      <tr key={day} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-semibold text-slate-700 bg-slate-50/50 print:text-black">{day}</td>
                        
                        {Array.from({ length: config.periodsPerDay }).map((_, periodIdx) => {
                          const slot = getSlot(entity.id, dayIdx, periodIdx, viewMode === 'teachers');
                          const subject = slot ? subjects.find(s => s.id === slot.subjectId) : null;
                          const otherEntity = slot 
                            ? (viewMode === 'classes' 
                                ? teachers.find(t => t.id === slot.teacherId) 
                                : classes.find(c => c.id === slot.classId))
                            : null;

                          return (
                            <React.Fragment key={periodIdx}>
                              {periodIdx === config.breakAfterPeriod && (
                                <td className="bg-slate-100 border-l border-r border-slate-200 print:bg-gray-200"></td>
                              )}
                              <td className="px-2 py-2 border-r border-slate-100 last:border-0 h-24 w-32 align-top">
                                {slot ? (
                                  <div 
                                    className="h-full rounded p-2 flex flex-col justify-between border-l-4 shadow-sm print:shadow-none print:border border-slate-200"
                                    style={{ 
                                      borderLeftColor: subject?.color || '#cbd5e1',
                                      backgroundColor: 'white' // Keep background white for cleaner print
                                    }}
                                  >
                                    <div className="font-bold text-slate-800 text-xs sm:text-sm truncate" title={subject?.name}>
                                      {subject?.name}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate mt-1">
                                      {otherEntity?.name}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">
                                    Free
                                  </div>
                                )}
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};