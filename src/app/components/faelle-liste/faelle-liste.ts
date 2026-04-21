import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-faelle-liste',
  templateUrl: './faelle-liste.component.html',
  standalone: false,
})
export class FaelleListeComponent implements OnInit {
  faelle: any[] = [];
  spalten = ['anonymerCode', 'erstelltVon', 'alterJahre', 'geschlecht', 'erstelltAm', 'aktion'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.alleFaelle().subscribe({
      next: data => this.faelle = data,
      error: err => console.error('Fehler beim Laden', err)
    });
  }
}