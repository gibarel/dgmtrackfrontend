import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dependencia { id:number; nombre:string; descripcion?:string; activo:boolean; padre?: Dependencia; hijos?: Dependencia[]; }

@Injectable({ providedIn: 'root' })
export class DependenciasService {
  private apiUrl = 'http://localhost:3000/dependencias';
  constructor(private http: HttpClient) {}
  getAll(): Observable<Dependencia[]> { return this.http.get<Dependencia[]>(this.apiUrl); }
  create(dto: Partial<Dependencia> & { nombre: string; padreId?: number }): Observable<Dependencia> {
    return this.http.post<Dependencia>(this.apiUrl, dto);
  }
  update(id:number, dto: Partial<Dependencia>): Observable<Dependencia> {
    return this.http.patch<Dependencia>(`${this.apiUrl}/${id}`, dto);
  }
  delete(id:number) { return this.http.delete<{deleted:boolean}>(`${this.apiUrl}/${id}`); }
}
