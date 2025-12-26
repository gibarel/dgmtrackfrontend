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
  responsableTexto?: string | null;
  observaciones?: string | null;
  diasEstimados?: number | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  procesoId?: number; // si tu API lo devuelve
}

export interface CreateRequisitoDto {
  orden?: number;       
  descripcion: string;
  aplica?: boolean;
  estado?: EstadoRequisito;
  responsableTexto?: string | null;
  observaciones?: string | null;
  diasEstimados?: number | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

export interface UpdateRequisitoDto extends Partial<CreateRequisitoDto> {}

@Injectable({ providedIn: 'root' })
export class RequisitosService {
  private baseUrl = 'http://localhost:3000/requisitos';

  constructor(private http: HttpClient) {}

  // GET /requisitos?procesoId=#
  getByProceso(procesoId: number): Observable<RequisitoProceso[]> {
    return this.http.get<RequisitoProceso[]>(`${this.baseUrl}?procesoId=${procesoId}`);
  }

  // POST /requisitos  (con procesoId en body)
  crear(procesoId: number, dto: CreateRequisitoDto): Observable<RequisitoProceso> {
    return this.http.post<RequisitoProceso>(this.baseUrl, { ...dto, procesoId });
  }

  // PATCH /requisitos/:id
  actualizar(id: number, dto: UpdateRequisitoDto): Observable<RequisitoProceso> {
    return this.http.patch<RequisitoProceso>(`${this.baseUrl}/${id}`, dto);
  }

  // DELETE /requisitos/:id
  eliminar(id: number): Observable<{ deleted: true }> {
    return this.http.delete<{ deleted: true }>(`${this.baseUrl}/${id}`);
  }
}
