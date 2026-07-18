export interface AttendanceRecord  {
id?: string;
  date: string;       // YYYY-MM-DD
  className: string;
  section?: string;
  studentId: string;
  present: boolean;
  notes?: string;
  markedBy?: string;
}
