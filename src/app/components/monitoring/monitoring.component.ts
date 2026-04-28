import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  standalone: false
})
export class MonitoringComponent implements OnInit {
  fallId!: string;
  form!: FormGroup;
  verlauf: any[] = [];
  status: any = null;
  laedt = false;
  speichert = false;

  zielerreichungOpt = ['ja', 'nein', 'teilweise'];

  hoverRow: number | null = null;

  abs(value: number): number {
    return Math.abs(value);
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.fallId = this.route.snapshot.paramMap.get('fallId')!;
    this.form = this.fb.group({
      datum:              [new Date().toISOString().split('T')[0], Validators.required],
      gewicht:            [null],
      fettmasse:          [null],
      kalorienaufnahme:   [null],
      fettaufnahme:       [null],
      zielerreichung:     [''],
      foerderndefaktoren: [''],
      hemmendefaktoren:   [''],
      notizen:            ['']
    });
    this.ladeVerlauf();
    this.pruefeFaelligkeit();
  }

  ladeVerlauf() {
    this.laedt = true;
    this.api.monitoringPerFall(this.fallId).subscribe({
      next: data => { this.verlauf = data; this.laedt = false; },
      error: () => this.laedt = false
    });
  }

  pruefeFaelligkeit() {
  this.api.monitoringFaellig(this.fallId).subscribe({
    next: (data: any) => {
      console.log('Monitoring-Status:', data);
      this.status = data;

      // Berechne Tage bis zum nächsten Monitoring
      if (data?.naechstesDatum) {
        const heute = new Date();
        const next = new Date(data.naechstesDatum);
        
        // Setze Uhrzeiten auf 00:00:00 für genauen Vergleich
        heute.setHours(0, 0, 0, 0);
        next.setHours(0, 0, 0, 0);
        
        const diff = next.getTime() - heute.getTime();
        const tageVerbleibend = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        this.status.tageVerbleibend = tageVerbleibend > 0 ? tageVerbleibend : 0;
      }
    },
    error: (err) => {
      console.error('Fehler beim Prüfen der Fälligkeit:', err);
    }
  });
}

  speichern() {
    if (this.form.invalid) return;
    this.speichert = true;
    this.api.monitoringSpeichern({ ...this.form.value, fallId: this.fallId }).subscribe({
      next: () => {
        this.speichert = false;
        this.snack.open('Monitoring gespeichert!', 'OK', { duration: 3000 });
        this.form.patchValue({ datum: new Date().toISOString().split('T')[0] });
        this.ladeVerlauf();
        this.pruefeFaelligkeit();
      },
      error: () => {
        this.speichert = false;
        this.snack.open('Fehler beim Speichern!', 'OK', { duration: 3000 });
      }
    });
  }

  aenderung(aktuell: number, vorher: number): string {
    if (!aktuell || !vorher) return '';
    const diff = aktuell - vorher;
    return (diff > 0 ? '+' : '') + diff.toFixed(1);
  }
}