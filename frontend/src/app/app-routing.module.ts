import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // { path: '', redirectTo: 'public', pathMatch: 'full'},
  {
    path: '',
    loadChildren: () => import('./pages/public/intro/intro.module').then(m => m.IntroPageModule),
  },
  {
    path: 'public',
    loadChildren: () => import('./pages/public/initial/initial.module').then( m => m.InitialPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
