import { NgModule } from '@angular/core';

import { EmployeeRoutingModule } from './employee-routing.module';

import { CreateEmployeeV2Component } from './create-employee-v2.component';
import { ListEmployeesComponent } from './list-employees.component';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    EmployeeRoutingModule,
    SharedModule
  ],
  declarations: [
    CreateEmployeeV2Component,
    ListEmployeesComponent
  ]
})

export class EmployeeModule { }