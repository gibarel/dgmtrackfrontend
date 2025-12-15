export interface RequisitoProceso {
  id: number;
  orden: number;
  descripcion: string;
  aplica: boolean;
  estado: 'pendiente'|'en_gestion'|'completo'|'no_aplica';
  responsableTexto?: string;
  observaciones?: string;
  diasEstimados?: number;
  fechaInicio?: string;
  fechaFin?: string;
}
