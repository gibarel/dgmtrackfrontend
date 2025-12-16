import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EstadoRequisito = 'pendiente' | 'en_gestion' | 'completo' | 'no_aplica';

export interface RequisitoProceso {
  id: number;
  orden: number;
  descripcion: string;
  aplica: boolean;
  estado: EstadoRequisito;
  responsableTexto?: string;
  observaciones?: string;
  diasEstimados?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

@Injectable({ providedIn: 'root' })
export class RequisitosService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  listByProceso(procesoId: number): Observable<RequisitoProceso[]> {
    return this.http.get<RequisitoProceso[]>(`${this.baseUrl}/procesos/${procesoId}/requisitos`);
  }

  createForProceso(procesoId: number, payload: { descripcion: string; aplica?: boolean; responsableTexto?: string; diasEstimados?: number }) {
    return this.http.post<RequisitoProceso>(`${this.baseUrl}/procesos/${procesoId}/requisitos`, payload);
  }

  update(id: number, payload: Partial<RequisitoProceso>) {
    return this.http.patch<RequisitoProceso>(`${this.baseUrl}/requisitos/${id}`, payload);
  }

  updateEstado(id: number, estado: EstadoRequisito) {
    return this.http.patch<RequisitoProceso>(`${this.baseUrl}/requisitos/${id}/estado`, { estado });
  }

  delete(id: number) {
    return this.http.delete<{ deleted: true }>(`${this.baseUrl}/requisitos/${id}`);
  }
}
