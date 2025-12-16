import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProcesosService, Proceso } from '../../servicios/procesos.service';
import { RequisitosService, RequisitoProceso, EstadoRequisito } from '../../servicios/requisitos.service';

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './proceso-detalle.html',
  styleUrls: ['./proceso-detalle.scss'],
})
export class ProcesoDetalleComponent implements OnInit {
  proceso?: Proceso;
  requisitos: RequisitoProceso[] = [];

  // Campos extendidos (evita "as any" en template)
  caso?: string | null;
  situacionActual?: string | null;
  puntosPrincipales?: string | null;

  cargando = true;
  cargandoReq = true;
  error?: string;
  errorReq?: string;

  id!: number;

  nuevoReqForm!: ReturnType<FormBuilder['group']>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private procesosService: ProcesosService,
    private reqService: RequisitosService,
    private fb: FormBuilder,
  ) {
    // Crear el form ACÁ (evita "fb used before initialization")
    this.nuevoReqForm = this.fb.group({
      descripcion: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(400)]),
    });
  }

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);

    if (!id || Number.isNaN(id)) {
      this.router.navigate(['/procesos']);
      return;
    }

    this.id = id;
    this.cargarProceso();
    this.cargarRequisitos();
  }

  cargarProceso(): void {
    this.cargando = true;
    this.error = undefined;

    this.procesosService.getById(this.id).subscribe({
      next: (p: any) => {
        this.proceso = p;
        // mapear campos extendidos para el template
        this.caso = p?.caso ?? null;
        this.situacionActual = p?.situacionActual ?? null;
        this.puntosPrincipales = p?.puntosPrincipales ?? null;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el proceso';
        this.cargando = false;
      },
    });
  }

  cargarRequisitos(): void {
    this.cargandoReq = true;
    this.errorReq = undefined;

    this.reqService.listByProceso(this.id).subscribe({
      next: (rs) => {
        this.requisitos = rs;
        this.cargandoReq = false;
      },
      error: (e) => {
        this.errorReq = 'No se pudieron cargar los requisitos';
        this.cargandoReq = false;
        console.error(e);
      },
    });
  }

  crearRequisito(): void {
    if (this.nuevoReqForm.invalid) return;

    const descripcion = this.nuevoReqForm.get('descripcion')?.value ?? '';
    this.reqService.createForProceso(this.id, { descripcion }).subscribe({
      next: (r) => {
        this.requisitos = [...this.requisitos, r].sort((a, b) => a.orden - b.orden);
        this.nuevoReqForm.reset({ descripcion: '' });
      },
      error: (e) => {
        this.errorReq = 'No se pudo crear el requisito';
        console.error(e);
      },
    });
  }

  setEstado(r: RequisitoProceso, estado: string): void {
    this.reqService.updateEstado(r.id, estado as EstadoRequisito).subscribe({
      next: (upd) => {
        this.requisitos = this.requisitos.map((x) => (x.id === r.id ? upd : x));
      },
      error: (e) => {
        this.errorReq = 'No se pudo actualizar el estado';
        console.error(e);
      },
    });
  }

  toggleAplica(r: RequisitoProceso, aplica: boolean): void {
  const nextEstado =
    aplica && r.estado === 'no_aplica' ? 'pendiente' : (aplica ? r.estado : 'no_aplica');

  const payload: Partial<RequisitoProceso> = {
    aplica,
    estado: nextEstado,
  };

  this.reqService.update(r.id, payload).subscribe({
    next: (upd) => {
      this.requisitos = this.requisitos.map((x) => (x.id === r.id ? upd : x));
    },
    error: (e) => {
      this.errorReq = 'No se pudo actualizar';
      console.error(e);
    },
  });



    this.reqService.update(r.id, payload).subscribe({
      next: (upd) => {
        this.requisitos = this.requisitos.map((x) => (x.id === r.id ? upd : x));
      },
      error: (e) => {
        this.errorReq = 'No se pudo actualizar';
        console.error(e);
      },
    });
  }

  guardarTexto(r: RequisitoProceso, responsableTexto: string, observaciones: string): void {
    this.reqService.update(r.id, { responsableTexto, observaciones }).subscribe({
      next: (upd) => {
        this.requisitos = this.requisitos.map((x) => (x.id === r.id ? upd : x));
      },
      error: (e) => {
        this.errorReq = 'No se pudo guardar';
        console.error(e);
      },
    });
  }

  eliminarRequisito(r: RequisitoProceso): void {
    if (!confirm(`¿Eliminar requisito #${r.orden}?`)) return;
    this.reqService.delete(r.id).subscribe({
      next: () => {
        this.requisitos = this.requisitos.filter((x) => x.id !== r.id);
      },
      error: (e) => {
        this.errorReq = 'No se pudo eliminar';
        console.error(e);
      },
    });
  }

  get totalAplicables(): number {
    return this.requisitos.filter((r) => r.aplica).length;
  }

  get completos(): number {
    return this.requisitos.filter((r) => r.aplica && r.estado === 'completo').length;
  }

  get avancePct(): number {
    const t = this.totalAplicables;
    if (!t) return 0;
    return Math.round((this.completos / t) * 100);
  }

  volver(): void {
    this.router.navigate(['/procesos']);
  }

  badgeClass(estado?: string): string {
    switch (estado) {
      case 'pendiente': return 'badge';
      case 'en_progreso': return 'badge warn';
      case 'finalizado': return 'badge ok';
      case 'cancelado': return 'badge danger';
      default: return 'badge';
    }
  }

  estadoLabel(estado?: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_progreso': return 'En progreso';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      default: return '';
    }
  }

  // Helpers para template estricto (evita $event.target.value)
  onEstadoChange(r: RequisitoProceso, value: string): void {
    this.setEstado(r, value);
  }

  onAplicaChange(r: RequisitoProceso, checked: boolean): void {
    this.toggleAplica(r, checked);
  }
}
