export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjectIds: string[];
}

export interface ClassGroup {
  id: string;
  name: string;
}

export interface Allocation {
  id: string;
  classId: string;
  teacherId: string;
  subjectId: string;
  periodsPerWeek: number;
}

export interface SchoolConfig {
  daysPerWeek: number; // e.g. 5 (Mon-Fri)
  periodsPerDay: number; // e.g. 8
  breakAfterPeriod: number; // e.g. 4
  days: string[];
}

export interface ScheduleSlot {
  dayIndex: number;
  periodIndex: number;
  subjectId: string;
  teacherId: string;
  classId: string;
}

export interface GeneratedSchedule {
  slots: ScheduleSlot[];
}

export enum AppStep {
  CONFIG = 0,
  SUBJECTS = 1,
  TEACHERS = 2,
  CLASSES = 3,
  ALLOCATIONS = 4,
  PREVIEW = 5,
}