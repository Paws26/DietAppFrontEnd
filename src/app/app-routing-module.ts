import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeuerFallComponent } from './components/neuer-fall/neuer-fall.component';
import { FaelleListeComponent } from './components/faelle-liste/faelle-liste';
import { AssessmentComponent } from './components/assessment/assessment.component';

const routes: Routes = [
  { path: '',                   component: FaelleListeComponent },
  { path: 'neu',                component: NeuerFallComponent },
  { path: 'assessment/:fallId', component: AssessmentComponent },
  { path: '**',                 redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
