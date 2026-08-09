import { AttendanceRecord, ObjectiveRecord, SubjectiveRecord, DiscontinuationRecord, FollowupLog } from '../types';

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Week 1
  { id: 'att-1', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Nishant Aditya (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 5, totalClasses: 5, attendancePercentage: 100, mentorName: 'Vibha Raj' },
  { id: 'att-2', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Prutha Parikshit Mulye (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 5, totalClasses: 5, attendancePercentage: 100, mentorName: 'Vibha Raj' },
  { id: 'att-3', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Spruha Amol Mahajan (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 5, totalClasses: 5, attendancePercentage: 100, mentorName: 'Vibha Raj' },
  { id: 'att-4', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Ibrahim Touhid Qazmi (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 4, totalClasses: 5, attendancePercentage: 80, mentorName: 'Vibha Raj' },
  { id: 'att-5', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Sambhav Sandip Sen (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 5, totalClasses: 5, attendancePercentage: 100, mentorName: 'Vibha Raj' },
  { id: 'att-6', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Abhivadya Roy Chauhan (UAE)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 3, totalClasses: 5, attendancePercentage: 60, mentorName: 'Rahul Sharma' },
  { id: 'att-7', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Saanvi Sushilkumar Shinde (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 2, totalClasses: 5, attendancePercentage: 40, mentorName: 'Rahul Sharma' },
  { id: 'att-8', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Shauryaveersinh Ankit Chawda (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 3, totalClasses: 5, attendancePercentage: 60, mentorName: 'Rahul Sharma' },
  { id: 'att-9', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Mohammud Rahil Tanvir (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 0, totalClasses: 5, attendancePercentage: 0, mentorName: 'Vibha Raj' },
  { id: 'att-10', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Mohammad Mahabid Khan (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 0, totalClasses: 5, attendancePercentage: 0, mentorName: 'Vibha Raj' },
  { id: 'att-11', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Vedasri Guttula (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 1, totalClasses: 5, attendancePercentage: 20, mentorName: 'Ananya Verma' },
  { id: 'att-12', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Niranjana (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 0, totalClasses: 5, attendancePercentage: 0, mentorName: 'Ananya Verma' },
  { id: 'att-13', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Taanush Dhiraj Sharma (UAE)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 0, totalClasses: 5, attendancePercentage: 0, mentorName: 'Vivek Kumar' },
  { id: 'att-14', week: 'Week1', date: '09 Mar - 15 Mar', studentName: 'Mohammud Rayyan Ifraz (BAHRAIN)', grade: '9', section: 'B', stream: 'PCMB', batch: 'Achiever', totalPresent: 0, totalClasses: 5, attendancePercentage: 0, mentorName: 'Vivek Kumar' },

  // Week 2
  { id: 'att-15', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Nishant Aditya (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 5, totalClasses: 5, attendancePercentage: 100, mentorName: 'Vibha Raj' },
  { id: 'att-16', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Prutha Parikshit Mulye (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 5, totalClasses: 5, attendancePercentage: 100, mentorName: 'Vibha Raj' },
  { id: 'att-17', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Spruha Amol Mahajan (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 4, totalClasses: 5, attendancePercentage: 80, mentorName: 'Vibha Raj' },
  { id: 'att-18', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Abhivadya Roy Chauhan (UAE)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 3, totalClasses: 5, attendancePercentage: 60, mentorName: 'Rahul Sharma' },
  { id: 'att-19', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Saanvi Sushilkumar Shinde (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 2, totalClasses: 5, attendancePercentage: 40, mentorName: 'Rahul Sharma' },
  { id: 'att-20', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Mohammud Rahil Tanvir (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 0, totalClasses: 5, attendancePercentage: 0, mentorName: 'Vibha Raj' },
  { id: 'att-21', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Niranjana (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 0, totalClasses: 5, attendancePercentage: 0, mentorName: 'Ananya Verma' },
  { id: 'att-22', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Taanush Dhiraj Sharma (UAE)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', totalPresent: 0, totalClasses: 5, attendancePercentage: 0, mentorName: 'Vivek Kumar' },
  { id: 'att-23', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Mohammud Rayyan Ifraz (BAHRAIN)', grade: '9', section: 'B', stream: 'PCMB', batch: 'Achiever', totalPresent: 0, totalClasses: 5, attendancePercentage: 0, mentorName: 'Vivek Kumar' },
  { id: 'att-24', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Aarav Gupta (OMAN)', grade: '9', section: 'B', stream: 'PCM', batch: 'Achiever', totalPresent: 5, totalClasses: 5, attendancePercentage: 100, mentorName: 'Vivek Kumar' },
  { id: 'att-25', week: 'Week2', date: '16 Mar - 22 Mar', studentName: 'Ananya Patel (UAE)', grade: '10', section: 'C', stream: 'PCB', batch: 'Zenith', totalPresent: 4, totalClasses: 5, attendancePercentage: 80, mentorName: 'Rahul Sharma' }
];

export const INITIAL_OBJECTIVE: ObjectiveRecord[] = [
  { id: 'obj-1', objectiveName: 'Objective Test - 01', studentName: 'Nishant Aditya (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 36, chemistry: 40, maths: 36, zoology: null, botany: null, sst: null, biology: 40, english: null, marksAchieved: 152, subjectsCount: 4, totalMarks: 160, testPercentage: 95.0, mentorName: 'Vibha Raj' },
  { id: 'obj-2', objectiveName: 'Objective Test - 01', studentName: 'Prutha Parikshit Mulye (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 40, chemistry: 36, maths: 40, zoology: null, botany: null, sst: null, biology: 40, english: null, marksAchieved: 156, subjectsCount: 4, totalMarks: 160, testPercentage: 97.5, mentorName: 'Vibha Raj' },
  { id: 'obj-3', objectiveName: 'Objective Test - 01', studentName: 'Spruha Amol Mahajan (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 24, chemistry: 24, maths: 20, zoology: null, botany: null, sst: null, biology: 32, english: null, marksAchieved: 100, subjectsCount: 4, totalMarks: 160, testPercentage: 62.5, mentorName: 'Vibha Raj' },
  { id: 'obj-4', objectiveName: 'Objective Test - 01', studentName: 'Ibrahim Touhid Qazmi (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 36, chemistry: 40, maths: 36, zoology: null, botany: null, sst: null, biology: 36, english: null, marksAchieved: 148, subjectsCount: 4, totalMarks: 160, testPercentage: 92.5, mentorName: 'Vibha Raj' },
  { id: 'obj-5', objectiveName: 'Objective Test - 01', studentName: 'Sambhav Sandip Sen (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 36, chemistry: 32, maths: 40, zoology: null, botany: null, sst: null, biology: 40, english: null, marksAchieved: 148, subjectsCount: 4, totalMarks: 160, testPercentage: 92.5, mentorName: 'Vibha Raj' },
  { id: 'obj-6', objectiveName: 'Objective Test - 01', studentName: 'Abhivadya Roy Chauhan (UAE)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 20, chemistry: 18, maths: 22, zoology: null, botany: null, sst: null, biology: 20, english: null, marksAchieved: 80, subjectsCount: 4, totalMarks: 160, testPercentage: 50.0, mentorName: 'Rahul Sharma' },
  { id: 'obj-7', objectiveName: 'Objective Test - 01', studentName: 'Saanvi Sushilkumar Shinde (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 16, chemistry: 16, maths: 20, zoology: null, botany: null, sst: null, biology: 20, english: null, marksAchieved: 72, subjectsCount: 4, totalMarks: 160, testPercentage: 45.0, mentorName: 'Rahul Sharma' },
  { id: 'obj-8', objectiveName: 'Objective Test - 01', studentName: 'Shauryaveersinh Ankit Chawda (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 22, chemistry: 20, maths: 24, zoology: null, botany: null, sst: null, biology: 22, english: null, marksAchieved: 88, subjectsCount: 4, totalMarks: 160, testPercentage: 55.0, mentorName: 'Rahul Sharma' },
  { id: 'obj-9', objectiveName: 'Objective Test - 01', studentName: 'Mohammud Rahil Tanvir (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 0, chemistry: 0, maths: 0, zoology: null, botany: null, sst: null, biology: 0, english: null, marksAchieved: 0, subjectsCount: 4, totalMarks: 160, testPercentage: 0.0, mentorName: 'Vibha Raj' },
  { id: 'obj-10', objectiveName: 'Objective Test - 01', studentName: 'Mohammad Mahabid Khan (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 0, chemistry: 0, maths: 0, zoology: null, botany: null, sst: null, biology: 0, english: null, marksAchieved: 0, subjectsCount: 4, totalMarks: 160, testPercentage: 0.0, mentorName: 'Vibha Raj' },
  { id: 'obj-11', objectiveName: 'Objective Test - 01', studentName: 'Vedasri Guttula (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 12, chemistry: 10, maths: 12, zoology: null, botany: null, sst: null, biology: 14, english: null, marksAchieved: 48, subjectsCount: 4, totalMarks: 160, testPercentage: 30.0, mentorName: 'Ananya Verma' },
  { id: 'obj-12', objectiveName: 'Objective Test - 01', studentName: 'Niranjana (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 0, chemistry: 0, maths: 0, zoology: null, botany: null, sst: null, biology: 0, english: null, marksAchieved: 0, subjectsCount: 4, totalMarks: 160, testPercentage: 0.0, mentorName: 'Ananya Verma' },
  { id: 'obj-13', objectiveName: 'Objective Test - 01', studentName: 'Taanush Dhiraj Sharma (UAE)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 0, chemistry: 0, maths: 0, zoology: null, botany: null, sst: null, biology: 0, english: null, marksAchieved: 0, subjectsCount: 4, totalMarks: 160, testPercentage: 0.0, mentorName: 'Vivek Kumar' },
  { id: 'obj-14', objectiveName: 'Objective Test - 01', studentName: 'Mohammud Rayyan Ifraz (BAHRAIN)', grade: '9', section: 'B', stream: 'PCMB', batch: 'Achiever', physics: 0, chemistry: 0, maths: 0, zoology: null, botany: null, sst: null, biology: 0, english: null, marksAchieved: 0, subjectsCount: 4, totalMarks: 160, testPercentage: 0.0, mentorName: 'Vivek Kumar' },
  { id: 'obj-15', objectiveName: 'Objective Test - 01', studentName: 'Aarav Gupta (OMAN)', grade: '9', section: 'B', stream: 'PCM', batch: 'Achiever', physics: 38, chemistry: 38, maths: 40, zoology: null, botany: null, sst: 36, biology: null, english: 38, marksAchieved: 190, subjectsCount: 5, totalMarks: 200, testPercentage: 95.0, mentorName: 'Vivek Kumar' },
  { id: 'obj-16', objectiveName: 'Objective Test - 01', studentName: 'Ananya Patel (UAE)', grade: '10', section: 'C', stream: 'PCB', batch: 'Zenith', physics: 28, chemistry: 30, maths: null, zoology: 32, botany: 30, sst: null, biology: null, english: 35, marksAchieved: 155, subjectsCount: 5, totalMarks: 200, testPercentage: 77.5, mentorName: 'Rahul Sharma' },

  // Objective Test - 02 records for multi-test coverage
  { id: 'obj-17', objectiveName: 'Objective Test - 02', studentName: 'Nishant Aditya (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 38, chemistry: 40, maths: 38, zoology: null, botany: null, sst: null, biology: 38, english: null, marksAchieved: 154, subjectsCount: 4, totalMarks: 160, testPercentage: 96.25, mentorName: 'Vibha Raj' },
  { id: 'obj-18', objectiveName: 'Objective Test - 02', studentName: 'Abhivadya Roy Chauhan (UAE)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 24, chemistry: 22, maths: 28, zoology: null, botany: null, sst: null, biology: 26, english: null, marksAchieved: 100, subjectsCount: 4, totalMarks: 160, testPercentage: 62.5, mentorName: 'Rahul Sharma' },
  { id: 'obj-19', objectiveName: 'Objective Test - 02', studentName: 'Saanvi Sushilkumar Shinde (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: null, chemistry: null, maths: null, zoology: null, botany: null, sst: null, biology: null, english: null, marksAchieved: 0, subjectsCount: 0, totalMarks: 160, testPercentage: 0.0, mentorName: 'Rahul Sharma' },
  { id: 'obj-20', objectiveName: 'Objective Test - 02', studentName: 'Prutha Parikshit Mulye (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', physics: 38, chemistry: 38, maths: 36, zoology: null, botany: null, sst: null, biology: 40, english: null, marksAchieved: 152, subjectsCount: 4, totalMarks: 160, testPercentage: 95.0, mentorName: 'Vibha Raj' },
];

export const INITIAL_SUBJECTIVE: SubjectiveRecord[] = [
  { id: 'sub-1', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Abhivadya Roy Chauhan (UAE)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 24, percentage: 60.0, mentorName: 'Rahul Sharma' },
  { id: 'sub-2', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Ajay Rajkrishna.G (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 33, percentage: 82.5, mentorName: 'Vibha Raj' },
  { id: 'sub-3', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Aditya Abhilash Raj (KUWAIT)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 40, percentage: 100.0, mentorName: 'Vibha Raj' },
  { id: 'sub-4', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Saanvi Sushilkumar Shinde (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 19, percentage: 47.5, mentorName: 'Rahul Sharma' },
  { id: 'sub-5', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Prutha Parikshit Mulye (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 25, percentage: 62.5, mentorName: 'Vibha Raj' },
  { id: 'sub-6', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Shauryaveersinh Ankit Chawda (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 22, percentage: 55.0, mentorName: 'Rahul Sharma' },
  { id: 'sub-7', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Nishant Aditya (QATAR)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 38, percentage: 95.0, mentorName: 'Vibha Raj' },
  { id: 'sub-8', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Spruha Amol Mahajan (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 28, percentage: 70.0, mentorName: 'Vibha Raj' },
  { id: 'sub-9', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Mohammud Rahil Tanvir (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 0, percentage: 0.0, mentorName: 'Vibha Raj' },
  { id: 'sub-10', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Mohammad Mahabid Khan (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 0, percentage: 0.0, mentorName: 'Vibha Raj' },
  { id: 'sub-11', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Vedasri Guttula (KSA)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 10, percentage: 25.0, mentorName: 'Ananya Verma' },
  { id: 'sub-12', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Niranjana (BAHRAIN)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 0, percentage: 0.0, mentorName: 'Ananya Verma' },
  { id: 'sub-13', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Taanush Dhiraj Sharma (UAE)', grade: '8', section: 'A', stream: 'PCMB', batch: 'Impact', subject: 'Subjective Test - 01 Maths', totalMarks: 40, marksAchieved: 0, percentage: 0.0, mentorName: 'Vivek Kumar' },
  { id: 'sub-14', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Mohammud Rayyan Ifraz (BAHRAIN)', grade: '9', section: 'B', stream: 'PCMB', batch: 'Achiever', subject: 'Subjective Test - 01 Science', totalMarks: 40, marksAchieved: 0, percentage: 0.0, mentorName: 'Vivek Kumar' },
  { id: 'sub-15', week: 'Week1', dateRange: '17-Apr-2026', studentName: 'Aarav Gupta (OMAN)', grade: '9', section: 'B', stream: 'PCM', batch: 'Achiever', subject: 'Subjective Test - 01 Science', totalMarks: 40, marksAchieved: 37, percentage: 92.5, mentorName: 'Vivek Kumar' }
];

export const INITIAL_DISCONTINUATION: DiscontinuationRecord[] = [
  {
    id: 'disc-1',
    studentName: 'Mohammud Rahil Tanvir (BAHRAIN)',
    grade: '8',
    section: 'A',
    stream: 'PCMB',
    batch: 'Impact',
    admissionDate: 'Nov 12, 2025',
    month: 'April 26',
    status: 'Discontinued',
    comment: 'STF- said we will not continue with physics wala as we are not happy with the services after taking admission only call received for fee, he added , there is no any schedule provided after demo classes and randomly you are doing things , tried to resolve his issue but he is not reachable and now not responding',
    mentorComments: 'Tried to reach parent 3 times, call unreached.',
    contact1: '97337002278',
    contact2: '97337111205',
    date: 'Apr 3, 2026',
    mentorName: 'Vibha Raj',
    reasonBucket: 'False commitment / wrong Admission'
  },
  {
    id: 'disc-2',
    studentName: 'Mohammad Mahabid Khan (KSA)',
    grade: '8',
    section: 'A',
    stream: 'PCMB',
    batch: 'Impact',
    admissionDate: 'Jan 18, 2026',
    month: 'June 26',
    status: 'Discontinued',
    comment: 'Moved to PW Offline',
    mentorComments: 'Dropped a message of enquiry, no response',
    contact1: '966580140978',
    contact2: '966580140978',
    date: 'Jun 10, 2026',
    mentorName: 'Vibha Raj',
    reasonBucket: 'Moved to PW Offline / India'
  },
  {
    id: 'disc-3',
    studentName: 'Vedasri Guttula (KSA)',
    grade: '8',
    section: 'A',
    stream: 'PCMB',
    batch: 'Impact',
    admissionDate: 'Mar 14, 2026',
    month: 'May 26',
    status: 'Discontinued',
    comment: 'Having issue with the fee , wants to discontinue as fee is more cheaper in PW india he will join there',
    mentorComments: 'Dropped a message of enquiry, no response',
    contact1: '966543461316',
    contact2: '966564518845',
    date: 'May 4, 2026',
    mentorName: 'Ananya Verma',
    reasonBucket: 'Parent lost job / Financial Issues'
  },
  {
    id: 'disc-4',
    studentName: 'Niranjana (BAHRAIN)',
    grade: '8',
    section: 'A',
    stream: 'PCMB',
    batch: 'Impact',
    admissionDate: 'Mar 14, 2026',
    month: 'May 26',
    status: 'Discontinued',
    comment: 'STM- Having so many issues not happy with the counselor commitments and dont likes the classes will discontinue',
    mentorComments: 'Dropped a message of enquiry, no response',
    contact1: '97333220812',
    contact2: '97339720148',
    date: 'May 4, 2026',
    mentorName: 'Ananya Verma',
    reasonBucket: 'False commitment / wrong Admission'
  },
  {
    id: 'disc-5',
    studentName: 'Taanush Dhiraj Sharma (UAE)',
    grade: '8',
    section: 'A',
    stream: 'PCMB',
    batch: 'Impact',
    admissionDate: 'Mar 24, 2026',
    month: 'May 26',
    status: 'Discontinued',
    comment: 'Offline to Online student, wanted PW to have syllabus according to their school syllabus. Offered several ideas to support student, parent not satisfied and does not want to burden the child. Amount has been refunded',
    mentorComments: 'NA',
    contact1: '971551473800',
    contact2: '971552605816',
    date: 'May 5, 2026',
    mentorName: 'Vivek Kumar',
    reasonBucket: 'Need Offline Classes / Joined other institution'
  },
  {
    id: 'disc-6',
    studentName: 'Mohammud Rayyan Ifraz (BAHRAIN)',
    grade: '9',
    section: 'B',
    stream: 'PCMB',
    batch: 'Achiever',
    admissionDate: 'Nov 12, 2025',
    month: 'May 26',
    status: 'Discontinued',
    comment: 'Parent is not responding , Access revoked , no response',
    mentorComments: 'no response',
    contact1: '97337002278',
    contact2: '97337111205',
    date: 'May 19, 2026',
    mentorName: 'Vivek Kumar',
    reasonBucket: 'Access Revoked / No Contact'
  }
];

export const INITIAL_LOGS: FollowupLog[] = [
  {
    id: 'log-1',
    studentName: 'Mohammud Rahil Tanvir (BAHRAIN)',
    grade: '8',
    section: 'A',
    mentorName: 'Vibha Raj',
    sourceTab: 'ZeroAttendance',
    currentStage: 'In Progress',
    reasonBucket: 'No Response',
    scheduledDoubtDate: '2026-08-10',
    scheduledDoubtTopic: 'Maths & Physics Clarification & Onboarding Call',
    notes: 'Parent expressed dissatisfaction with initial schedule. Scheduled special mentor session.',
    updatedAt: '2026-08-01 10:30',
    history: [
      {
        id: 'hist-1',
        timestamp: '2026-07-28 14:20',
        stage: 'Pending',
        actionBy: 'Vibha Raj',
        note: 'Zero attendance flagged for Week 1.',
        reasonBucket: 'No Response'
      },
      {
        id: 'hist-2',
        timestamp: '2026-08-01 10:30',
        stage: 'In Progress',
        actionBy: 'Vibha Raj',
        note: 'Called parent. Categorized under No Response.',
        scheduledDoubtDate: '2026-08-10',
        scheduledDoubtTopic: 'Maths & Physics Clarification & Onboarding Call',
        reasonBucket: 'No Response'
      }
    ]
  },
  {
    id: 'log-2',
    studentName: 'Saanvi Sushilkumar Shinde (QATAR)',
    grade: '8',
    section: 'A',
    mentorName: 'Rahul Sharma',
    sourceTab: 'Flagged',
    currentStage: 'Doubt Scheduled',
    reasonBucket: 'Academic Concern',
    scheduledDoubtDate: '2026-08-09',
    scheduledDoubtTopic: 'Subjective Maths & Basic Physics Concepts',
    notes: 'Scored 45% Objective and 47.5% Subjective with 40% Attendance. Flagged for urgent academic intervention.',
    updatedAt: '2026-08-03 11:15',
    history: [
      {
        id: 'hist-3',
        timestamp: '2026-08-03 11:15',
        stage: 'Doubt Scheduled',
        actionBy: 'Rahul Sharma',
        note: 'Scheduled 1-on-1 doubt session for Sunday.',
        scheduledDoubtDate: '2026-08-09',
        scheduledDoubtTopic: 'Subjective Maths & Basic Physics Concepts',
        reasonBucket: 'Academic Concern'
      }
    ]
  }
];
