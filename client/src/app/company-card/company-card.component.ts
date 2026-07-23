import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Company } from '../company-list/company';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-company-card',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent],
  templateUrl: './company-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './company-card.component.scss'
})
export class CompanyCardComponent {
  @Input() company: Company;
}
