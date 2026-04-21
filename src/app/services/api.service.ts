// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class ApiService {
//   private base = environment.apiUrl;
//   constructor(private http: HttpClient) {}

//   // Faelle
//   alleFaelle(): Observable<any[]> { return this.http.get<any[]>(`${this.base}/faelle`); }
//   neuerFall(data: any): Observable<any> { return this.http.post<any>(`${this.base}/faelle`, data); }
//   fallPerId(id: string): Observable<any> { return this.http.get<any>(`${this.base}/faelle/${id}`); }

//   // Assessment Koerper
//   koerperSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/assessment/koerper`, data); }
//   koerperPerFall(fallId: string): Observable<any[]> { return this.http.get<any[]>(`${this.base}/assessment/koerper/fall/${fallId}`); }

//   // Assessment Ernaehrung
//   ernaehrungSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/assessment/ernaehrung`, data); }
//   ernaehrungPerFall(fallId: string): Observable<any[]> { return this.http.get<any[]>(`${this.base}/assessment/ernaehrung/fall/${fallId}`); }

//   // Assessment Allgemein
//   allgemeinSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/assessment/allgemein`, data); }

//   // Assessment Umwelt
//   umweltSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/assessment/umwelt`, data); }

//   // Diagnose
//   diagnoseSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/diagnosen`, data); }
//   diagnosePerFall(fallId: string): Observable<any[]> { return this.http.get<any[]>(`${this.base}/diagnosen/fall/${fallId}`); }

//   // Ziele
//   zieleSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/ziele`, data); }

//   // Monitoring
//   monitoringSpeichern(data: any): Observable<any> { return this.http.post<any>(`${this.base}/monitoring`, data); }
//   monitoringPerFall(fallId: string): Observable<any[]> { return this.http.get<any[]>(`${this.base}/monitoring/fall/${fallId}`); }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';  // IMPORT THIS!
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  // Faelle
  alleFaelle(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.base}/faelle`); 
  }
  neuerFall(data: any): Observable<any> { 
    return this.http.post<any>(`${this.base}/faelle`, data); 
  }
  fallPerId(id: string): Observable<any> { 
    return this.http.get<any>(`${this.base}/faelle/${id}`); 
  }

  // Assessment Allgemein
  allgemeinSpeichern(data: any): Observable<any> { 
    return this.http.post<any>(`${this.base}/assessment/allgemein`, data); 
  }
  allgemeinGetLatest(fallId: string): Observable<any> { 
    return this.http.get<any>(`${this.base}/assessment/allgemein/fall/${fallId}/latest`); 
  }

  // Assessment Koerper
  koerperSpeichern(data: any): Observable<any> { 
    return this.http.post<any>(`${this.base}/assessment/koerper`, data); 
  }
  koerperGetLatest(fallId: string): Observable<any> { 
    return this.http.get<any>(`${this.base}/assessment/koerper/fall/${fallId}/latest`); 
  }

  // Assessment Ernaehrung
  ernaehrungSpeichern(data: any): Observable<any> { 
    return this.http.post<any>(`${this.base}/assessment/ernaehrung`, data); 
  }
  ernaehrungGetLatest(fallId: string): Observable<any> { 
    return this.http.get<any>(`${this.base}/assessment/ernaehrung/fall/${fallId}/latest`); 
  }

  // Diagnose
  diagnoseSpeichern(data: any): Observable<any> { 
    return this.http.post<any>(`${this.base}/diagnosen`, data); 
  }
  diagnoseGetLatest(fallId: string): Observable<any> { 
    return this.http.get<any>(`${this.base}/diagnosen/fall/${fallId}/latest`); 
  }

  // Monitoring
  monitoringSpeichern(data: any): Observable<any> { 
    return this.http.post<any>(`${this.base}/monitoring`, data); 
  }
  monitoringPerFall(fallId: string): Observable<any[]> { 
    return this.http.get<any[]>(`${this.base}/monitoring/fall/${fallId}`); 
  }

  // Add these to your ApiService

// Ziele (Goals)
  zieleSpeichern(data: any): Observable<any> { 
    return this.http.post<any>(`${this.base}/ziele`, data); 
  }
  zielePerFall(fallId: string): Observable<any[]> { 
    return this.http.get<any[]>(`${this.base}/ziele/fall/${fallId}`); 
  }
  zieleGetLatest(fallId: string): Observable<any> { 
    return this.http.get<any[]>(`${this.base}/ziele/fall/${fallId}`).pipe(
      map(data => data.length > 0 ? data[0] : null)
    );
  }

  enerateAIPlan(patientData: any): Observable<any> {
    // This calls your Spring Boot backend, which will call OpenAI
    return this.http.post<any>(`${this.base}/ai/generate-plan`, patientData);
  }
}