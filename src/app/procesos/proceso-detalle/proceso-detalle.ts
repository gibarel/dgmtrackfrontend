import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { ProcesosService, Proceso } from '../../servicios/procesos.service';
import { RequisitosService, RequisitoProceso, EstadoRequisito } from '../../servicios/requisitos.service';
import { PlantillasService, Plantilla } from '../../servicios/plantillas.service';

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './proceso-detalle.html',
  styleUrls: ['./proceso-detalle.scss'],
})
export class ProcesoDetalleComponent implements OnInit {
  id!: number;

  proceso?: Proceso;
  requisitos: RequisitoProceso[] = [];
  plantillas: Plantilla[] = [];

  cargando = false;
  error?: string;

  // Para mostrar datos auxiliares del proceso
  caso?: string;
  situacionActual?: string;
  puntosPrincipales?: string;

  // Progreso
  avancePct = 0;
  completos = 0;
  totalAplicables = 0;

  // Selección plantilla (sin ngModel)
  plantillaSeleccionada = '';

  // Alta rápida de requisito
  nuevoReqForm: ReturnType<FormBuilder['group']>;

  readonly estados: { value: EstadoRequisito; label: string }[] = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_gestion', label: 'En gestión' },
    { value: 'completo', label: 'Completo' },
    { value: 'no_aplica', label: 'No aplica' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private procesosService: ProcesosService,
    private requisitosService: RequisitosService,
    private plantillasService: PlantillasService,
  ) {
    this.nuevoReqForm = this.fb.group({
      descripcion: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(500)]),
    });
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarTodo();
  }

  volver() {
    this.router.navigate(['/procesos']);
  }

  cargarTodo() {
    this.cargando = true;
    this.error = undefined;

    // 1) Proceso
    this.procesosService.getById(this.id).subscribe({
      next: (p) => {
        this.proceso = p;
        this.caso = (p as any).caso ?? undefined;
        this.situacionActual = (p as any).situacionActual ?? undefined;
        this.puntosPrincipales = (p as any).puntosPrincipales ?? undefined;

        // 2) Requisitos
        this.cargarRequisitos();

        // 3) Plantillas (para aplicar)
        this.plantillasService.list().subscribe({
          next: (pls) => (this.plantillas = pls || []),
          error: (e) => console.warn('No se pudieron cargar plantillas', e),
        });
      },
      error: (e) => {
        this.error = 'No se pudo cargar el proceso.';
        this.cargando = false;
        console.error(e);
      },
    });
  }

  cargarRequisitos() {
    this.requisitosService.getByProceso(this.id).subscribe({
      next: (items) => {
        this.requisitos = (items || []).slice().sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        this.recalcularAvance();
        this.cargando = false;
      },
      error: (e) => {
        this.error = 'No se pudieron cargar los requisitos.';
        this.cargando = false;
        console.error(e);
      },
    });
  }

  recalcularAvance() {
    const aplicables = this.requisitos.filter((r) => r.aplica !== false);
    this.totalAplicables = aplicables.length;
    this.completos = aplicables.filter((r) => r.estado === 'completo').length;
    this.avancePct = this.totalAplicables ? Math.round((this.completos / this.totalAplicables) * 100) : 0;
  }

  // UI helpers
  estadoLabel(estado?: string) {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_progreso':
        return 'En progreso';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado ?? '-';
    }
  }

  badgeClass(estado?: string) {
    switch (estado) {
      case 'finalizado':
        return 'badge ok';
      case 'en_progreso':
        return 'badge warn';
      case 'cancelado':
        return 'badge bad';
      default:
        return 'badge';
    }
  }

  // === Requisitos ===
  agregarRapido() {
    if (this.nuevoReqForm.invalid) return;

    const descripcion = String(this.nuevoReqForm.value.descripcion || '').trim();
    if (!descripcion) return;

    // orden incremental automático: último orden + 1
    const maxOrden = this.requisitos.reduce((m, r) => Math.max(m, r.orden ?? 0), 0);

    this.requisitosService.crear(this.id, {
      orden: maxOrden + 1,
      descripcion,
      aplica: true,
      estado: 'pendiente',
    }).subscribe({
      next: (nuevo) => {
        this.requisitos = [...this.requisitos, nuevo].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        this.nuevoReqForm.reset({ descripcion: '' });
        this.recalcularAvance();
      },
      error: (e) => {
        this.error = 'No se pudo agregar el requisito.';
        console.error(e);
      },
    });
  }

  onAplicaChange(r: RequisitoProceso, checked: boolean) {
    this.requisitosService.actualizar(r.id, { aplica: checked }).subscribe({
      next: (upd) => {
        this.requisitos = this.requisitos.map((x) => (x.id === upd.id ? upd : x));
        this.recalcularAvance();
      },
      error: (e) => console.error(e),
    });
  }

  onEstadoChange(r: RequisitoProceso, estado: EstadoRequisito) {
    this.requisitosService.actualizar(r.id, { estado }).subscribe({
      next: (upd) => {
        this.requisitos = this.requisitos.map((x) => (x.id === upd.id ? upd : x));
        this.recalcularAvance();
      },
      error: (e) => console.error(e),
    });
  }

  guardarTexto(r: RequisitoProceso, responsableTexto: string, observaciones: string) {
    this.requisitosService.actualizar(r.id, { responsableTexto, observaciones }).subscribe({
      next: (upd) => {
        this.requisitos = this.requisitos.map((x) => (x.id === upd.id ? upd : x));
      },
      error: (e) => console.error(e),
    });
  }

  eliminarReq(r: RequisitoProceso) {
    if (!confirm('¿Eliminar este requisito?')) return;
    this.requisitosService.eliminar(r.id).subscribe({
      next: () => {
        this.requisitos = this.requisitos.filter((x) => x.id !== r.id);
        this.recalcularAvance();
      },
      error: (e) => console.error(e),
    });
  }

  // === Plantillas ===
  aplicarPlantilla() {
    const codigo = (this.plantillaSeleccionada || '').trim();
    if (!codigo) return;

    // OJO: acá corregimos la firma: si tu service espera string, mandamos string.
    this.plantillasService.applyToProceso(this.id, codigo).subscribe({
      next: () => this.cargarRequisitos(),
      error: (e) => {
        this.error = 'No se pudo aplicar la plantilla.';
        console.error(e);
      },
    });
  }
}
