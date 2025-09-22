import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
  <div class="wrap">
    <nav class="nav">
      <a routerLink="/">Dependencias</a>
      <a routerLink="/procesos">Procesos</a>
    </nav>
    <router-outlet></router-outlet>
  </div>`,
  styles: [`
    .wrap{max-width:900px;margin:1rem auto;padding:0 1rem}
    .nav{display:flex;gap:1rem;margin-bottom:1rem}
    a{text-decoration:none}
  `]
})
export class AppComponent {}
