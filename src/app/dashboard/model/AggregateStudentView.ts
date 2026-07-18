export interface AggregateStudentView {
    TotalStudents : number,
    PresentStudents : number,
    AbsentStudents : number
}
export interface holiday {
    id : number,
    holidayDate : Date,
    description : string,
    isActive : boolean,
    backgroundImage:string
}
export interface topPerformingStudents {
  id: number;
  name: string;
  photo: string;
  presentCount: string;
  monthName: string;
  totalDaysInMonth: string;
  attendanceRatio: string;

}