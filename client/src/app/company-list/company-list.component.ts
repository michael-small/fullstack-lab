import { Component, inject, ResourceRef } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CompanyCardComponent } from '../company-card/company-card.component';
import { UserService } from '../users/user.service';
import { Company } from './company';

@Component({
  selector: 'app-company-list',
  imports: [CompanyCardComponent],
  templateUrl: './company-list.component.html',
  styles: ``,
})
export class CompanyListComponent {
  private userService = inject(UserService);

  companies: ResourceRef<Company[]> = rxResource({
    stream: () => this.userService.getCompanies(),
    defaultValue: [],
  });
}
