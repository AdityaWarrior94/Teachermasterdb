import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  Mail,
  User,
  CheckCircle2,
  Lock,
  ChevronRight,
  LogOut,
  AlertCircle,
  Sun,
  Moon,
  Eye,
  Palette,
} from 'lucide-react';
import { AppTheme } from '../types';

export const AUTHORIZED_ADMIN_EMAILS = [
  'aditya.kumar3@pw.live',
  'rajni.mamgai@pw.live',
  'behuman93adi@gmail.com',
  'ahsan.khan@pw.live',
  'ritika.sinha@pw.live',
];

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInUserEmail: string;
  onUpdateUserEmail: (email: string) => void;
  selectedMentor: string;
  onUpdateSelectedMentor: (mentor: string) => void;
  availableMentors: string[];
  currentTheme?: AppTheme;
  onUpdateTheme?: (theme: AppTheme) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  loggedInUserEmail,
  onUpdateUserEmail,
  selectedMentor,
  onUpdateSelectedMentor,
  availableMentors,
  currentTheme = 'corporate',
  onUpdateTheme,
}) => {
  const [loginMode, setLoginMode] = useState<'admin' | 'mentor'>('admin');
  const [tempEmail, setTempEmail] = useState(loggedInUserEmail);
  const [tempMentor, setTempMentor] = useState(selectedMentor);
  const [tempTheme, setTempTheme] = useState<AppTheme>(currentTheme);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isCurrentAdmin = AUTHORIZED_ADMIN_EMAILS.some(
    (e) => e.toLowerCase() === loggedInUserEmail.trim().toLowerCase()
  );

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempEmail(loggedInUserEmail);
      setTempMentor(selectedMentor);
      setTempTheme(currentTheme);
      setErrorMessage(null);
      setSuccessToast(null);
      setLoginMode(isCurrentAdmin ? 'admin' : 'mentor');
    }
  }, [isOpen, loggedInUserEmail, selectedMentor, isCurrentAdmin, currentTheme]);

  if (!isOpen) return null;

  const handleLogout = () => {
    setTempEmail('');
    setTempMentor('');
    onUpdateUserEmail('');
    onUpdateSelectedMentor('');
    setErrorMessage(null);
    setSuccessToast('Logged out successfully! Session cleared.');
    setTimeout(() => {
      setSuccessToast(null);
    }, 2000);
  };

  const deduplicatedMentors = Array.from(
    new Set(availableMentors.map((m) => (m ? m.trim() : '')))
  )
    .filter(Boolean)
    .sort();

  const handleThemeChange = (theme: AppTheme) => {
    setTempTheme(theme);
    if (onUpdateTheme) {
      onUpdateTheme(theme);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = tempEmail.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter a valid official email address.');
      return;
    }

    if (onUpdateTheme) {
      onUpdateTheme(tempTheme);
    }

    if (loginMode === 'admin') {
      const isAuthAdmin = AUTHORIZED_ADMIN_EMAILS.some(
        (e) => e.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (!isAuthAdmin) {
        setErrorMessage(
          'Access Restricted: Entered email is not authorized for Admin privileges. Please use an authorized email or log in under Mentor Login.'
        );
        return;
      }

      onUpdateUserEmail(cleanEmail);
      onUpdateSelectedMentor(''); // Full admin view across all mentors
      setSuccessToast('Admin Login Successful! Full Academic Head access granted.');
    } else {
      onUpdateUserEmail(cleanEmail);
      onUpdateSelectedMentor(tempMentor);
      setSuccessToast(
        `Mentor Login Successful! ${
          tempMentor ? `Filtered to Mentor: ${tempMentor}` : 'All Mentors Overview Mode'
        }`
      );
    }

    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs text-slate-700">
        {/* Header with Branding */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-xl border border-slate-700/80 shrink-0 flex items-center justify-center">
              <img
                src="https://www.pwgulf.com/_next/static/media/pw-gulf-logo.00277f9d.svg"
                alt="PW Gulf Logo"
                className="h-6 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                PWGulf Teacher Dashboard
              </h3>
              <p className="text-[11px] text-indigo-300 font-medium">
                Official Staff & Academic Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Mode Selector Tabs */}
        <div className="p-1 bg-slate-100 border-b border-slate-200 grid grid-cols-2 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginMode('admin');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'admin'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${loginMode === 'admin' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('mentor');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'mentor'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <User className={`w-3.5 h-3.5 ${loginMode === 'mentor' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Mentor Login</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
          {/* Mode Info Alert */}
          {loginMode === 'admin' ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-emerald-900">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-black text-xs block text-emerald-950">
                  Restricted Admin Portal
                </span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Enter your official authorized email address. Admin access grants full ticket creation, task dispatch, and multi-sheet analytics.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2.5 text-amber-900">
              <User className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-black text-xs block text-amber-950">
                  Mentor Portal Access
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Enter your email and select your Mentor name from the dropdown to focus on your assigned students.
                </p>
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Official Email Address:</span>
            </label>
            <input
              type="email"
              required
              value={tempEmail}
              onChange={(e) => {
                setTempEmail(e.target.value);
                setErrorMessage(null);
              }}
              placeholder={
                loginMode === 'admin'
                  ? 'e.g. name@pw.live'
                  : 'e.g. mentor@schoolmentors.org'
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs font-bold text-slate-900 focus:outline-none transition-all"
            />
          </div>

          {/* Mentor Dropdown for Mentor Mode */}
          {loginMode === 'mentor' && (
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 block text-xs flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Select Your Mentor Name:</span>
              </label>
              <select
                value={tempMentor}
                onChange={(e) => setTempMentor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition-all"
              >
                <option value="">-- All Mentors (Overview) --</option>
                {deduplicatedMentors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dashboard Visual Theme Setting */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="font-extrabold text-slate-900 block text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dashboard Visual Theme:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Visual Comfort</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Corporate Blue */}
              <button
                type="button"
                onClick={() => handleThemeChange('corporate')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  tempTheme === 'corporate'
                    ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 shadow-2xs font-extrabold'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className={`w-4 h-4 ${tempTheme === 'corporate' ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white" />
                </div>
                <div>
                  <span className="font-black text-[11px] block leading-tight">Corporate Blue</span>
                  <span className="text-[9px] text-slate-500 block">Light Default</span>
                </div>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  tempTheme === 'dark'
                    ? 'bg-slate-900 border-indigo-500 text-white ring-2 ring-indigo-500/20 shadow-2xs font-extrabold'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon className={`w-4 h-4 ${tempTheme === 'dark' ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600" />
                </div>
                <div>
                  <span className="font-black text-[11px] block leading-tight">Dark Mode</span>
                  <span className="text-[9px] text-slate-400 block">Eye Comfort</span>
                </div>
              </button>

              {/* High Contrast */}
              <button
                type="button"
                onClick={() => handleThemeChange('contrast')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  tempTheme === 'contrast'
                    ? 'bg-black border-amber-400 text-white ring-2 ring-amber-400/30 shadow-2xs font-extrabold'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Eye className={`w-4 h-4 ${tempTheme === 'contrast' ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-amber-300" />
                </div>
                <div>
                  <span className="font-black text-[11px] block leading-tight">High Contrast</span>
                  <span className="text-[9px] text-slate-400 block">Max Clarity</span>
                </div>
              </button>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 font-medium text-xs rounded-xl flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Toast Alert */}
          {successToast && (
            <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Logout current user and clear stored login session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Logout</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-extrabold text-white transition-all shadow-md flex items-center space-x-1.5 cursor-pointer ${
                  loginMode === 'admin'
                    ? 'bg-emerald-700 hover:bg-emerald-600'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <span>{loginMode === 'admin' ? 'Login as Admin' : 'Login as Mentor'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

