import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProcesosService, Proceso } from '../servicios/procesos.service';
import { DependenciasService, Dependencia } from '../servicios/dependencias.service';

type Estado = 'pendiente'|'en_progreso'|'finalizado'|'cancelado';

@Component({
  selector: 'app-procesos',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './procesos.html',
  styleUrl: './procesos.scss',
})
export class ProcesosComponent implements OnInit {
  procesos: Proceso[] = [];
  dependencias: Dependencia[] = [];
  seleccionadas = new Set<number>();
  error?: string;
  cargando = false;

  form: ReturnType<FormBuilder['group']>;
  editForm: ReturnType<FormBuilder['group']>;
  editId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: ProcesosService,
    private depSvc: DependenciasService
  ) {
    this.form = this.fb.group({
      nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
      descripcion: this.fb.control<string | null>(null),
      estado: this.fb.nonNullable.control<Estado>('pendiente'),
      diasEstimados: this.fb.control<number | null>(null),
      montoPrevisto: this.fb.control<number | null>(null),
      activo: this.fb.nonNullable.control(true),
    });

    this.editForm = this.fb.group({
      nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
      descripcion: this.fb.control<string | null>(null),
      estado: this.fb.nonNullable.control<Estado>('pendiente'),
      diasEstimados: this.fb.control<number | null>(null),
      montoPrevisto: this.fb.control<number | null>(null),
      activo: this.fb.nonNullable.control(true),
    });
  }

  ngOnInit() {
    this.cargar();
    this.depSvc.getAll().subscribe(d => this.dependencias = d);
  }

  cargar() {
    this.cargando = true; this.error = undefined;
    this.svc.getAll().subscribe({
      next: d => { this.procesos = d; this.cargando = false; },
      error: e => { this.error = 'No se pudo cargar.'; this.cargando = false; console.error(e); }
    });
  }

  toggleDep(id: number, checked: boolean) {
    if (checked) this.seleccionadas.add(id); else this.seleccionadas.delete(id);
  }

  crear() {
    if (this.form.invalid) return;
    const payload = { ...this.form.value, dependenciasIds: Array.from(this.seleccionadas) };
    this.svc.create(payload as any).subscribe({
      next: p => { this.procesos = [p, ...this.procesos]; this.form.reset({ estado: 'pendiente', activo: true }); this.seleccionadas.clear(); },
      error: e => { this.error = 'No se pudo crear.'; console.error(e); }
    });
  }

  startEdit(p: Proceso) {
    this.editId = p.id;
    this.editForm.reset({
      nombre: p.nombre,
      descripcion: p.descripcion ?? null,
      estado: p.estado as Estado,
      diasEstimados: p.diasEstimados ?? null,
      montoPrevisto: p.montoPrevisto ?? null,
      activo: p.activo,
    });
    this.seleccionadas = new Set((p.dependencias || []).map(d => d.id));
  }

  cancelar() {
    this.editId = null;
    this.editForm.reset({ estado: 'pendiente', activo: true, nombre: '', descripcion: null, diasEstimados: null, montoPrevisto: null });
    this.seleccionadas.clear();
  }

  guardar() {
    if (this.editId == null || this.editForm.invalid) return;
    const payload = { ...this.editForm.value, dependenciasIds: Array.from(this.seleccionadas) };
    this.svc.update(this.editId, payload as any).subscribe({
      next: upd => { this.procesos = this.procesos.map(x => x.id === this.editId ? upd : x); this.cancelar(); },
      error: e => { this.error = 'No se pudo actualizar.'; console.error(e); }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este proceso?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.procesos = this.procesos.filter(x => x.id !== id); },
      error: e => { this.error = 'No se pudo eliminar.'; console.error(e); }
    });
  }
}
