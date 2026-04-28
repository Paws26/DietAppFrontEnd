import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-faelle-liste',
  templateUrl: './faelle-liste.component.html',
  standalone: false
})
export class FaelleListeComponent implements OnInit {
  faelle: any[] = [];
  spalten = ['name', 'alterJahre', 'geschlecht', 'code', 'erstelltAm', 'aktion'];
  fehler = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.alleFaelle().subscribe({
      next:  data => this.faelle = data,
      error: ()   => this.fehler = 'Verbindung zum Backend fehlgeschlagen!'
    });
  }
}