import React from 'react';
import { AppStep } from '../types';
import { Settings, BookOpen, Users, LayoutGrid, CalendarCheck, CheckCircle } from 'lucide-react';

interface StepWizardProps {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
}

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep, setStep }) => {
  const steps = [
    { id: AppStep.CONFIG, label: 'Setup', icon: Settings },
    { id: AppStep.SUBJECTS, label: 'Subjects', icon: BookOpen },
    { id: AppStep.TEACHERS, label: 'Teachers', icon: Users },
    { id: AppStep.CLASSES, label: 'Classes', icon: LayoutGrid },
    { id: AppStep.ALLOCATIONS, label: 'Assign', icon: CheckCircle },
    { id: AppStep.PREVIEW, label: 'Timetable', icon: CalendarCheck },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm z-10 no-print">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <CalendarCheck className="w-6 h-6" />
          Scheduler AI
        </h1>
        <p className="text-xs text-slate-500 mt-1">School Timetable Generator</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isPast = currentStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => setStep(step.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <div className={`p-1.5 rounded-md ${isActive ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
              </div>
              {step.label}
              {isPast && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};