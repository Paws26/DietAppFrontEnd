import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  standalone: false
})
export class AssessmentComponent implements OnInit {
  fallId!: string;
  patient: any = null;
  schritt = 0;
  schritte = ['Allgemein', 'Körper', 'Ernährung', 'Diagnose', 'Ziele', 'KI Empfehlung'];
  loading = false;
  saving  = false;
  kiAdvice: string | null = null;

  allgemeinForm!: FormGroup;
  koerperForm!:   FormGroup;
  ernaehrungForm!: FormGroup;
  diagnoseForm!:  FormGroup;
  zieleForm!:     FormGroup;

  // ── Dropdown options ─────────────────────────────────────────────────────
  muedigkeitOpt   = ['gering', 'mittel', 'hoch'];
  wissenOpt       = ['gering', 'mittel', 'gut'];
  motivationOpt   = ['sehr gering', 'gering', 'mittel', 'hoch', 'sehr hoch'];
  laborOpt        = [
    'im Referenzbereich', 'Blutzucker erhöht', 'Cholesterin erhöht',
    'Triglyzeride erhöht', 'HbA1c erhöht', 'mehrere Werte auffällig'
  ];
  palOpt          = ['1.2', '1.4', '1.6', '1.8', '2.0', '2.2'];
  zuckerOpt       = ['keine', '1–2/Tag', '3–4/Tag', '5–7/Tag', 'mehr als 7/Tag'];
  alkoholOpt      = ['kein', 'gelegentlich', '1–2×/Woche', 'täglich 1–2', 'täglich mehr als 2'];
  fertigOpt       = ['selten', '1–2×/Woche', 'mehrmals/Woche', 'täglich', 'fast ausschließlich'];
  suessOpt        = ['selten', 'mehrmals/Woche', 'täglich wenig', 'täglich viel'];
  diagnoseOpt     = [
    'Übermäßige Energie- und Fettzufuhr',
    'Zu hohe Energieaufnahme',
    'Zu hohe Fettaufnahme',
    'Zu hohe Kohlenhydratzufuhr',
    'Mangelnde Flüssigkeitszufuhr',
    'Unzureichende Ballaststoffzufuhr',
    'Übermäßiger Zuckerkonsum',
    'Unregelmäßige Mahlzeiten',
    'Sonstige'
  ];
  langzielOpt     = [
    'Gewichtsabnahme mit Fokus auf Reduktion der Fettmasse',
    'Normoglykämische Blutzuckereinstellung',
    'Verbesserung der Blutfettwerte',
    'Senkung des Blutdrucks',
    'Verbesserung der allgemeinen Ernährungsqualität'
  ];
  interventionszielOpt = [
    'Energie- und Fettaufnahme reduzieren',
    'Energie-, Fett- und Kohlenhydratzufuhr reduzieren',
    'Flüssigkeitsaufnahme steigern',
    'Ballaststoffzufuhr erhöhen',
    'Mahlzeitenstruktur verbessern',
    'Lebensmittelauswahl optimieren'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private snack: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.fallId = this.route.snapshot.paramMap.get('fallId')!;
    this.baueFormulare();
    this.ladeDaten();
  }

  // ── Convert markdown → safe HTML for display ─────────────────────────────
  get kiAdviceHtml(): SafeHtml {
    if (!this.kiAdvice) return '';
    let html = this.kiAdvice
      // Bold **text**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic *text*
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Headers: lines starting with # or ##
      .replace(/^#{2,3}\s+(.+)$/gm,
        '<p style="font-weight:600;margin:14px 0 6px;font-size:14px;">$1</p>')
      // Emoji section headers like 📋 ANALYSE...
      .replace(/^([\u{1F300}-\u{1FFFF}][\s\S]*?)$/gmu,
        '<p style="font-weight:600;margin:16px 0 6px;font-size:13.5px;color:#166534;">$1</p>')
      // Numbered list items
      .replace(/^\d+\.\s+(.+)$/gm,
        '<p style="margin:4px 0 4px 16px;">• $1</p>')
      // Bullet list items starting with -
      .replace(/^[-–]\s+(.+)$/gm,
        '<p style="margin:4px 0 4px 16px;">• $1</p>')
      // Table rows with |
      .replace(/^\|(.+)\|$/gm, (match) => {
        if (match.includes('---')) return '';
        const cells = match.split('|').filter(c => c.trim());
        const isHeader = false;
        return '<div style="display:flex;gap:8px;border-bottom:1px solid #bbf7d0;padding:5px 0;">' +
          cells.map(c => `<span style="flex:1;font-size:12.5px;">${c.trim()}</span>`).join('') +
          '</div>';
      })
      // Double newlines → paragraph breaks
      .replace(/\n\n+/g, '<br><br>')
      // Single newlines → breaks
      .replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ── Build all forms ──────────────────────────────────────────────────────
  baueFormulare() {
    this.allgemeinForm = this.fb.group({
      muedigkeitLevel:       [''],
      kopfschmerzen:         [false],
      wissenErnaehrungLevel: [''],
      motivationLevel:       [''],
      klientenPerspektive:   [''],
      notizen:               ['']
    });

    this.koerperForm = this.fb.group({
      groesse:                    [null],
      gewicht:                    [null],
      bmi:                        [null],
      bmiPerzentile:              [''],
      blutdruckSystolisch:        [null],
      blutdruckDiastolisch:       [null],
      fettmasse:                  [null],
      fettmasseIdealMin:          [null],
      fettmasseIdealMax:          [null],
      muskelmasse:                [null],
      muskelmasseHoch:            [false],
      phasenwinkel:               [null],
      koerperzellmasse:           [null],
      koerperzellmasseIdealMin:   [null],
      koerperzellmasseIdealMax:   [null],
      laborparameterStatus:       ['im Referenzbereich']
    });

    this.ernaehrungForm = this.fb.group({
      palWert:               ['1.8'],
      energiebedarfKcal:     [null],
      eiweissbedarfG:        [null],
      fettbedarfG:           [null],
      kohlenhydratbedarfG:   [null],
      ballaststoffbedarfG:   [null],
      fluessigkeitsbedarfMl: [null],
      kalorienaufnahme:      [null],
      fettaufnahme:          [null],
      kohlenhydrate:         [null],
      zuckergetraenke:       [''],
      alkoholKonsum:         [''],
      fertigprodukteKonsum:  [''],
      suesswarenKonsum:      [''],
      kochbereitschaft:      [false],
      baecktGerne:           [false],
      notizen:               ['']
    });

    this.diagnoseForm = this.fb.group({
      problem:         [''],
      ursache:         [''],
      symptom:         [''],
      foerderfaktoren: [''],
      barrieren:       [''],
      prioritaet:      [1]
    });

    this.zieleForm = this.fb.group({
      langfristigesZiel:  [''],
      interventionsziel:  [''],
      zielGewicht:        [null],
      zielFettmasse:      [null],
      zielKalorien:       [null],
      zielFettaufnahme:   [null],
      zielDatum:          [''],
      status:             ['offen']
    });
  }

  // ── Load existing data ───────────────────────────────────────────────────
  ladeDaten() {
    this.loading = true;
    let pending = 6;
    const done = () => { if (--pending === 0) this.loading = false; };

    this.api.fallPerId(this.fallId).subscribe({
      next: f => { this.patient = f; done(); },
      error: () => done()
    });

    this.api.allgemeinGetLatest(this.fallId).subscribe({
      next: d => { if (d) this.allgemeinForm.patchValue(d); done(); },
      error: () => done()
    });

    this.api.koerperGetLatest(this.fallId).subscribe({
      next: d => { if (d) this.koerperForm.patchValue(d); done(); },
      error: () => done()
    });

    this.api.ernaehrungGetLatest(this.fallId).subscribe({
      next: d => { if (d) this.ernaehrungForm.patchValue(d); done(); },
      error: () => done()
    });

    this.api.diagnoseGetLatest(this.fallId).subscribe({
      next: d => { if (d) this.diagnoseForm.patchValue(d); done(); },
      error: () => done()
    });

    this.api.zieleGetLatest(this.fallId).subscribe({
      next: d => {
        if (d) {
          this.zieleForm.patchValue({
            ...d,
            zielDatum: d.zielDatum
              ? new Date(d.zielDatum).toISOString().split('T')[0]
              : ''
          });
        }
        done();
      },
      error: () => done()
    });

    this.api.kiLetzteEmpfehlung(this.fallId).subscribe({
      next: d => { if (d?.empfehlung) this.kiAdvice = d.empfehlung; },
      error: () => {}
    });
  }

  // ── BMI auto-calculation ─────────────────────────────────────────────────
  bmiBerechnen() {
    const g = this.koerperForm.value.groesse;
    const w = this.koerperForm.value.gewicht;
    if (g && w && g > 0) {
      const bmi = w / Math.pow(g / 100, 2);
      this.koerperForm.patchValue({ bmi: Math.round(bmi * 10) / 10 });
    }
  }

  // ── Energiebedarf auto-calculation (Harris-Benedict + PAL) ────────────────
  // Nutzt Größe/Gewicht aus Körper-Schritt, Alter/Geschlecht aus Patient,
  // und den eingetragenen PAL-Wert. Berechnet Grundumsatz, TEE und Makros.
  energiebedarfBerechnen() {
    const groesse = this.koerperForm.value.groesse;
    const gewicht = this.koerperForm.value.gewicht;
    const alter = this.patient?.alterJahre;
    const geschlecht = (this.patient?.geschlecht || '').toLowerCase();
    const pal = parseFloat(this.ernaehrungForm.value.palWert) || 1.6;

    if (!groesse || !gewicht || !alter) {
      this.snack.open(
        'Größe, Gewicht (Schritt Körper) und Alter (Patient) werden benötigt',
        'OK', { duration: 3000 }
      );
      return;
    }

    // Harris-Benedict (revidiert)
    let grundumsatz: number;
    if (geschlecht.startsWith('w') || geschlecht.startsWith('f')) {
      // weiblich
      grundumsatz = 655.1 + (9.56 * gewicht) + (1.85 * groesse) - (4.68 * alter);
    } else {
      // männlich (Standard, falls divers/unbekannt wird männliche Formel verwendet)
      grundumsatz = 66.5 + (13.75 * gewicht) + (5.0 * groesse) - (6.78 * alter);
    }

    const energiebedarf = Math.round(grundumsatz * pal);

    // Makronährstoffe: 20% Eiweiß, 30% Fett, 50% Kohlenhydrate (Standardverteilung)
    const eiweiss = Math.round((energiebedarf * 0.20) / 4);
    const fett = Math.round((energiebedarf * 0.30) / 9);
    const kohlenhydrate = Math.round((energiebedarf * 0.50) / 4);

    // Ballaststoffe: DACH-Pauschalwert, unabhängig vom Kalorienbedarf
    const ballaststoffe = 30;

    // Flüssigkeit: ~35 ml/kg bei Normalgewicht, reduzierter Faktor bei Adipositas
    // (sonst unrealistisch hohe Trinkmengen bei sehr hohem Körpergewicht)
    const bmi = parseFloat(this.koerperForm.value.bmi) || null;
    let mlProKg = 35;
    if (bmi !== null && bmi >= 30) mlProKg = 26;       // Adipositas: reduzierter Faktor
    else if (bmi !== null && bmi >= 25) mlProKg = 30;  // Übergewicht: leicht reduziert
    const fluessigkeit = Math.round((gewicht * mlProKg) / 50) * 50; // auf 50ml runden

    this.ernaehrungForm.patchValue({
      energiebedarfKcal: energiebedarf,
      eiweissbedarfG: eiweiss,
      fettbedarfG: fett,
      kohlenhydratbedarfG: kohlenhydrate,
      ballaststoffbedarfG: ballaststoffe,
      fluessigkeitsbedarfMl: fluessigkeit
    });

    this.snack.open(
      `Berechnet mit PAL ${pal}: ${energiebedarf} kcal/d. Falscher PAL-Wert? Dropdown ändern und erneut klicken.`,
      'OK', { duration: 5000 }
    );
  }

  // ── Deviation % ─────────────────────────────────────────────────────────
  abweichung(ist: number, bedarf: number): string {
    if (!ist || !bedarf || bedarf === 0) return '';
    const pct = ((ist - bedarf) / bedarf * 100);
    return (pct > 0 ? '+' : '') + pct.toFixed(1) + '%';
  }

  // ── Auto-suggest goal values from assessment ──────────────────────────────
  zielwerteVorschlagen() {
    const e = this.ernaehrungForm.value;
    const k = this.koerperForm.value;
    const current = this.zieleForm.value;
    const updates: any = {};

    if (!current.zielKalorien && e.energiebedarfKcal)
      updates.zielKalorien = e.energiebedarfKcal;
    if (!current.zielFettaufnahme && e.fettbedarfG)
      updates.zielFettaufnahme = e.fettbedarfG;
    if (!current.zielFettmasse && k.fettmasseIdealMax)
      updates.zielFettmasse = k.fettmasseIdealMax;
    if (!current.zielDatum) {
      const d = new Date();
      d.setDate(d.getDate() + 35);
      updates.zielDatum = d.toISOString().split('T')[0];
    }

    if (Object.keys(updates).length > 0) {
      this.zieleForm.patchValue(updates);
      this.snack.open('Zielwerte vorgeschlagen — bitte prüfen', 'OK',
        { duration: 3000 });
    }
  }

  // ── KI recommendation ────────────────────────────────────────────────────
  generateAIAdvice() {
    this.loading = true;
    this.api.kiEmpfehlung(this.fallId).subscribe({
      next: res => {
        this.kiAdvice = res.empfehlung;
        this.loading = false;
        this.snack.open('KI-Therapieplan erstellt!', 'OK', { duration: 3000 });
      },
      error: () => {
        this.loading = false;
        this.kiAdvice =
          '⚠️ Groq nicht erreichbar. Bitte API-Key in application.properties prüfen.';
        this.snack.open('KI-Fehler', 'OK', { duration: 4000 });
      }
    });
  }

  // ── Step navigation ──────────────────────────────────────────────────────
  goToStep(step: number) {
    this.schritt = step;
    if (step === 4) this.zielwerteVorschlagen();
    if (step === 5 && !this.kiAdvice) this.generateAIAdvice();
  }

  weiter() {
    if (this.schritt === 5) {
      this.router.navigate(['/']);
    } else {
      this.speichereAktuellenSchritt();
    }
  }

  zurueck() {
    if (this.schritt > 0) this.schritt--;
  }

  // ── Save current step ────────────────────────────────────────────────────
  speichereAktuellenSchritt() {
    this.saving = true;
    let obs: any;

    switch (this.schritt) {
      case 0: obs = this.api.allgemeinSpeichern({ ...this.allgemeinForm.value, fallId: this.fallId }); break;
      case 1: obs = this.api.koerperSpeichern({ ...this.koerperForm.value, fall: { id: this.fallId } }); break;
      case 2: obs = this.api.ernaehrungSpeichern({ ...this.ernaehrungForm.value, fall: { id: this.fallId } }); break;
      case 3: obs = this.api.diagnoseSpeichern({ ...this.diagnoseForm.value, fallId: this.fallId }); break;
      case 4: obs = this.api.zieleSpeichern({ ...this.zieleForm.value, fallId: this.fallId }); break;
      default: this.saving = false; return;
    }

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.schritt++;
        if (this.schritt === 4) {
          this.zielwerteVorschlagen();
        }
        if (this.schritt === 5) {
          this.generateAIAdvice();
        } else {
          this.snack.open('Gespeichert ✓', 'OK', { duration: 1500 });
        }
      },
      error: (err: any) => {
        console.error(err);
        this.saving = false;
        this.snack.open('Fehler beim Speichern!', 'OK', { duration: 3000 });
      }
    });
  }
}