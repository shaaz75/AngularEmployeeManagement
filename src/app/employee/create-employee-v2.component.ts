 import { Component, OnInit } from '@angular/core';
// Import FormGroup and FormControl classes
import { FormGroup,FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import {CustomValidators} from '../shared/custom.validators'
import { Key } from 'protractor';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from './employee.service';
import { IEmployee } from './IEmployee';
import { ISkill } from './ISkill';

@Component({
  selector: 'app-create-employee-v2',
  templateUrl: './create-employee-v2.component.html',
  styleUrls: ['./create-employee-v2.component.css']
})
export class CreateEmployeeV2Component implements OnInit {
  // This FormGroup contains fullName and Email form controls
  employeeForm: FormGroup;
  employee:IEmployee;
  pageTitle: string;
  fullNameLength=0;

  constructor(private fb:FormBuilder,
              private route:ActivatedRoute,
              private employeeService:EmployeeService,
              private router: Router) { }

  // This object will hold the messages to be displayed to the user
// Notice, each key in this object has the same name as the
// corresponding form control
// Include phone property
formErrors = {
};

// Include required error message for phone form control
validationMessages = {
  'fullName': {
    'required': 'Full Name is required.',
    'minlength': 'Full Name must be greater than 2 characters',
    'maxlength': 'Full Name must be less than 10 characters.',
  },
  'email': {
    'required': 'Email is required.',
    'emailDomain': 'Email domian should be niksaj.com'
  },
  'confirmEmail': {
    'required': 'Confirm Email is required.'
  },
  'emailGroup': {
    'emailMismatch': 'Email and Confirm Email do not match.'
  },
  'phone': {
    'required': 'Phone is required.'
  }
};

  // Initialise the FormGroup with the 2 FormControls we need.
  // ngOnInit ensures the FormGroup and it's form controls are
  // created when the component is initialised
  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      const empId = +params.get('id');
      if (empId) {
        this.pageTitle = 'Edit Employee';
        this.getEmployee(empId);
      } else {
        this.pageTitle = 'Create Employee';
        this.employee = {
          id: null,
          fullName: '',
          contactPreference: '',
          email: '',
          phone: null,
          skills: []
        };
      }
    });

    // Modify the code to include required validators on
    // all form controls
    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required,
      Validators.minLength(2), Validators.maxLength(10)]],
      contactPreference: ['email'],
      emailGroup: this.fb.group({
        email: ['', [Validators.required,CustomValidators.emailDomain('niksaj.com')]],
        confirmEmail: ['', [Validators.required]],
      }, { validator: matchEmail }),
      phone: [''],
      skills: this.fb.array([
        this.addSkillFormGroup()
      ]),
    });

    this.employeeForm.valueChanges.subscribe((data)=>{
      this.logValidationErrors(this.employeeForm);
    });

    this.employeeForm.get('contactPreference').valueChanges.subscribe((data: string) => {
     this.onContactPrefernceChange(data);

});


    // this.employeeForm.get('fullName').valueChanges.subscribe((value:string)=> { this.fullNameLength=value.length});
}

getEmployee(id: number) {
  this.employeeService.getEmployee(id)
    .subscribe(
      (employee: IEmployee) => {
        // Store the employee object returned by the
        // REST API in the employee property
        this.employee = employee;
        this.editEmployee(employee);
      },
      (err: any) => console.log(err)
    );
}

editEmployee(employee: IEmployee) {
  this.employeeForm.patchValue({
    fullName: employee.fullName,
    contactPreference: employee.contactPreference,
    emailGroup: {
      email: employee.email,
      confirmEmail: employee.email
    },
    phone: employee.phone
  });

  this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
}

setExistingSkills(skillSets: ISkill[]): FormArray {
  const formArray = new FormArray([]);
  skillSets.forEach(s => {
    formArray.push(this.fb.group({
      skillName: s.skillName,
      experienceInYears: s.experienceInYears,
      proficiency: s.proficiency
    }));
  });

  return formArray;
}
  // If the Selected Radio Button value is "phone", then add the
// required validator function otherwise remove it
onContactPrefernceChange(selectedValue: string) {

  const phoneFormControl = this.employeeForm.get('phone');
  const emailFormControl = this.employeeForm.get('emailGroup').get('email');
  
  if (selectedValue === 'phone') {
    phoneFormControl.setValidators(Validators.required);
    emailFormControl.clearValidators();

  } else {
    emailFormControl.setValidators([Validators.required,CustomValidators.emailDomain('niksaj.com')]);
    phoneFormControl.clearValidators();
  }
  emailFormControl.updateValueAndValidity();
  phoneFormControl.updateValueAndValidity();
}

  logKeyValuePairs(group: FormGroup,isDisabled:boolean): void {
    // loop through each key in the FormGroup
    Object.keys(group.controls).forEach((key: string) => {
      // Get a reference to the control using the FormGroup.get() method
      const abstractControl = group.get(key);
      // If the control is an instance of FormGroup i.e a nested FormGroup
      // then recursively call this same method (logKeyValuePairs) passing it
      // the FormGroup so we can get to the form controls in it
      if (abstractControl instanceof FormGroup) {
        this.logKeyValuePairs(abstractControl,isDisabled);
        // If the control is not a FormGroup then we know it's a FormControl
      } else {
         console.log('Key = ' + key + ' && Value = ' + abstractControl.value);
        if(isDisabled) {
        abstractControl.disable();
        }
        else{
          abstractControl.enable();
        }
      }
    });
  }

  logValidationErrors(group: FormGroup = this.employeeForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
  
      this.formErrors[key] = '';
      // abstractControl.value !== '' (This condition ensures if there is a value in the
      // form control and it is not valid, then display the validation error)
      if (abstractControl && !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty || abstractControl.value !== '')) {
        const messages = this.validationMessages[key];
  
        for (const errorKey in abstractControl.errors) {
          if (errorKey) {
            this.formErrors[key] += messages[errorKey] + ' ';
          }
        }
      }
  
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      }
    });
  }

  onSubmit(): void {
    this.mapFormValuesToEmployeeModel();
  
    if (this.employee.id) {
      this.employeeService.updateEmployee(this.employee).subscribe(
        () => this.router.navigate(['list']),
        (err: any) => console.log(err)
      );
    } else {
      this.employeeService.addEmployee(this.employee).subscribe(
        () => this.router.navigate(['list']),
        (err: any) => console.log(err)
      );
    }
  }

  mapFormValuesToEmployeeModel() {
    this.employee.fullName = this.employeeForm.value.fullName;
    this.employee.contactPreference = this.employeeForm.value.contactPreference;
    this.employee.email = this.employeeForm.value.emailGroup.email;
    this.employee.phone = this.employeeForm.value.phone;
    this.employee.skills = this.employeeForm.value.skills;
  }

  onLoadDataClick(): void {
    this.employeeForm.setValue({
      fullName: 'Niksaj Technologies',
      email: 'contact@niksaj.com',
      skills: {
        skillName: 'C#',
        experienceInYears: 5,
        proficiency: 'beginner'
      }
    });
  }

  addSkillButtonClick():void{
   (<FormArray> this.employeeForm.get('skills')).push(this.addSkillFormGroup())
   console.log(this.employeeForm.controls);
  }

  removeSkillButtonClick(skillGroupIndex: number): void {
    const skillsFormArray = <FormArray>this.employeeForm.get('skills');
    skillsFormArray.removeAt(skillGroupIndex);
    skillsFormArray.markAsDirty();
    skillsFormArray.markAsTouched();
  }

  addSkillFormGroup():FormGroup{
    return this.fb.group({
      skillName: ['', Validators.required],
      experienceInYears: ['', Validators.required],
      proficiency: ['', Validators.required]
      }
    )
  }
  onDisableClick(): void {
    this.logKeyValuePairs(this.employeeForm,true);
  }

  onResetClick():void{
    this.logKeyValuePairs(this.employeeForm,false)
    this.employeeForm.reset();
  }
}

      // Nested form group (emailGroup) is passed as a parameter. Retrieve email and
// confirmEmail form controls. If the values are equal return null to indicate
// validation passed otherwise an object with emailMismatch key. Please note we
// used this same key in the validationMessages object against emailGroup
// property to store the corresponding validation error message
function matchEmail(group: AbstractControl): { [key: string]: any } | null {
  const emailControl = group.get('email');
  const confirmEmailControl = group.get('confirmEmail');
  // If confirm email control value is not an empty string, and if the value
  // does not match with email control value, then the validation fails
  if (emailControl.value === confirmEmailControl.value
    || (confirmEmailControl.pristine && confirmEmailControl.value === '')) {
    return null;
  } else {
    return { 'emailMismatch': true };
  }
}