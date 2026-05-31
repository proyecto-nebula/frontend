import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface MutationEvent {
  type: string;
  action: 'create' | 'update' | 'delete';
  id?: number;
}

/**
 * Servicio que emite eventos cuando hay mutaciones (POST/PUT/DELETE).
 * Los componentes de admin se suscriben para refrescar datos automáticamente.
 * 
 * Usa ReplaySubject(1) para que los eventos recientes no se pierdan
 * si la suscripción se hace después de la emisión.
 * 
 * Uso en admin tables:
 * constructor(private mutations: MutationService) {}
 * ngOnInit() {
 *   this.mutations.onMutation('games').subscribe(() => this.loadList());
 * }
 */
@Injectable({ providedIn: 'root' })
export class MutationService {
  // ReplaySubject(1): guarda el último evento para nuevos suscriptores
  private mutationSubject = new ReplaySubject<MutationEvent>(1);

  /**
   * Observable que emite cuando hay una mutación de un tipo específico
   */
  onMutation(type: string): Observable<MutationEvent> {
    return this.mutationSubject.asObservable().pipe(
      filter((mutation) => mutation.type === type)
    );
  }

  /**
   * Emitir mutación (llamado por interceptor)
   */
  emitMutation(type: string, action: 'create' | 'update' | 'delete', id?: number): void {
    console.log(`[MutationService] ${action} en ${type}${id ? ` (id: ${id})` : ''}`);
    this.mutationSubject.next({ type, action, id });
  }
}
