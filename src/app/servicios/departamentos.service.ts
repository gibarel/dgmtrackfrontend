import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Departamento {
  id: number;
  nombre: string;
  descripcion?: string;
}
export interface CreateDepartamentoDto {
  nombre: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class DepartamentosService {
  private apiUrl = 'http://localhost:3000/departamentos';
  constructor(private http: HttpClient) {}
  getDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(this.apiUrl);
  }
  createDepartamento(dto: CreateDepartamentoDto): Observable<Departamento> {
    return this.http.post<Departamento>(this.apiUrl, dto);
  }
}
