import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DepartamentosService, Departamento } from '../servicios/departamentos.service';

// Si querés incluir gráfico ahora mismo, instalá ng2-charts y chart.js y descomentá:
// import { NgChartsModule } from 'ng2-charts';
// import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-departamentos',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    // NgChartsModule, // ← descomentá si vas a usar gráficos ahora
  ],
  templateUrl: './departamentos.html',
  styleUrl: './departamentos.scss',
})
export class DepartamentosComponent implements OnInit {
  departamentos: Departamento[] = [];
  cargando = false;
  error?: string;

  // formularios
  form: ReturnType<FormBuilder['group']>;
  editForm: ReturnType<FormBuilder['group']>;
  editId: number | null = null;

  // Si usás gráfico, descomentá las 3 líneas siguientes y los imports de arriba:
  // barData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [] }] };
  // barOptions: ChartConfiguration<'bar'>['options'] = { responsive: true };
  // barType: ChartType = 'bar';

  constructor(private fb: FormBuilder, private svc: DepartamentosService) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: [''],
    });
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: [''],
    });
  }

  ngOnInit(): void { this.cargarLista(); }

  cargarLista() {
    this.cargando = true; this.error = undefined;
    this.svc.getDepartamentos().subscribe({
      next: data => { this.departamentos = data; /* this.recomputarChart(); */ this.cargando = false; },
      error: err => { this.error = 'No se pudo cargar la lista.'; this.cargando = false; console.error(err); }
    });
  }

  crear() {
    if (this.form.invalid) return;
    this.svc.createDepartamento(this.form.value as any).subscribe({
      next: nuevo => { this.departamentos = [nuevo, ...this.departamentos]; /* this.recomputarChart(); */ this.form.reset(); },
      error: err => { this.error = 'No se pudo crear.'; console.error(err); }
    });
  }

  startEdit(dep: Departamento) {
    this.editId = dep.id;
    this.editForm.reset({ nombre: dep.nombre, descripcion: dep.descripcion ?? '' });
  }

  cancelarEdit() { this.editId = null; this.editForm.reset(); }

  guardarEdit(id: number) {
    if (this.editForm.invalid) return;
    this.svc.updateDepartamento(id, this.editForm.value as any).subscribe({
      next: actualizado => {
        this.departamentos = this.departamentos.map(d => d.id === id ? actualizado : d);
        /* this.recomputarChart(); */ this.cancelarEdit();
      },
      error: err => { this.error = 'No se pudo actualizar.'; console.error(err); }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este departamento?')) return;
    this.svc.deleteDepartamento(id).subscribe({
      next: () => { this.departamentos = this.departamentos.filter(d => d.id !== id); /* this.recomputarChart(); */ },
      error: err => { this.error = 'No se pudo eliminar.'; console.error(err); }
    });
  }

  // Si usás gráfico:
  // private recomputarChart() {
  //   const map: Record<string, number> = {};
  //   for (const d of this.departamentos) {
  //     const k = (d.nombre?.[0] || '#').toUpperCase();
  //     map[k] = (map[k] ?? 0) + 1;
  //   }
  //   const labels = Object.keys(map).sort();
  //   this.barData = { labels, datasets: [{ data: labels.map(l => map[l]) }] };
  // }
}
