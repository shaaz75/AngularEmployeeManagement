import { NgModule } from '@angular/core';
// Import RouterModule & Routes type
import { RouterModule, Routes } from '@angular/router';

// Import all the components that we will be referencing in the route definitions
import { CreateEmployeeV2Component } from './create-employee-v2.component';
import { ListEmployeesComponent } from './list-employees.component';

// Define the routes
const appRoutes: Routes = [
  { path: '', component: ListEmployeesComponent },
      { path: 'create', component: CreateEmployeeV2Component },
      { path: 'edit/:id', component: CreateEmployeeV2Component }
];

// In a feature module forChild() method must be used to register routes
// Export RouterModule, so the it's directives like RouterLink, RouterOutlet
// are available to the EmployeeModule that imports this module
@NgModule({
  imports: [ RouterModule.forChild(appRoutes)],
  exports: [ RouterModule ]
})
export class EmployeeRoutingModule { }