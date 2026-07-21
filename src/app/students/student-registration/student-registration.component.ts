import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StudentService } from '../student.service';
import { Student } from '../model/student';
import { Router, ActivatedRoute } from '@angular/router';
import { Class, Section } from '../model/class';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environment/environment';


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

  isEditMode = false;
  editStudentId: number | null = null;
  private pendingClassName: string | null = null;
  private pendingSectionName: string | null = null;


  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router,
    private location : Location,
    private authService : AuthService,
    private route: ActivatedRoute
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
      class: [null, Validators.required],
      section: [null,Validators.required],
      dob: ['2017-09-10T07:05:58.883Z'],
      isDel :[0],
      isActive :[0],
      sId:['S120']
    });
  }
  ngOnInit(){
    this.loadClasses();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editStudentId = Number(idParam);

      const navState = history.state as { student?: any } | undefined;
      if (navState?.student) {
        this.populateForm(navState.student);
      } else {
        this.studentService.getStudentById(this.editStudentId).subscribe({
          next: (data) => this.populateForm(data),
          error: (err) => console.error('Error loading student for edit', err)
        });
      }
    }
  }
  loadClasses():void{
      this.studentService.getClass().subscribe((clas : Class[])=>{
      this.classes = clas;
      if (this.pendingClassName) {
        this.matchClassAndSection(this.pendingClassName, this.pendingSectionName);
      }
    })
  }

  /** Pre-fills the form when editing an existing student. */
  private populateForm(student: any): void {
    this.studentForm.patchValue({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      fatherName: student.fatherName,
      motherName: student.motherName,
      gender: student.gender,
      rollNo: student.rollNo,
      email: student.email,
      mobile: student.mobile,
      address: student.address,
      aadhar: student.aadhar,
      country: student.country || 'India',
      state: student.state,
      city: student.city,
      dob: student.dob,
      isDel: student.isDel ?? 0,
      isActive: student.isActive ?? 1,
      sId: student.sId ?? 'S120'
    });

    if (student.photo) {
      this.photoPreviewUrl = environment.domainUrl + student.photo;
    }

    // StudentView only exposes className/sectionName (text), not their numeric
    // ids, so we resolve the matching Class/Section records by name once the
    // classes list (and then the sections list) has loaded.
    if (student.className) {
      if (this.classes.length) {
        this.matchClassAndSection(student.className, student.sectionName ?? null);
      } else {
        this.pendingClassName = student.className;
        this.pendingSectionName = student.sectionName ?? null;
      }
    }
  }

  private matchClassAndSection(className: string, sectionName: string | null): void {
    const matchedClass = this.classes.find(c => c.className === className);
    if (!matchedClass) return;

    this.studentForm.patchValue({ class: matchedClass.id });

    this.studentService.getSectionsByClassId(matchedClass.id).subscribe({
      next: (sections) => {
        this.sections = sections;
        if (sectionName) {
          const matchedSection = sections.find(s => s.sectionName === sectionName);
          if (matchedSection) {
            this.studentForm.patchValue({ section: matchedSection.sectionId });
          }
        }
      },
      error: (err) => console.error('Error loading sections for edit', err)
    });

    this.pendingClassName = null;
    this.pendingSectionName = null;
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
    if (this.studentForm.valid) {
      const formData = new FormData();

  // append fields (skip 'photo' — that's the text control leftover from an
  // old preview-binding; the real photo transfer happens via selectedFile
  // below. Appending it as an empty string would overwrite the existing
  // photo path on the server whenever no new file is chosen during edit.)
    Object.keys(this.studentForm.value).forEach(key => {
     if (key === 'photo') return;
     if (this.studentForm.value[key] !== null && this.studentForm.value[key] !== undefined) {
      formData.append(key, this.studentForm.value[key]);
     }
    });

  // append file
    if (this.selectedFile) {
      formData.append("photo", this.selectedFile, this.selectedFile.name);
    }

      this.studentService.addStudent(formData).subscribe({
      next: (response) => {
        console.log("✅ API success:", response);
         this.router.navigate(['/students/list']);
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