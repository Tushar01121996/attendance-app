import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StudentService } from '../student.service';
import { Student } from '../model/student';
import { Router } from '@angular/router';
import { Class, Section } from '../model/class';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-student-registration',
   standalone: true,
   imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './student-registration.component.html',
  styleUrl: './student-registration.component.scss'
})
export class StudentRegistrationComponent implements OnInit {
  studentForm: FormGroup;
  genders = ['Male', 'Female', 'Other'];
  classes : Class[] =[];//['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
  sections: Section[] = [];
  selectedClassId: number | null = null;
  selectedSectionId: number | null = null;
  today : Date = new Date();
  selectedFile: File | null = null;
  photoPreviewUrl: string | ArrayBuffer | null = null;

  currentStep = 1;
  steps = [
    { id: 1, label: 'Personal', icon: 'i-user-plus' },
    { id: 2, label: 'Contact', icon: 'i-bell' },
    { id: 3, label: 'Academic', icon: 'i-check-square' },
    { id: 4, label: 'Address', icon: 'i-home' },
    { id: 5, label: 'Identity', icon: 'i-grid' }
  ];


  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router,
    private location : Location,
    private authService : AuthService
  ) {
    this.studentForm = this.fb.group({
      //Personal Details
      id:[0],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      fatherName: [''],
      motherName: [''],
      gender: ['', Validators.required],
      rollNo: [null, [Validators.required, Validators.min(1)]],
      //Contact Details
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      //Address
      address: ['', Validators.required],
      aadhar: ['', [Validators.pattern(/^\d{12}$/)]],
      photo: [''],
      country: ['India'], // default value
      state: ['',Validators.required],
      city: ['',Validators.required],
      class: ['', Validators.required],
      section: ['',Validators.required],
      dob: ['2017-09-10T07:05:58.883Z'],
      isDel :[0],
      isActive :[0],
      sId:['S120']
    });
  }
  ngOnInit(){
    this.loadClasses();
  }
  loadClasses():void{
      this.studentService.getClass().subscribe((clas : Class[])=>{
      this.classes = clas;
    })
  }
  onClassChange(): void {
    const classId = this.studentForm.get('class')?.value;
    if (classId) {
        this.studentService.getSectionsByClassId(classId).subscribe({
        next: (data) => {
          this.sections = data;
        },
        error: (err) => console.error('Error loading sections', err)
      });
    } else {
      this.sections = [];
    }
  }
  onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    this.selectedFile = file;

    // preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.studentForm.patchValue({ photoUrl: e.target.result });
      this.photoPreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  }

  // Getters for cleaner template access
  get firstName() { return this.studentForm.get('firstName'); }
  get lastName() { return this.studentForm.get('lastName'); }
  get email() { return this.studentForm.get('email'); }
  get mobile() { return this.studentForm.get('mobile'); }
  get gender() { return this.studentForm.get('gender'); }
  get className() { return this.studentForm.get('class'); }
  get dob() { return this.studentForm.get('dob'); }

isValid(fields: string[]): boolean {
  return fields.every(field => !!this.studentForm.get(field)?.valid);
}
// Step validations
isPersonalValid(): boolean {
  return this.isValid(['firstName', 'lastName', 'dob', 'gender']);
}

isContactValid(): boolean {
  return this.isValid(['email', 'mobile']);
}

isAcademicValid(): boolean {
  return this.isValid(['class', 'section', 'rollNo']);
}

isAddressValid(): boolean {
  return this.isValid(['address', 'city', 'state', 'country']);
}

isIdentityValid(): boolean {
  return this.isValid(['aadhar', 'photo']);
}

  stepValidity: Record<number, () => boolean> = {
    1: () => this.isPersonalValid(),
    2: () => this.isContactValid(),
    3: () => this.isAcademicValid(),
    4: () => this.isAddressValid(),
    5: () => true
  };

  isStepComplete(stepId: number): boolean {
    return this.stepValidity[stepId] ? this.stepValidity[stepId]() : false;
  }

  goToStep(stepId: number): void {
    // Only allow jumping to a step if all prior steps are valid (keeps it "linear" like before)
    for (let i = 1; i < stepId; i++) {
      if (!this.isStepComplete(i)) return;
    }
    this.currentStep = stepId;
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit() {
    debugger
    if (this.studentForm.valid) {
      console.log(this.studentForm.value);
      const formData = new FormData();

  // append fields
    Object.keys(this.studentForm.value).forEach(key => {
     if (this.studentForm.value[key] !== null && this.studentForm.value[key] !== undefined) {
      formData.append(key, this.studentForm.value[key]);
     }
    });

  // append file
    if (this.selectedFile) {
      formData.append("photo", this.selectedFile, this.selectedFile.name);
    }

      const newStudent : Student = this.studentForm.value;
      this.studentService.addStudent(formData).subscribe({
      next: (response) => {
        console.log("✅ API success:", response);
         this.router.navigate(['/students/list']);
        // this.studentForm.reset();
      },
      error: (err) => {
        console.error("❌ API error:", err);
      }
    });
    }
  }
  goBack():void{
    this.location.back();
  }
  goToStudentList():void{
    this.router.navigate(['/students/list']);
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}