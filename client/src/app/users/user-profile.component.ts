import { Component, inject, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { UserCardComponent } from './user-card.component';
import { UserService } from './user.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { injectParams } from 'ngxtension/inject-params';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  imports: [UserCardComponent, MatCardModule, MatButtonModule],
})
export class UserProfileComponent {
  private userService = inject(UserService);

  // The Angular team recommends something like ngxtension for routing signal utils
  // https://www.reddit.com/r/angular/comments/1uq0xfu/comment/ow6rcfa/
  private id = injectParams<string>('id', { defaultValue: '' });

  // TODO - explain
  user = rxResource({
    params: this.id,
    stream: ({ params }) => this.userService.getUserById(params),
    defaultValue: undefined,
  });

  // The `error` will initially have empty strings for all its components.
  error = computed<{
    help: string;
    httpResponse: string;
    message: string;
  }>(() => {
    const error = this.user.error();
    if (error instanceof HttpErrorResponse) {
      return {
        help: 'There was a problem loading the user – try again.',
        httpResponse: error.message,
        message: error.error?.title ?? '',
      };
    }
    return { help: '', httpResponse: '', message: '' };
  });
}
