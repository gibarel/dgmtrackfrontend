import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DependenciasService, Dependencia } from '../servicios/dependencias.service';

@Component({
  selector: 'app-dependencias',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './dependencias.html',
  styleUrl: './dependencias.scss',
})
export class DependenciasComponent implements OnInit {
  lista: Dependencia[] = [];
  error?: string;
  cargando = false;

  // Se declaran, pero se inicializan en el constructor
  form: ReturnType<FormBuilder['group']>;
  editForm: ReturnType<FormBuilder['group']>;
  editId: number | null = null;

  constructor(private fb: FormBuilder, private svc: DependenciasService) {
    this.form = this.fb.group({
      nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
      descripcion: this.fb.control<string | null>(null),
      padreId: this.fb.control<number | null>(null),
    });

    this.editForm = this.fb.group({
      nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(150)]),
      descripcion: this.fb.control<string | null>(null),
      padreId: this.fb.control<number | null>(null),
      activo: this.fb.nonNullable.control(true),
    });
  }

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando = true; this.error = undefined;
    this.svc.getAll().subscribe({
      next: d => { this.lista = d; this.cargando = false; },
      error: e => { this.error = 'No se pudo cargar.'; this.cargando = false; console.error(e); }
    });
  }

  crear() {
    if (this.form.invalid) return;
    this.svc.create(this.form.value as any).subscribe({
      next: dep => { this.lista = [dep, ...this.lista]; this.form.reset(); },
      error: e => { this.error = 'No se pudo crear.'; console.error(e); }
    });
  }

  startEdit(dep: Dependencia) {
    this.editId = dep.id;
    this.editForm.reset({
      nombre: dep.nombre,
      descripcion: dep.descripcion ?? null,
      padreId: dep.padre?.id ?? null,
      activo: dep.activo,
    });
  }

  cancelar() {
    this.editId = null;
    this.editForm.reset({ activo: true, nombre: '', descripcion: null, padreId: null });
  }

  guardar() {
    if (this.editId == null || this.editForm.invalid) return;
    this.svc.update(this.editId, this.editForm.value as any).subscribe({
      next: upd => { this.lista = this.lista.map(d => d.id === this.editId ? upd : d); this.cancelar(); },
      error: e => { this.error = 'No se pudo actualizar.'; console.error(e); }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar esta dependencia?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.lista = this.lista.filter(d => d.id !== id); },
      error: e => { this.error = 'No se pudo eliminar.'; console.error(e); }
    });
  }
}
