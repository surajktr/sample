// Exam Configuration System for CGL Score Sight

export interface SubjectConfig {
  name: string;
  part: string;
  totalQuestions: number;
  maxMarks: number;
  correctMarks: number;
  negativeMarks: number;
  isQualifying?: boolean;
}

export interface ExamConfig {
  id: string;
  name: string;
  category: string;
  totalQuestions: number;
  maxMarks: number;
  subjects: SubjectConfig[];
}

export interface ExamCategory {
  id: string;
  label: string;
  emoji: string;
}

export const EXAM_CATEGORIES: ExamCategory[] = [
  { id: 'SSC', label: 'SSC Exams', emoji: '🏛️' },
  { id: 'RAILWAY', label: 'Railway Exams', emoji: '🚂' },
  { id: 'IB', label: 'Intelligence Bureau', emoji: '🕵️' },
  { id: 'BANK', label: 'Bank Exams', emoji: '🏦' },
  { id: 'POLICE', label: 'Police Exams', emoji: '🚔' },
];

export const EXAM_CONFIGS: ExamConfig[] = [
  // SSC Exams
  {
    id: 'SSC_CGL_PRE', name: 'SSC CGL Tier-I', category: 'SSC', totalQuestions: 100, maxMarks: 200,
    subjects: [
      { name: 'General Intelligence & Reasoning', part: 'A', totalQuestions: 25, maxMarks: 50, correctMarks: 2, negativeMarks: 0.5 },
      { name: 'General Awareness', part: 'B', totalQuestions: 25, maxMarks: 50, correctMarks: 2, negativeMarks: 0.5 },
      { name: 'Quantitative Aptitude', part: 'C', totalQuestions: 25, maxMarks: 50, correctMarks: 2, negativeMarks: 0.5 },
      { name: 'English Comprehension', part: 'D', totalQuestions: 25, maxMarks: 50, correctMarks: 2, negativeMarks: 0.5 },
    ],
  },
  {
    id: 'SSC_CGL_MAINS', name: 'SSC CGL Tier-II', category: 'SSC', totalQuestions: 150, maxMarks: 390,
    subjects: [
      { name: 'Mathematical Abilities', part: 'A', totalQuestions: 30, maxMarks: 90, correctMarks: 3, negativeMarks: 1 },
      { name: 'Reasoning & General Intelligence', part: 'B', totalQuestions: 30, maxMarks: 90, correctMarks: 3, negativeMarks: 1 },
      { name: 'English Language & Comprehension', part: 'C', totalQuestions: 45, maxMarks: 135, correctMarks: 3, negativeMarks: 1 },
      { name: 'General Awareness', part: 'D', totalQuestions: 25, maxMarks: 75, correctMarks: 3, negativeMarks: 0.5 },
      { name: 'Computer Knowledge', part: 'E', totalQuestions: 20, maxMarks: 60, correctMarks: 3, negativeMarks: 0.5, isQualifying: true },
    ],
  },
  {
    id: 'SSC_CHSL_PRE', name: 'SSC CHSL Tier-I', category: 'SSC', totalQuestions: 100, maxMarks: 200,
    subjects: [
      { name: 'General Intelligence', part: 'A', totalQuestions: 25, maxMarks: 50, correctMarks: 2, negativeMarks: 0.5 },
      { name: 'General Awareness', part: 'B', totalQuestions: 25, maxMarks: 50, correctMarks: 2, negativeMarks: 0.5 },
      { name: 'Quantitative Aptitude', part: 'C', totalQuestions: 25, maxMarks: 50, correctMarks: 2, negativeMarks: 0.5 },
      { name: 'English Language', part: 'D', totalQuestions: 25, maxMarks: 50, correctMarks: 2, negativeMarks: 0.5 },
    ],
  },
  {
    id: 'SSC_CHSL_MAINS', name: 'SSC CHSL Tier-II', category: 'SSC', totalQuestions: 135, maxMarks: 405,
    subjects: [
      { name: 'Mathematical Abilities', part: 'A', totalQuestions: 30, maxMarks: 90, correctMarks: 3, negativeMarks: 1 },
      { name: 'Reasoning & General Intelligence', part: 'B', totalQuestions: 30, maxMarks: 90, correctMarks: 3, negativeMarks: 1 },
      { name: 'English Language & Comprehension', part: 'C', totalQuestions: 45, maxMarks: 135, correctMarks: 3, negativeMarks: 1 },
      { name: 'General Awareness', part: 'D', totalQuestions: 30, maxMarks: 90, correctMarks: 3, negativeMarks: 1 },
    ],
  },
  {
    id: 'SSC_CPO_PRE', name: 'SSC CPO Paper-I', category: 'SSC', totalQuestions: 200, maxMarks: 200,
    subjects: [
      { name: 'General Intelligence & Reasoning', part: 'A', totalQuestions: 50, maxMarks: 50, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'General Knowledge & Awareness', part: 'B', totalQuestions: 50, maxMarks: 50, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Quantitative Aptitude', part: 'C', totalQuestions: 50, maxMarks: 50, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'English Comprehension', part: 'D', totalQuestions: 50, maxMarks: 50, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'SSC_CPO_MAINS', name: 'SSC CPO Paper-II', category: 'SSC', totalQuestions: 200, maxMarks: 200,
    subjects: [
      { name: 'English Language & Comprehension', part: 'A', totalQuestions: 200, maxMarks: 200, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'SSC_MTS', name: 'SSC MTS', category: 'SSC', totalQuestions: 90, maxMarks: 90,
    subjects: [
      { name: 'Numerical & Mathematical Ability', part: 'A', totalQuestions: 20, maxMarks: 20, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Reasoning Ability & Problem Solving', part: 'B', totalQuestions: 20, maxMarks: 20, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'General Awareness', part: 'C', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'English Language & Comprehension', part: 'D', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'SSC_GD_CONSTABLE', name: 'SSC GD Constable', category: 'SSC', totalQuestions: 80, maxMarks: 160,
    subjects: [
      { name: 'General Intelligence & Reasoning', part: 'A', totalQuestions: 20, maxMarks: 40, correctMarks: 2, negativeMarks: 0.5 },
      { name: 'General Knowledge & Awareness', part: 'B', totalQuestions: 20, maxMarks: 40, correctMarks: 2, negativeMarks: 0.5 },
      { name: 'Elementary Mathematics', part: 'C', totalQuestions: 20, maxMarks: 40, correctMarks: 2, negativeMarks: 0.5 },
      { name: 'English/Hindi', part: 'D', totalQuestions: 20, maxMarks: 40, correctMarks: 2, negativeMarks: 0.5 },
    ],
  },
  {
    id: 'SSC_STENO', name: 'SSC Stenographer', category: 'SSC', totalQuestions: 200, maxMarks: 200,
    subjects: [
      { name: 'General Intelligence & Reasoning', part: 'A', totalQuestions: 50, maxMarks: 50, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'General Awareness', part: 'B', totalQuestions: 50, maxMarks: 50, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'English Language & Comprehension', part: 'C', totalQuestions: 100, maxMarks: 100, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  // Railway Exams
  {
    id: 'RRB_NTPC_CBT1', name: 'RRB NTPC CBT-1', category: 'RAILWAY', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'Mathematics', part: 'A', totalQuestions: 30, maxMarks: 30, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Intelligence & Reasoning', part: 'B', totalQuestions: 30, maxMarks: 30, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Awareness', part: 'C', totalQuestions: 40, maxMarks: 40, correctMarks: 1, negativeMarks: 0.333 },
    ],
  },
  {
    id: 'RRB_NTPC_CBT2', name: 'RRB NTPC CBT-2', category: 'RAILWAY', totalQuestions: 120, maxMarks: 120,
    subjects: [
      { name: 'Mathematics', part: 'A', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Intelligence & Reasoning', part: 'B', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Awareness', part: 'C', totalQuestions: 50, maxMarks: 50, correctMarks: 1, negativeMarks: 0.333 },
    ],
  },
  {
    id: 'RRB_GROUP_D', name: 'RRB Group D', category: 'RAILWAY', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'Mathematics', part: 'A', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Intelligence & Reasoning', part: 'B', totalQuestions: 30, maxMarks: 30, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Science', part: 'C', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Awareness & Current Affairs', part: 'D', totalQuestions: 20, maxMarks: 20, correctMarks: 1, negativeMarks: 0.333 },
    ],
  },
  {
    id: 'RRB_JE_CBT1', name: 'RRB JE CBT-1', category: 'RAILWAY', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'Mathematics', part: 'A', totalQuestions: 30, maxMarks: 30, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Intelligence & Reasoning', part: 'B', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Awareness', part: 'C', totalQuestions: 15, maxMarks: 15, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Science', part: 'D', totalQuestions: 30, maxMarks: 30, correctMarks: 1, negativeMarks: 0.333 },
    ],
  },
  {
    id: 'RRB_ALP_CBT1', name: 'RRB ALP CBT-1', category: 'RAILWAY', totalQuestions: 75, maxMarks: 75,
    subjects: [
      { name: 'Mathematics', part: 'A', totalQuestions: 20, maxMarks: 20, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Intelligence & Reasoning', part: 'B', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Science', part: 'C', totalQuestions: 20, maxMarks: 20, correctMarks: 1, negativeMarks: 0.333 },
      { name: 'General Awareness', part: 'D', totalQuestions: 10, maxMarks: 10, correctMarks: 1, negativeMarks: 0.333 },
    ],
  },
  // IB Exams
  {
    id: 'IB_ACIO', name: 'IB ACIO Tier-I', category: 'IB', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'General Awareness', part: 'A', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Quantitative Aptitude', part: 'B', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Logical/Analytical Ability', part: 'C', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'English Language', part: 'D', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'IB_SA', name: 'IB Security Assistant', category: 'IB', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'General Awareness', part: 'A', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Quantitative Aptitude', part: 'B', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Logical/Analytical Ability', part: 'C', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'English Language', part: 'D', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  // Bank Exams
  {
    id: 'IBPS_PO_PRE', name: 'IBPS PO Prelims', category: 'BANK', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'English Language', part: 'A', totalQuestions: 30, maxMarks: 30, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Quantitative Aptitude', part: 'B', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Reasoning Ability', part: 'C', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'IBPS_PO_MAINS', name: 'IBPS PO Mains', category: 'BANK', totalQuestions: 155, maxMarks: 200,
    subjects: [
      { name: 'Reasoning & Computer Aptitude', part: 'A', totalQuestions: 45, maxMarks: 60, correctMarks: 1.33, negativeMarks: 0.25 },
      { name: 'English Language', part: 'B', totalQuestions: 35, maxMarks: 40, correctMarks: 1.14, negativeMarks: 0.25 },
      { name: 'Data Analysis & Interpretation', part: 'C', totalQuestions: 35, maxMarks: 60, correctMarks: 1.71, negativeMarks: 0.25 },
      { name: 'General/Economy/Banking Awareness', part: 'D', totalQuestions: 40, maxMarks: 40, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'IBPS_CLERK_PRE', name: 'IBPS Clerk Prelims', category: 'BANK', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'English Language', part: 'A', totalQuestions: 30, maxMarks: 30, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Numerical Ability', part: 'B', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Reasoning Ability', part: 'C', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'IBPS_CLERK_MAINS', name: 'IBPS Clerk Mains', category: 'BANK', totalQuestions: 190, maxMarks: 200,
    subjects: [
      { name: 'General/Financial Awareness', part: 'A', totalQuestions: 50, maxMarks: 50, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'General English', part: 'B', totalQuestions: 40, maxMarks: 40, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Reasoning Ability & Computer Aptitude', part: 'C', totalQuestions: 50, maxMarks: 60, correctMarks: 1.2, negativeMarks: 0.25 },
      { name: 'Quantitative Aptitude', part: 'D', totalQuestions: 50, maxMarks: 50, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'SBI_PO_PRE', name: 'SBI PO Prelims', category: 'BANK', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'English Language', part: 'A', totalQuestions: 30, maxMarks: 30, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Quantitative Aptitude', part: 'B', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Reasoning Ability', part: 'C', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'SBI_CLERK_PRE', name: 'SBI Clerk Prelims', category: 'BANK', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'English Language', part: 'A', totalQuestions: 30, maxMarks: 30, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Numerical Ability', part: 'B', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Reasoning Ability', part: 'C', totalQuestions: 35, maxMarks: 35, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  // Police Exams
  {
    id: 'DELHI_POLICE_CONSTABLE', name: 'Delhi Police Constable', category: 'POLICE', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'General Knowledge/Current Affairs', part: 'A', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Reasoning', part: 'B', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Numerical Ability', part: 'C', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Computer Awareness', part: 'D', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
  {
    id: 'DELHI_POLICE_HEAD_CONSTABLE', name: 'Delhi Police Head Constable', category: 'POLICE', totalQuestions: 100, maxMarks: 100,
    subjects: [
      { name: 'General Knowledge/Current Affairs', part: 'A', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Reasoning/Quantitative Aptitude', part: 'B', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'English Language', part: 'C', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
      { name: 'Computer Fundamentals', part: 'D', totalQuestions: 25, maxMarks: 25, correctMarks: 1, negativeMarks: 0.25 },
    ],
  },
];

export function getExamsByCategory(categoryId: string): ExamConfig[] {
  return EXAM_CONFIGS.filter((e) => e.category === categoryId);
}

export function getExamConfig(examId: string): ExamConfig | undefined {
  return EXAM_CONFIGS.find((e) => e.id === examId);
}

export function getSubjectRanges(examConfig: ExamConfig): { part: string; subject: string; start: number; end: number; correctMarks: number; negativeMarks: number; maxMarks: number; isQualifying?: boolean }[] {
  let cursor = 1;
  return examConfig.subjects.map((s) => {
    const start = cursor;
    const end = cursor + s.totalQuestions - 1;
    cursor = end + 1;
    return {
      part: s.part,
      subject: s.name,
      start,
      end,
      correctMarks: s.correctMarks,
      negativeMarks: s.negativeMarks,
      maxMarks: s.maxMarks,
      isQualifying: s.isQualifying,
    };
  });
}
