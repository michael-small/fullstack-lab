import { Component, input } from '@angular/core';
import { Company } from '../company-list/company';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-company-card',
  imports: [MatCardModule],
  templateUrl: './company-card.component.html',
  styles: ``,
})
export class CompanyCardComponent {
  company = input.required<Company>();
}
