import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProcesosService, Proceso } from '../servicios/procesos.service';
import { DependenciasService, Dependencia } from '../servicios/dependencias.service';

type Estado = 'pendiente' | 'en_progreso' | 'finalizado' | 'cancelado';

@Component({
  selector: 'app-procesos',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './procesos.html',
  styleUrls: ['./procesos.scss'],
})
export class ProcesosComponent implements OnInit {
  procesos: Proceso[] = [];
  dependencias: Dependencia[] = [];
  seleccionadas = new Set<number>();
  error?: string;
  cargando = false;

  form!: ReturnType<FormBuilder['group']>;
  editForm!: ReturnType<FormBuilder['group']>;
  editId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: ProcesosService,
    private depSvc: DependenciasService,
  ) {
    this.form = this.fb.group({
      nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
      descripcion: this.fb.control<string | null>(null),
      numeroExpediente: this.fb.control<string | null>(null),
      tipoActo: this.fb.control<string | null>(null),
      estado: this.fb.nonNullable.control<Estado>('pendiente'),
      diasEstimados: this.fb.control<number | null>(null),
      montoPrevisto: this.fb.control<number | null>(null),
      activo: this.fb.nonNullable.control(true),
      caso: this.fb.control<string | null>(null),
      situacionActual: this.fb.control<string | null>(null),
      puntosPrincipales: this.fb.control<string | null>(null),
      observaciones: this.fb.control<string | null>(null),
    });

    this.editForm = this.fb.group({
      nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
      descripcion: this.fb.control<string | null>(null),
      numeroExpediente: this.fb.control<string | null>(null),
      tipoActo: this.fb.control<string | null>(null),
      estado: this.fb.nonNullable.control<Estado>('pendiente'),
      diasEstimados: this.fb.control<number | null>(null),
      montoPrevisto: this.fb.control<number | null>(null),
      activo: this.fb.nonNullable.control(true),
      caso: this.fb.control<string | null>(null),
      situacionActual: this.fb.control<string | null>(null),
      puntosPrincipales: this.fb.control<string | null>(null),
      observaciones: this.fb.control<string | null>(null),
    });
  }

  ngOnInit(): void {
    this.cargar();
    this.depSvc.getAll().subscribe({
      next: (d) => (this.dependencias = d),
      error: (e) => console.error(e),
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = undefined;

    this.svc.getAll().subscribe({
      next: (d) => {
        this.procesos = d;
        this.cargando = false;
      },
      error: (e) => {
        this.error = 'No se pudo cargar.';
        this.cargando = false;
        console.error(e);
      },
    });
  }

  toggleDep(id: number, checked: boolean): void {
    if (checked) this.seleccionadas.add(id);
    else this.seleccionadas.delete(id);
  }

  crear(): void {
    if (this.form.invalid) return;

    const payload = {
      ...this.form.value,
      dependenciasIds: Array.from(this.seleccionadas),
    };

    this.svc.create(payload as any).subscribe({
      next: (p) => {
        this.procesos = [p, ...this.procesos];
        this.form.reset({ estado: 'pendiente', activo: true });
        this.seleccionadas.clear();
      },
      error: (e) => {
        this.error = 'No se pudo crear.';
        console.error(e);
      },
    });
  }

  startEdit(p: Proceso): void {
    this.editId = p.id;

    this.editForm.reset({
      nombre: p.nombre,
      descripcion: p.descripcion ?? null,
      numeroExpediente: p.numeroExpediente ?? null,
      tipoActo: p.tipoActo ?? null,
      estado: (p.estado as Estado) ?? 'pendiente',
      diasEstimados: p.diasEstimados ?? null,
      montoPrevisto: p.montoPrevisto ?? null,
      activo: p.activo ?? true,
      caso: (p as any).caso ?? null,
      situacionActual: (p as any).situacionActual ?? null,
      puntosPrincipales: (p as any).puntosPrincipales ?? null,
      observaciones: (p as any).observaciones ?? null,
    });

    this.seleccionadas = new Set((p.dependencias ?? []).map((d) => d.id));
  }

  cancelar(): void {
    this.editId = null;
    this.editForm.reset({
      nombre: '',
      descripcion: null,
      numeroExpediente: null,
      tipoActo: null,
      estado: 'pendiente',
      diasEstimados: null,
      montoPrevisto: null,
      activo: true,
      caso: null,
      situacionActual: null,
      puntosPrincipales: null,
      observaciones: null,
    });
    this.seleccionadas.clear();
  }

  guardar(): void {
    if (this.editId == null || this.editForm.invalid) return;

    const payload = {
      ...this.editForm.value,
      dependenciasIds: Array.from(this.seleccionadas),
    };

    this.svc.update(this.editId, payload as any).subscribe({
      next: (upd) => {
        this.procesos = this.procesos.map((x) => (x.id === this.editId ? upd : x));
        this.cancelar();
      },
      error: (e) => {
        this.error = 'No se pudo actualizar.';
        console.error(e);
      },
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este proceso?')) return;

    this.svc.delete(id).subscribe({
      next: () => {
        this.procesos = this.procesos.filter((x) => x.id !== id);
      },
      error: (e) => {
        this.error = 'No se pudo eliminar.';
        console.error(e);
      },
    });
  }
}
