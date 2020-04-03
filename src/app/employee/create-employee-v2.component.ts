import { Component, OnInit } from '@angular/core';
// Import FormGroup and FormControl classes
import { FormGroup,FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import {CustomValidators} from '../shared/custom.validators'
import { Key } from 'protractor';

@Component({
  selector: 'app-create-employee-v2',
  templateUrl: './create-employee-v2.component.html',
  styleUrls: ['./create-employee-v2.component.css']
})
export class CreateEmployeeV2Component implements OnInit {
  // This FormGroup contains fullName and Email form controls
  employeeForm: FormGroup;
  fullNameLength=0;

  constructor(private fb:FormBuilder) { }

  // This object will hold the messages to be displayed to the user
// Notice, each key in this object has the same name as the
// corresponding form control
// Include phone property
formErrors = {
  'fullName': '',
  'email': '',
  'confirmEmail':'',
  'emailGroup':'',
  'phone': '',
  'skillName': '',
  'experienceInYears': '',
  'proficiency': ''
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
  },
  'skillName': {
    'required': 'Skill Name is required.',
  },
  'experienceInYears': {
    'required': 'Experience is required.',
  },
  'proficiency': {
    'required': 'Proficiency is required.',
  },
};

  // Initialise the FormGroup with the 2 FormControls we need.
  // ngOnInit ensures the FormGroup and it's form controls are
  // created when the component is initialised
  ngOnInit() {
    // Modify the code to include required validators on
    // all form controls
    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required,
      Validators.minLength(2), Validators.maxLength(10)]],
      contactPreference: ['email'],
      emailGroup: this.fb.group({
        email: ['', [Validators.required,CustomValidators.emailDomain('niksaj.com')]],
        confirmEmail: ['', [Validators.required]],
      }, { validator: matchEmails }),
      phone: [''],
      skills: this.fb.array([
        this.addSkillFormGroup()
      ]),
    });

    this.employeeForm.valueChanges.subscribe((data)=>{
      this.logValidationErrors(this.employeeForm);
    })

    this.employeeForm.get('contactPreference')
                 .valueChanges.subscribe((data: string) => {
  this.onContactPrefernceChange(data);
});
    // this.employeeForm.get('fullName').valueChanges.subscribe((value:string)=> { this.fullNameLength=value.length});
  }

  // If the Selected Radio Button value is "phone", then add the
// required validator function otherwise remove it
onContactPrefernceChange(selectedValue: string) {

  const phoneFormControl = this.employeeForm.get('phone');
  const emailFormControl = this.employeeForm.get('email');
  
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
      // Loop through nested form groups and form controls to check
      // for validation errors. For the form groups and form controls
      // that have failed validation, retrieve the corresponding
      // validation message from validationMessages object and store
      // it in the formErrors object. The UI binds to the formErrors
      // object properties to display the validation errors.
      if (abstractControl && !abstractControl.valid
        && (abstractControl.touched || abstractControl.dirty)) {
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
      if (abstractControl instanceof FormArray) {
        for (const control of abstractControl.controls) {
          if (control instanceof FormGroup) {
            this.logValidationErrors(control);
          }
        }
      }
    });
  }

  onSubmit():void{
    this.logValidationErrors(this.employeeForm);
    console.log(this.formErrors);
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
function matchEmails(group: AbstractControl): { [key: string]: any } | null {
  const emailControl = group.get('email');
  const confirmEmailControl = group.get('confirmEmail');

  if (emailControl.value === confirmEmailControl.value || confirmEmailControl.pristine) {
    return null;
  } else {
    return { 'emailMismatch': true };
  }
}