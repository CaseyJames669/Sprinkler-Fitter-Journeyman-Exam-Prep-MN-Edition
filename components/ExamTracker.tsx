
import React, { useState, useEffect } from 'react';
import { ExamSchedule } from '../types';

interface ExamTrackerProps {
  targetDate: string | null | undefined;
  onSetTargetDate: (date: string | null) => void;
}

// UPDATED SCHEDULE DATA
// Confirmed Date: Dec 5, 2025 (1st Friday)
// Pattern: 1st Friday of every other month (Feb, Apr, Jun, Aug, Oct, Dec)
// Location: St. Paul, MN (State Fire Marshal Office)
// Deadline: 14 Days prior to exam date (Standard MN Policy)
// Sessions: Typically 9:00 AM and 1:00 PM
const EXAM_SCHEDULE: ExamSchedule[] = [
  // 2025 Schedule
  { id: '2025-1', date: '2025-02-07', deadline: '2025-01-24', location: 'St. Paul, MN' },
  { id: '2025-2', date: '2025-04-04', deadline: '2025-03-21', location: 'St. Paul, MN' },
  { id: '2025-3', date: '2025-06-06', deadline: '2025-05-23', location: 'St. Paul, MN' },
  { id: '2025-4', date: '2025-08-01', deadline: '2025-07-18', location: 'St. Paul, MN' },
  { id: '2025-5', date: '2025-10-03', deadline: '2025-09-19', location: 'St. Paul, MN' },
  { id: '2025-6', date: '2025-12-05', deadline: '2025-11-21', location: 'St. Paul, MN' }, // Confirmed
  // 2026 Schedule (Projected)
  { id: '2026-1', date: '2026-02-06', deadline: '2026-01-23', location: 'St. Paul, MN' },
  { id: '2026-2', date: '2026-04-03', deadline: '2026-03-20', location: 'St. Paul, MN' },
  { id: '2026-3', date: '2026-06-05', deadline: '2026-05-22', location: 'St. Paul, MN' },
  { id: '2026-4', date: '2026-08-07', deadline: '2026-07-24', location: 'St. Paul, MN' },
  { id: '2026-5', date: '2026-10-02', deadline: '2026-09-18', location: 'St. Paul, MN' },
  { id: '2026-6', date: '2026-12-04', deadline: '2026-11-20', location: 'St. Paul, MN' },
];

export const ExamTracker: React.FC<ExamTrackerProps> = ({ targetDate, onSetTargetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [upcomingExams, setUpcomingExams] = useState<ExamSchedule[]>([]);

  // Helper to parse date string as local time to avoid timezone shifts (e.g. showing Thursday instead of Friday)
  const parseLocalDate = (dateStr: string, timeStr = '00:00:00') => {
    return new Date(`${dateStr}T${timeStr}`);
  };

  useEffect(() => {
    // Filter out exams that have passed
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Use T12:00:00 for comparison to be safe against midnight shifts
    const future = EXAM_SCHEDULE.filter(e => parseLocalDate(e.date, '12:00:00') >= now);
    setUpcomingExams(future);
  }, []);

  // Countdown Logic
  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      // Parse target as local midnight
      const target = parseLocalDate(targetDate, '00:00:00');
      const now = new Date();
      
      const difference = +target - +now;
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        };
      } else {
          // Date passed
          return { days: 0, hours: 0, minutes: 0 };
      }
    };

    setTimeLeft(calculateTimeLeft());

    // Update every second for dynamic feel
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatDate = (dateStr: string) => {
    // Parse as noon to ensure it stays on the correct day regardless of user timezone
    const date = parseLocalDate(dateStr, '12:00:00');
    // Format: "Fri, Aug 15, 2025"
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysUntil = (dateStr: string) => {
      const target = parseLocalDate(dateStr, '00:00:00');
      const now = new Date();
      // Reset now to start of day for accurate day diff
      now.setHours(0,0,0,0);
      
      const diff = +target - +now;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (targetDate && timeLeft) {
    // --- MODE 1: COUNTDOWN ACTIVE ---
    return (
      <div className="mb-10 bg-slate-900 rounded-3xl p-1 shadow-2xl overflow-hidden relative border border-slate-700">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
        
        <div className="bg-slate-900 rounded-[22px] p-6 md:p-8 relative overflow-hidden">
           {/* Background decorative glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Target Exam Date</h3>
                    <div className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(targetDate)}
                    </div>
                    <button 
                        onClick={() => onSetTargetDate(null)}
                        className="text-slate-500 hover:text-white text-xs underline mt-2 transition-colors"
                    >
                        Change Exam Date
                    </button>
                </div>

                {/* The Timer */}
                <div className="flex gap-4 text-center">
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl min-w-[80px] shadow-lg">
                        <span className="block text-3xl md:text-4xl font-black text-white tabular-nums">{timeLeft.days}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase">Days</span>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl min-w-[80px] shadow-lg">
                        <span className="block text-3xl md:text-4xl font-black text-white tabular-nums">{timeLeft.hours}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase">Hrs</span>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl min-w-[80px] shadow-lg">
                        <span className="block text-3xl md:text-4xl font-black text-white tabular-nums">{timeLeft.minutes}</span>
                        <span className="text-xs text-slate-400 font-bold uppercase">Mins</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- MODE 2: SCHEDULE LIST ---
  return (
    <div className="mb-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Upcoming Exam Schedule
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select your exam date to start your study countdown.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
                <a 
                    href="https://dps.mn.gov/divisions/sfm/services/licensing-and-permits/fire-sprinklers/licensing-and-certification-using-new-lms"
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-bold flex items-center gap-1 px-2 whitespace-nowrap"
                >
                    LMS User Guide
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
                <a 
                    href="https://dps.mn.gov/events/calendar?search=&category=&department=12"
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-bold flex items-center gap-1 px-2 whitespace-nowrap"
                >
                    Official Calendar
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </a>
                <a 
                    href="https://mnfiremarshal.imagetrendlicense.com/lms/public/portal#/login" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 w-full justify-center sm:w-auto whitespace-nowrap"
                >
                    SFM Portal (Register)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                </a>
            </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-y border-amber-100 dark:border-amber-800/50 px-6 py-3">
             <div className="flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                 </svg>
                 <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> The <strong>Dec 5, 2025</strong> exam date is confirmed. Applications must be received by the State Fire Marshal at least <strong>14 days</strong> prior to the exam.
                    Please verify official availability on the SFM Calendar.
                 </p>
             </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Projected Exam Date</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Deadline</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Typical Location</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {upcomingExams.length > 0 ? (
                        upcomingExams.map((exam) => {
                            const daysUntil = getDaysUntil(exam.date);
                            const deadlinePassed = getDaysUntil(exam.deadline) < 0;

                            return (
                                <tr key={exam.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{formatDate(exam.date)}</div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Sessions: 9:00 AM & 1:00 PM
                                        </div>
                                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-0.5 rounded inline-block mt-1">
                                            {daysUntil} Days Away
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`font-medium ${deadlinePassed ? 'text-red-500 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {formatDate(exam.deadline)}
                                        </div>
                                        {deadlinePassed ? (
                                            <span className="text-[10px] text-red-500 font-bold uppercase">Closed</span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-normal">14 days prior</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                                        {exam.location}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => onSetTargetDate(exam.date)}
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline"
                                        >
                                            Target This Exam
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-500">
                                No upcoming exams found. Check the SFM website for updates.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};
