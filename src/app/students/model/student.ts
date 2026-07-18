export interface Student {
  id : number;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  motherName?: string;
  gender?: string;
  rollNo?: number;
  email?: string;
  mobile?: string;
  address?: string;
  aadhar?: string;
  photo?: string;
  photoUrl?:string;
  country?: string;
  state?: string;
  city?: string;
  class?: number;
  section?: number;
  dob?: Date;
  addDate: Date;
  modDate?: Date;
  isDel?: number;
  isActive?: number;
  sId?: string;

}

export interface StudentView {
  id : number;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  motherName?: string;
  gender?: string;
  rollNo?: number;
  email?: string;
  mobile?: string;
  address?: string;
  aadhar?: string;
  photo?: string;
  country?: string;
  state?: string;
  city?: string;
  className?: string;
  sectionName?: string;
  dob?: Date;
  attendanceStatus:boolean
}
