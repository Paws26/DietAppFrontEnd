import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-faelle-liste',
  templateUrl: './faelle-liste.component.html',
  standalone: false
})
export class FaelleListeComponent implements OnInit {
  faelle: any[] = [];
  spalten = ['name', 'alterJahre', 'geschlecht', 'erstelltAm', 'aktion'];
  fehler = '';
  loescheId: string | null = null; // which row shows confirm

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() {
    this.laden();
  }

  laden() {
    this.api.alleFaelle().subscribe({
      next:  data => this.faelle = data,
      error: ()   => this.fehler = 'Verbindung zum Backend fehlgeschlagen!'
    });
  }

  bestaetigenLoeschen(id: string) {
    this.loescheId = id;
  }

  abbrechenLoeschen() {
    this.loescheId = null;
  }

  loeschen(id: string) {
    this.api.fallLoeschen(id).subscribe({
      next: () => {
        this.loescheId = null;
        this.snack.open('Patient gelöscht', 'OK', { duration: 3000 });
        this.laden();
      },
      error: () => {
        this.loescheId = null;
        this.snack.open('Fehler beim Löschen!', 'OK', { duration: 3000 });
      }
    });
  }
}