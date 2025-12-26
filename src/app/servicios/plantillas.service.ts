import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Plantilla {
  id: number;
  codigo: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class PlantillasService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Plantilla[]>(`${this.baseUrl}/plantillas`);
  }

  applyToProceso(procesoId: number, codigo: string, allowAppend = false) {
    return this.http.post(`${this.baseUrl}/procesos/${procesoId}/plantilla`, {
      codigo,
      allowAppend,
    });
  }
}
