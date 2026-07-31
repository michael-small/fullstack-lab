import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User, UserRole } from './user';
import { UserService } from './user.service';
import {
  email,
  form,
  FormField,
  FormRoot,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

// We use `Omit<User, 'age'> & { age: number | null }` here because the `User` model expects a number for age,
// but the form control for age could be null. So we allow null in the form model,
// but when we submit the form, we will have a number for age.
// https://angular.dev/guide/forms/signals/model-design#form-model-vs-domain-model
export type AddUserFormModel = Omit<User, 'age' | '_id'> & {
  age: number | null;
};
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  imports: [
    FormRoot,
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
  ],
})
export class AddUserComponent {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  addUserModel = signal<AddUserFormModel>({
    name: '',
    age: null,
    company: '',
    email: '',
    role: 'viewer',
  });

  addUserForm = form(this.addUserModel, (p) => {
    // `name`
    required(p.name, { message: 'Name is required' });
    minLength(p.name, 2, {
      message: 'Name must be at least 2 characters long',
    });
    maxLength(p.name, 50, {
      message: 'Name cannot be more than 50 characters long',
    });
    validate(p.name, ({ value }) => {
      if (
        value().toLowerCase() === 'abc123' ||
        value().toLowerCase() === '123abc'
      ) {
        return { kind: 'existingName', message: 'Name has already been taken' };
      } else {
        return null;
      }
    });
    // `age`
    required(p.age, { message: 'Age is required' });
    min(p.age, 15, { message: 'Age must be at least 15' });
    max(p.age, 200, { message: 'Age may not be greater than 200' });
    // TODO - int validation needed? '^[0-9]+$'
    // pattern(p.age, /^[0-9]+$/, { message: 'Age must be a number' });
    // `email`
    required(p.email, { message: 'Email is required' });
    email(p.email, { message: 'Email must be formatted properly' });
    // `role`
    required(p.role, { message: 'Role is required' });
    pattern(p.role, /^(admin|editor|viewer)$/, {
      message: 'Role must be Admin, Editor, or Viewer',
    });
  });

  // TODO - make shared util
  formControlHasError(controlName: keyof AddUserFormModel): boolean {
    this.addUserForm.age().errors;
    return (this.addUserForm[controlName]?.().errors().length ?? 0) > 0;
  }

  // TODO - make shared util
  getErrorMessage(name: keyof AddUserFormModel): string {
    for (const { message } of this.addUserForm[name]?.()?.errors() ?? []) {
      return message ?? '';
    }
    return 'Unknown error';
  }

  // TODO - use save service and model vs form model
  async onSave() {
    await submit(this.addUserForm, async (field) => {
      try {
        const result = await firstValueFrom(
          this.userService.addUser({
            // The `User` model expects a number, but the form control for age could be null. So default to a number.
            ...this.addUserForm().value(),
            age: this.addUserForm().value().age ?? 15,
          }),
        );

        if (result) {
          this.snackBar.open(
            `Added user ${this.addUserForm().value().name}`,
            undefined,
            {
              duration: 2000,
            },
          );
          this.router.navigate(['/users/', result]);
          return;
        }

        return {
          kind: 'serverError',
          message: 'Failed to add user',
        };
      } catch (err: HttpErrorResponse | any) {
        if (err.status === 400) {
          this.snackBar.open(
            `Tried to add an illegal new user – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 },
          );
        } else if (err.status === 500) {
          this.snackBar.open(
            `The server failed to process your request to add a new user. Is the server up? – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 },
          );
        } else {
          this.snackBar.open(
            `An unexpected error occurred – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 },
          );
        }
      }
    });
  }
}
