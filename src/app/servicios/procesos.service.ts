import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dependencia } from './dependencias.service';

export interface Proceso {
  id: number;
  nombre: string;
  descripcion?: string;

  numeroExpediente?: string;
  tipoActo?: string;

  caso?: string;
  situacionActual?: string;
  puntosPrincipales?: string;

  estado: 'pendiente' | 'en_progreso' | 'finalizado' | 'cancelado';
  fechaInicio?: string;
  fechaFin?: string;
  diasEstimados?: number;
  montoPrevisto?: number;
  observaciones?: string;

  activo: boolean;
  dependencias: Dependencia[];
}

export type CreateProcesoDto = Partial<Proceso> & { nombre: string; dependenciasIds?: number[] };

@Injectable({ providedIn: 'root' })
export class ProcesosService {
  private apiUrl = 'http://localhost:3000/procesos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(this.apiUrl);
  }

  getById(id: number): Observable<Proceso> {
    return this.http.get<Proceso>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateProcesoDto): Observable<Proceso> {
    return this.http.post<Proceso>(this.apiUrl, dto);
  }

  update(id: number, dto: Partial<CreateProcesoDto>): Observable<Proceso> {
    return this.http.patch<Proceso>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/${id}`);
  }
}
