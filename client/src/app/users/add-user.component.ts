import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormField, FormRoot, submit } from '@angular/forms/signals';
import { AddUserFormService } from './add-user.form.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

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
  private addUserFormService = inject(AddUserFormService);
  addUserForm = this.addUserFormService.addUserForm;

  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // TODO - use save service and model vs form model
  async onSave() {
    await submit(this.addUserFormService.addUserForm, async (field) => {
      await this.save();
    });
  }

  private async save() {
    try {
      const result = await firstValueFrom(
        this.userService.addUser(
          this.addUserFormService.formToDomainModel(this.addUserForm().value()),
        ),
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
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
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
    }
  }
}
