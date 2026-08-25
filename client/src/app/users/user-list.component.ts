import {
  Component,
  computed,
  signal,
  inject,
  effect,
  ResourceRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { User, UserRole } from './user';
import { UserCardComponent } from './user-card.component';
import { UserService } from './user.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField, max, min } from '@angular/forms/signals';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * A component that displays a list of users, either as a grid
 * of cards or as a vertical list.
 *
 * The component supports local filtering by name and/or company,
 * and remote filtering (i.e., filtering by the server) by
 * role and/or age. These choices are fairly arbitrary here,
 * but in "real" projects you want to think about where it
 * makes the most sense to do the filtering.
 */
@Component({
  selector: 'app-user-list-component',
  templateUrl: 'user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    UserCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    FormField,
  ],
})
export class UserListComponent {
  // Gets users from the server
  private userService = inject(UserService);
  // Displays feedback
  private snackBar = inject(MatSnackBar);

  userModel = signal<{
    name: string; // signal forms for strings typically will typically default to empty strings
    age: number | null; // signal forms are fine with `null` for defaults for numbers
    role: UserRole | ''; // still should use an empty string as fallback for a string
    company: string;
    viewType: 'card' | 'list'; // exact option expected
  }>({
    name: '',
    age: null,
    role: '',
    company: '',
    viewType: 'card',
  });

  userForm = form(this.userModel, (p) => {
    // `min`/`max` and other form field validators should be set here and not in the HTML
    // If you copy something from the docs or online, Angular will yell at you to just do this
    min(p.age, 0);
    max(p.age, 200);
  });

  serverFilteredUsers: ResourceRef<User[]> = rxResource({
    params: this.userForm().value,
    stream: ({ params }) => {
      return this.userService.getUsers({
        role: params.role === '' ? undefined : params.role,
        age: params.age !== null ? params.age : undefined,
      });
    },
    defaultValue: [],
  });

  filteredUsers = computed<User[]>(() => {
    const serverFilteredUsers = this.serverFilteredUsers.value();
    const userFormValue = this.userForm().value();

    return this.userService.filterUsers(serverFilteredUsers, {
      name: userFormValue.name,
      company: userFormValue.company,
    });
  });

  errMsg = computed<string>(() => {
    const error = this.serverFilteredUsers.error();
    if (error instanceof HttpErrorResponse) {
      console.log(error);
      return `Problem contacting the server – Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return '';
  });

  constructor() {
    // Docs: "TIP: There are no situations where effect is good, only situations where it is appropriate."
    // https://angular.dev/guide/signals/effect
    // INNAPROPRIATE: if this effect were to be used to update a signal
    // APPROPRIATE: opening the snackbar if there is an error
    effect(
      () => {
        const error = this.errMsg();
        if (error !== '') {
          this.snackBar.open(error, 'OK', { duration: 6000 });
        }
      },
      // Optional, but gives you more info in the Angular Devtools signal graph inspector
      { debugName: 'serverFilteredUsers error snackbar' },
    );
  }
}
