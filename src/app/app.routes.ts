import { Routes } from '@angular/router';
import { DependenciasComponent } from './dependencias/dependencias';
import { ProcesosComponent } from './procesos/procesos';
import { ProcesoDetalleComponent } from './procesos/proceso-detalle/proceso-detalle';

export const routes: Routes = [
  { path: '', component: DependenciasComponent },

  // DETALLE DEL PROCESO (va antes)
  { path: 'procesos/:id', component: ProcesoDetalleComponent },

  // LISTA DE PROCESOS
  { path: 'procesos', component: ProcesosComponent },
];
