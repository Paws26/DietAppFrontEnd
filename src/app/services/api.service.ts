import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  alleFaelle(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/faelle`); }
  neuerFall(data: any): Observable<any> { return this.http.post<any>(`${this.base}/faelle`, data); }
  fallPerId(id: string): Observable<any> { return this.http.get<any>(`${this.base}/faelle/${id}`); }

  allgemeinSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/assessment/allgemein`, data); }
  allgemeinGetLatest(id: string): Observable<any> { return this.http.get<any>(`${this.base}/assessment/allgemein/fall/${id}/latest`); }

  koerperSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/assessment/koerper`, data); }
  koerperGetLatest(id: string): Observable<any> { return this.http.get<any>(`${this.base}/assessment/koerper/fall/${id}/latest`); }

  ernaehrungSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/assessment/ernaehrung`, data); }
  ernaehrungGetLatest(id: string): Observable<any> { return this.http.get<any>(`${this.base}/assessment/ernaehrung/fall/${id}/latest`); }

  diagnoseSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/diagnosen`, data); }
  diagnoseGetLatest(id: string): Observable<any> { return this.http.get<any>(`${this.base}/diagnosen/fall/${id}/latest`); }

  zieleSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/ziele`, data); }
  zielePerFall(id: string): Observable<any[]> { return this.http.get<any[]>(`${this.base}/ziele/fall/${id}`); }
  zieleGetLatest(id: string): Observable<any> {
    return this.http.get<any[]>(`${this.base}/ziele/fall/${id}`).pipe(
      map(data => data.length > 0 ? data[0] : null)
    );
  }

  monitoringSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/monitoring`, data); }
  monitoringPerFall(id: string): Observable<any[]> { return this.http.get<any[]>(`${this.base}/monitoring/fall/${id}`); }
 monitoringFaellig(id: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.base}/monitoring/fall/${id}`);
}

  kiEmpfehlung(fallId: string): Observable<any> { return this.http.post<any>(`${this.base}/ki/empfehlung/${fallId}`, {}); }
  kiLetzteEmpfehlung(fallId: string): Observable<any> { return this.http.get<any>(`${this.base}/ki/fall/${fallId}`); }
}