import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  standalone: false
})
export class MonitoringComponent implements OnInit {
  fallId!: string;
  patient: any = null;
  form!: FormGroup;

  verlauf: any[]       = [];
  ziel: any            = null;
  status: any          = null;
  kiAdaption: string | null = null;

  laedt     = false;
  speichert = false;
  kiLaedt   = false;
  hoverRow: number | null = null;

  today = new Date().toISOString().split('T')[0];
  zielerreichungOpt = ['ja', 'nein', 'teilweise'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private api: ApiService,
    private snack: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.fallId = this.route.snapshot.paramMap.get('fallId')!;

    this.form = this.fb.group({
      datum:              [this.today, Validators.required],
      gewicht:            [null],
      fettmasse:          [null],
      kalorienaufnahme:   [null],
      fettaufnahme:       [null],
      zielerreichung:     [''],
      foerderndefaktoren: [''],
      hemmendefaktoren:   [''],
      notizen:            ['']
    });

    this.api.fallPerId(this.fallId).subscribe({
      next: f => this.patient = f,
      error: () => {}
    });

    this.api.zieleGetLatest(this.fallId).subscribe({
      next: z => this.ziel = z,
      error: () => {}
    });

    // Load any previously generated monitoring adaption (kept separate from assessment KI)
    this.api.kiLetzteMonitoringAdaption(this.fallId).subscribe({
      next: d => { if (d?.empfehlung) this.kiAdaption = d.empfehlung; },
      error: () => {}
    });

    this.ladeVerlauf();
  }

  ladeVerlauf() {
    this.laedt = true;
    this.api.monitoringPerFall(this.fallId).subscribe({
      next: data => {
        this.verlauf = data;
        this.berechneFaelligkeit();
        this.laedt = false;
      },
      error: () => { this.laedt = false; }
    });
  }

  berechneFaelligkeit() {
    if (!this.verlauf.length) {
      const next = new Date();
      next.setDate(next.getDate() + 14);
      this.status = {
        faellig: false,
        naechstesDatum: next.toISOString().split('T')[0],
        letzteMessung: null,
        tageVerbleibend: 14
      };
      return;
    }
    const sorted = [...this.verlauf].sort(
      (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
    );
    const letzte = new Date(sorted[0].datum);
    const next = new Date(letzte);
    next.setDate(next.getDate() + 14);
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);
    const diff = Math.ceil((next.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24));
    this.status = {
      faellig: next <= heute,
      naechstesDatum: next.toISOString().split('T')[0],
      letzteMessung: sorted[0].datum,
      tageVerbleibend: diff > 0 ? diff : 0
    };
  }

  speichern() {
    if (this.form.invalid) return;
    this.speichert = true;
    this.api.monitoringSpeichern({ ...this.form.value, fallId: this.fallId }).subscribe({
      next: () => {
        this.speichert = false;
        this.snack.open('Messung gespeichert! ✓', 'OK', { duration: 3000 });
        this.form.reset();
        this.form.patchValue({ datum: this.today });
        this.ladeVerlauf();
      },
      error: () => {
        this.speichert = false;
        this.snack.open('Fehler beim Speichern!', 'OK', { duration: 3000 });
      }
    });
  }

  kiAdaptionGenerieren() {
    this.kiLaedt = true;
    this.api.kiMonitoringAdaption(this.fallId).subscribe({
      next: res => {
        this.kiAdaption = res.empfehlung;
        this.kiLaedt = false;
        this.snack.open('KI-Auswertung erstellt! ✓', 'OK', { duration: 3000 });
      },
      error: () => {
        this.kiLaedt = false;
        this.kiAdaption = '⚠️ Groq nicht erreichbar. Bitte API-Key prüfen.';
        this.snack.open('KI-Fehler', 'OK', { duration: 3000 });
      }
    });
  }

  // Convert markdown → safe HTML
  get kiAdaptionHtml(): SafeHtml {
    if (!this.kiAdaption) return '';
    const html = this.kiAdaption
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^#{1,3}\s+(.+)$/gm,
        '<p style="font-weight:600;margin:14px 0 5px;font-size:13.5px;">$1</p>')
      .replace(/^\d+\.\s+(.+)$/gm,
        '<p style="margin:4px 0 4px 14px;">$1</p>')
      .replace(/^[-–•]\s+(.+)$/gm,
        '<p style="margin:4px 0 4px 14px;">• $1</p>')
      .replace(/\n\n+/g, '<br><br>')
      .replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  deltaGewicht(aktuell: number, vorher: number): string {
    if (aktuell == null || vorher == null) return '';
    const d = aktuell - vorher;
    return (d > 0 ? '+' : '') + d.toFixed(1) + ' kg';
  }

  // "Noch zu verlieren" — always shown as a positive distance to go,
  // with separate logic for "already at/below goal"
  nochZuZiel(aktuell: number, zielwert: number): number {
    if (aktuell == null || zielwert == null) return 0;
    return Math.round((aktuell - zielwert) * 10) / 10;
  }

  zielErreicht(aktuell: number, zielwert: number): boolean {
    if (aktuell == null || zielwert == null) return false;
    return aktuell <= zielwert;
  }

  // Fortschritt: nur sinnvoll wenn mind. 2 Messungen vorhanden sind
  fortschrittProzent(start: number, aktuell: number, zielwert: number): number | null {
    if (start == null || aktuell == null || zielwert == null) return null;
    const anzahlMitGewicht = this.verlauf.filter(m => m.gewicht != null).length;
    if (anzahlMitGewicht < 2) return null; // not enough weighed entries yet
    const total = start - zielwert;
    if (total === 0) return 100;
    const achieved = start - aktuell;
    return Math.max(0, Math.min(100, Math.round((achieved / total) * 100)));
  }

  abs(v: number): number { return Math.abs(v); }

  get startGewicht(): number | null {
    if (!this.verlauf.length) return null;
    const sorted = [...this.verlauf]
      .filter(m => m.gewicht != null)
      .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());
    return sorted.length ? sorted[0].gewicht : null;
  }

  get latestGewicht(): number | null {
    if (!this.verlauf.length) return null;
    const sorted = [...this.verlauf]
      .filter(m => m.gewicht != null)
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
    return sorted.length ? sorted[0].gewicht : null;
  }
}