import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DepartamentosService, Departamento } from '../servicios/departamentos.service';

@Component({
  selector: 'app-departamentos',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './departamentos.html',
  styleUrl: './departamentos.scss',
})
export class DepartamentosComponent implements OnInit {
  departamentos: Departamento[] = [];
  cargando = false;
  error?: string;

  form; // se declara primero

  constructor(
    private fb: FormBuilder,
    private departamentosService: DepartamentosService
  ) {
    // se inicializa acá, ya tenemos disponible fb
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarLista();
  }

  cargarLista() {
    this.cargando = true;
    this.error = undefined;
    this.departamentosService.getDepartamentos().subscribe({
      next: (data) => {
        this.departamentos = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la lista.';
        this.cargando = false;
        console.error(err);
      },
    });
  }

  crear() {
    if (this.form.invalid) return;
    const dto = this.form.value as { nombre: string; descripcion?: string };
    this.departamentosService.createDepartamento(dto).subscribe({
      next: (nuevo) => {
        this.departamentos = [nuevo, ...this.departamentos];
        this.form.reset();
      },
      error: (err) => {
        this.error = 'No se pudo crear el departamento.';
        console.error(err);
      },
    });
  }
}
