import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Fälle ────────────────────────────────────────────────────────────────
  alleFaelle(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/faelle`);
  }
  neuerFall(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/faelle`, data);
  }
  fallPerId(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/faelle/${id}`);
  }

  // ── Assessment Allgemein ─────────────────────────────────────────────────
  allgemeinSpeichern(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/assessment/allgemein`, data);
  }
  allgemeinGetLatest(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/assessment/allgemein/fall/${id}/latest`);
  }

  // ── Assessment Körper ────────────────────────────────────────────────────
  koerperSpeichern(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/assessment/koerper`, data);
  }
  koerperGetLatest(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/assessment/koerper/fall/${id}/latest`);
  }

  // ── Assessment Ernährung ─────────────────────────────────────────────────
  ernaehrungSpeichern(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/assessment/ernaehrung`, data);
  }
  ernaehrungGetLatest(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/assessment/ernaehrung/fall/${id}/latest`);
  }

  // ── Diagnose ─────────────────────────────────────────────────────────────
  diagnoseSpeichern(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/diagnosen`, data);
  }
  diagnoseGetLatest(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/diagnosen/fall/${id}/latest`);
  }

  // ── Ziele ────────────────────────────────────────────────────────────────
  zieleSpeichern(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/ziele`, data);
  }
  zieleGetLatest(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/ziele/fall/${id}/latest`);
  }
  zielePerFall(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/ziele/fall/${id}`);
  }

  // ── Monitoring ───────────────────────────────────────────────────────────
  monitoringSpeichern(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/monitoring`, data);
  }
  monitoringPerFall(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/monitoring/fall/${id}`);
  }
  monitoringZusammenfassung(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/monitoring/fall/${id}/zusammenfassung`);
  }

  // Compute fälligkeit locally from the list (no backend endpoint needed)
  monitoringFaellig(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.base}/monitoring/fall/${id}`).pipe(
      map((data: any[]) => {
        if (!data || data.length === 0) {
          const next = new Date();
          next.setDate(next.getDate() + 14);
          return {
            faellig: false,
            naechstesDatum: next.toISOString().split('T')[0],
            letzteMessung: null,
            tageVerbleibend: 14
          };
        }
        const sorted = [...data].sort(
          (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
        );
        const letzte = new Date(sorted[0].datum);
        const next = new Date(letzte);
        next.setDate(next.getDate() + 14);
        const heute = new Date();
        heute.setHours(0, 0, 0, 0);
        next.setHours(0, 0, 0, 0);
        const diff = Math.ceil(
          (next.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          faellig: next <= heute,
          naechstesDatum: next.toISOString().split('T')[0],
          letzteMessung: sorted[0].datum,
          tageVerbleibend: diff > 0 ? diff : 0
        };
      })
    );
  }

  // ── KI ───────────────────────────────────────────────────────────────────
  kiEmpfehlung(fallId: string): Observable<any> {
    return this.http.post<any>(`${this.base}/ki/empfehlung/${fallId}`, {});
  }
  kiMonitoringAdaption(fallId: string): Observable<any> {
    return this.http.post<any>(`${this.base}/ki/monitoring/${fallId}`, {});
  }
  kiLetzteEmpfehlung(fallId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/ki/fall/${fallId}`);
  }
    // ── Fälle löschen ────────────────────────────────────────────────────────
  fallLoeschen(id: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/faelle/${id}`);
  }
    kiLetzteMonitoringAdaption(fallId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/ki/monitoring/${fallId}/letzte`);
  }
}