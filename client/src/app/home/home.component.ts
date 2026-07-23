import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatCardModule]
})
export class HomeComponent {

}
