import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { ListEmployeesComponent } from './employee/list-employees.component';
import { CreateEmployeeComponent } from './employee/create-employee.component';
import { CreateEmployeeV2Component } from './employee/create-employee-v2.component';

const appRoutes:Routes=[
  {path:'list' , component:ListEmployeesComponent},
  {path:'create', component:CreateEmployeeComponent},
  {path:'createV2', component:CreateEmployeeV2Component},
  {path:'' ,redirectTo:'/list',pathMatch:'full'}
]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports:[RouterModule]
})
export class AppRoutingModule { }
