import { Routes } from '@angular/router';
import { DependenciasComponent } from './dependencias/dependencias';
import { ProcesosComponent } from './procesos/procesos';

export const routes: Routes = [
  { path: '', component: DependenciasComponent },
  { path: 'procesos', component: ProcesosComponent },
];
