import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  standalone: false
})
export class AssessmentComponent implements OnInit {
  fallId!: string;
  patient: { vorname: string; nachname: string } | null = null;
  schritt = 0;
  schritte = ['Allgemein', 'Körper', 'Ernährung', 'Diagnose', 'KI Empfehlung'];
  loading = false;
  saving = false;
  
  // Store the loaded data
  loadedData = {
    allgemein: null as any,
    koerper: null as any,
    ernaehrung: null as any,
    diagnose: null as any
  };
  
  allgemeinForm!: FormGroup;
  koerperForm!: FormGroup;
  ernaehrungForm!: FormGroup;
  diagnoseForm!: FormGroup;
  kiAdvice: string | null = null;

  // Dropdown options
  muedigkeitOpt = ['gering', 'mittel', 'hoch'];
  wissenOpt = ['gering', 'mittel', 'gut'];
  motivationOpt = ['gering', 'mittel', 'hoch', 'sehr hoch'];
  laborOpt = ['im Referenzbereich','Blutzucker erhöht','Cholesterin erhöht','Triglyzeride erhöht','HbA1c erhöht','mehrere Werte auffällig'];
  palOpt = ['1.2','1.4','1.6','1.8','2.0','2.2'];
  zuckerOpt = ['keine','1-2/Tag','3-4/Tag','5-7/Tag','mehr als 7/Tag'];
  alkoholOpt = ['kein','gelegentlich','1-2x/Woche','täglich 1-2','täglich mehr als 2'];
  fertigOpt = ['selten','1-2x/Woche','mehrmals/Woche','täglich','fast ausschliesslich'];
  suessOpt = ['selten','mehrmals/Woche','täglich wenig','täglich viel'];
  diagnoseOpt = ['Übermässige Energie- und Fettzufuhr','Mangelnde Flüssigkeitszufuhr','Unzureichende Ballaststoffzufuhr','Übermässiger Zuckerkonsum','Unregelmässige Mahlzeiten','Sonstige'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.fallId = this.route.snapshot.paramMap.get('fallId')!;
    console.log('Loading assessment for fallId:', this.fallId);
    this.baueFormulare();
    this.ladeVorhandeneDaten();
  }

  baueFormulare() {
    this.allgemeinForm = this.fb.group({
      muedigkeitLevel: [''],
      kopfschmerzen: [false],
      wissenErnaehrungLevel: [''],
      motivationLevel: [''],
      klientenPerspektive: [''],
      notizen: ['']
    });
    
    this.koerperForm = this.fb.group({
      groesse: [null],
      gewicht: [null],
      bmi: [null],
      bmiPerzentile: [''],
      blutdruckSystolisch: [null],
      blutdruckDiastolisch: [null],
      fettmasse: [null],
      fettmasseIdealMin: [null],
      fettmasseIdealMax: [null],
      muskelmasse: [null],
      muskelmasseHoch: [false],
      phasenwinkel: [null],
      koerperzellmasse: [null],
      koerperzellmasseIdealMin: [null],
      koerperzellmasseIdealMax: [null],
      laborparameterStatus: ['im Referenzbereich']
    });
    
    this.ernaehrungForm = this.fb.group({
      palWert: ['1.8'],
      energiebedarfKcal: [null],
      eiweissbedarfG: [null],
      fettbedarfG: [null],
      kohlenhydratbedarfG: [null],
      ballaststoffbedarfG: [null],
      fluessigkeitsbedarfMl: [null],
      kalorienaufnahme: [null],
      fettaufnahme: [null],
      kohlenhydrate: [null],
      zuckergetraenke: [''],
      alkoholKonsum: [''],
      fertigprodukteKonsum: [''],
      suesswarenKonsum: [''],
      kochbereitschaft: [false],
      baecktGerne: [false],
      notizen: ['']
    });
    
    this.diagnoseForm = this.fb.group({
      problem: [''],
      ursache: [''],
      symptom: [''],
      foerderfaktoren: [''],
      barrieren: [''],
      prioritaet: [1]
    });
  }

  ladeVorhandeneDaten() {
    this.loading = true;

    this.api.fallPerId(this.fallId).subscribe(fall => {
      this.patient = fall;
    });
    
    // Load Allgemein
    this.api.allgemeinGetLatest(this.fallId).subscribe({
      next: (data) => {
        if (data) {
          this.loadedData.allgemein = data;
          this.allgemeinForm.patchValue({
            muedigkeitLevel: data.muedigkeitLevel,
            kopfschmerzen: data.kopfschmerzen,
            wissenErnaehrungLevel: data.wissenErnaehrungLevel,
            motivationLevel: data.motivationLevel,
            klientenPerspektive: data.klientenPerspektive,
            notizen: data.notizen
          });
          console.log('✅ Loaded Allgemein data:', data);
        } else {
          console.log('No Allgemein data found for this patient');
        }
      },
      error: (err) => console.error('Error loading allgemein:', err)
    });

    // Load Koerper
    this.api.koerperGetLatest(this.fallId).subscribe({
      next: (data) => {
        if (data) {
          this.loadedData.koerper = data;
          this.koerperForm.patchValue({
            groesse: data.groesse,
            gewicht: data.gewicht,
            bmi: data.bmi,
            bmiPerzentile: data.bmiPerzentile,
            blutdruckSystolisch: data.blutdruckSystolisch,
            blutdruckDiastolisch: data.blutdruckDiastolisch,
            fettmasse: data.fettmasse,
            fettmasseIdealMin: data.fettmasseIdealMin,
            fettmasseIdealMax: data.fettmasseIdealMax,
            muskelmasse: data.muskelmasse,
            muskelmasseHoch: data.muskelmasseHoch,
            phasenwinkel: data.phasenwinkel,
            koerperzellmasse: data.koerperzellmasse,
            koerperzellmasseIdealMin: data.koerperzellmasseIdealMin,
            koerperzellmasseIdealMax: data.koerperzellmasseIdealMax,
            laborparameterStatus: data.laborparameterStatus
          });
          console.log('✅ Loaded Koerper data:', data);
        } else {
          console.log('No Koerper data found for this patient');
        }
      },
      error: (err) => console.error('Error loading koerper:', err)
    });

    // Load Ernaehrung
    this.api.ernaehrungGetLatest(this.fallId).subscribe({
      next: (data) => {
        if (data) {
          this.loadedData.ernaehrung = data;
          this.ernaehrungForm.patchValue({
            palWert: data.palWert,
            energiebedarfKcal: data.energiebedarfKcal,
            eiweissbedarfG: data.eiweissbedarfG,
            fettbedarfG: data.fettbedarfG,
            kohlenhydratbedarfG: data.kohlenhydratbedarfG,
            ballaststoffbedarfG: data.ballaststoffbedarfG,
            fluessigkeitsbedarfMl: data.fluessigkeitsbedarfMl,
            kalorienaufnahme: data.kalorienaufnahme,
            fettaufnahme: data.fettaufnahme,
            kohlenhydrate: data.kohlenhydrate,
            zuckergetraenke: data.zuckergetraenke,
            alkoholKonsum: data.alkoholKonsum,
            fertigprodukteKonsum: data.fertigprodukteKonsum,
            suesswarenKonsum: data.suesswarenKonsum,
            kochbereitschaft: data.kochbereitschaft,
            baecktGerne: data.baecktGerne,
            notizen: data.notizen
          });
          console.log('✅ Loaded Ernaehrung data:', data);
        } else {
          console.log('No Ernaehrung data found for this patient');
        }
      },
      error: (err) => console.error('Error loading ernaehrung:', err)
    });

    // Load Diagnose
    this.api.diagnoseGetLatest(this.fallId).subscribe({
      next: (data) => {
        if (data) {
          this.loadedData.diagnose = data;
          this.diagnoseForm.patchValue({
            problem: data.problem,
            ursache: data.ursache,
            symptom: data.symptom,
            foerderfaktoren: data.foerderfaktoren,
            barrieren: data.barrieren,
            prioritaet: data.prioritaet
          });
          console.log('✅ Loaded Diagnose data:', data);
        } else {
          console.log('No Diagnose data found for this patient');
        }
        this.loading = false;
        
        // If there's already data, show a message
        if (this.hasAnyData()) {
          this.snack.open('Vorhandene Daten wurden geladen', 'OK', { duration: 2000 });
        }
      },
      error: (err) => {
        console.error('Error loading diagnose:', err);
        this.loading = false;
      }
    });
    this.api.kiLetzteEmpfehlung(this.fallId).subscribe({
      next: data => { if (data?.empfehlung) this.kiAdvice = data.empfehlung; },
      error: () => {}
});
  }
  
  hasAnyData(): boolean {
    return this.loadedData.allgemein !== null ||
           this.loadedData.koerper !== null ||
           this.loadedData.ernaehrung !== null ||
           this.loadedData.diagnose !== null;
  }

  bmiBerechnen() {
    const g = this.koerperForm.value.groesse;
    const w = this.koerperForm.value.gewicht;
    if (g && w) {
      const bmi = w / Math.pow(g / 100, 2);
      this.koerperForm.patchValue({ bmi: Math.round(bmi * 10) / 10 });
    }
  }

  abweichung(ist: number, bedarf: number): string {
    if (!ist || !bedarf) return '';
    const pct = ((ist - bedarf) / bedarf * 100).toFixed(1);
    return `${pct}%`;
  }

  generateAIAdvice() {
    this.saving = true;
    this.api.kiEmpfehlung(this.fallId).subscribe({
      next: res => {
        this.kiAdvice = res.empfehlung;
        this.saving = false;
        this.snack.open('KI-Empfehlung gespeichert!', 'OK', { duration: 3000 });
      },
      error: err => {
        this.saving = false;
        this.kiAdvice = 'Fehler: ChatGPT nicht erreichbar. Bitte OpenAI Key in application.properties pruefen!';
        this.snack.open('ChatGPT Fehler!', 'OK', { duration: 4000 });
      }
    });
  }
  
  goToStep(step: number) {
    this.schritt = step;
    // If going to KI step and no advice yet, generate it
    if (step === 4 && !this.kiAdvice && this.hasAnyData()) {
      this.generateAIAdvice();
    }
  }

  speichereUndWeiter() {
    this.saving = true;
    
    let saveObservable;
    
    if (this.schritt === 0) {
      saveObservable = this.api.allgemeinSpeichern({ 
        ...this.allgemeinForm.value, 
        fallId: this.fallId 
      });
    } else if (this.schritt === 1) {
      saveObservable = this.api.koerperSpeichern({ 
        ...this.koerperForm.value, 
        fall: { id: this.fallId } 
      });
    } else if (this.schritt === 2) {
      saveObservable = this.api.ernaehrungSpeichern({ 
        ...this.ernaehrungForm.value, 
        fall: { id: this.fallId } 
      });
    } else if (this.schritt === 3) {
      saveObservable = this.api.diagnoseSpeichern({ 
        ...this.diagnoseForm.value, 
        fallId: this.fallId 
      });
    }
    
    if (saveObservable) {
      saveObservable.subscribe({
        next: () => {
          this.saving = false;
          
          if (this.schritt < 3) {
            this.schritt++;
            this.snack.open('Gespeichert!', 'OK', { duration: 1500 });
          } else if (this.schritt === 3) {
            this.schritt++;
            this.generateAIAdvice();
          }
        },
        error: (err) => {
          console.error('Save error:', err);
          this.saving = false;
          this.snack.open('Fehler beim Speichern!', 'OK', { duration: 3000 });
        }
      });
    }
  }

  weiter() {
    if (this.schritt === 4) {
      this.router.navigate(['/']);
    } else {
      this.speichereUndWeiter();
    }
  }

  zurueck() { 
    if (this.schritt > 0) this.schritt--; 
  }
}