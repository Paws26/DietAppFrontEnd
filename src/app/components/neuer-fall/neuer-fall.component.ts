import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-neuer-fall',
  templateUrl: './neuer-fall.component.html',
  standalone: false
})
export class NeuerFallComponent {
  form: FormGroup;
  laedt = false;
  geschlechter = ['maennlich', 'weiblich', 'divers'];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      erstelltVon: ['', Validators.required],
      alterJahre:  [null],
      geschlecht:  ['']
    });
  }

  speichern() {
    if (this.form.invalid) return;
    this.laedt = true;
    this.api.neuerFall(this.form.value).subscribe({
      next: fall => {
        this.snack.open('Fall angelegt! Code: ' + fall.anonymerCode, 'OK', { duration: 5000 });
        this.router.navigate(['/assessment', fall.id]);
      },
      error: () => {
        this.snack.open('Fehler beim Speichern!', 'OK', { duration: 3000 });
        this.laedt = false;
      }
    });
  }
}