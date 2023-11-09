import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { NotFoundComponent } from '../shared/not-found/not-found.component';

const routes: Routes = [
  { path: '', component: ProfileComponent },
  { path: ':id', component: ProfileComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
