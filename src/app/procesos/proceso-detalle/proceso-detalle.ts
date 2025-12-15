import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProcesosService, Proceso } from '../../servicios/procesos.service';

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './proceso-detalle.html',
  styleUrls: ['./proceso-detalle.scss'],
})
export class ProcesoDetalleComponent implements OnInit {
  proceso?: Proceso;
  cargando = true;
  error?: string;
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private procesosService: ProcesosService,
  ) {}

  ngOnInit() {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);

    if (!id || Number.isNaN(id)) {
      this.router.navigate(['/procesos']);
      return;
    }

    this.id = id;
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.error = undefined;

    this.procesosService.getById(this.id).subscribe({
      next: (p) => {
        this.proceso = p;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el proceso';
        this.cargando = false;
      },
    });
  }

  volver() {
    this.router.navigate(['/procesos']);
  }

  badgeClass(estado?: string) {
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
}
