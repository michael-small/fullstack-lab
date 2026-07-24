import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { MockUserService } from '../../testing/user.service.mock';
import { User } from './user';
import { UserProfileComponent } from './user-profile.component';
import { UserService } from './user.service';

describe('UserProfileComponent', async () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let userService: UserService;
  const chrisId = 'chris_id';
  let harness: RouterTestingHarness;

  const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        provideRouter([{ path: 'users/:id', component: UserProfileComponent }]),
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(UserProfileComponent);
    userService = TestBed.inject(UserService);

    harness = await RouterTestingHarness.create();
  });

  it('should create the component', async () => {
    const component = await harness.navigateByUrl(
      `/users/${chrisId}`,
      UserProfileComponent,
    );
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific user profile', async () => {
    const expectedUser: User = MockUserService.testUsers[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `UserProfileComponent` subscribes to that, so
    // it should update right away.
    const component = await harness.navigateByUrl(
      `/users/${expectedUser._id}`,
      UserProfileComponent,
    );
    expect(component.user()).toEqual(expectedUser);
  });

  it('should navigate to correct user when the id parameter changes', async () => {
    let expectedUser: User = MockUserService.testUsers[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `UserProfileComponent` subscribes to that, so
    // it should update right away.
    const component = await harness.navigateByUrl(
      `/users/${expectedUser._id}`,
      UserProfileComponent,
    );
    expect(component.user()).toEqual(expectedUser);

    // Changing the paramMap should update the displayed user profile.
    expectedUser = MockUserService.testUsers[1];
    await harness.navigateByUrl(
      `/users/${expectedUser._id}`,
      UserProfileComponent,
    );
    expect(component.user()).toEqual(expectedUser);
  });

  it('should have `undefined` for the user for a bad ID', async () => {
    const component = await harness.navigateByUrl(
      `/users/badID`,
      UserProfileComponent,
    );

    await wait();
    await fixture.whenStable();
    // If the given ID doesn't map to a user, we expect the service
    // to return `undefined`, so we would expect the component's user
    // to also be `undefined`.
    expect(component.user()).toBeUndefined();
  });

  it('should set error data on observable error', async () => {
    const mockError = {
      message: 'Test Error',
      error: { title: 'Error Title' },
    };

    // "Spy" on the `.getUserById()` method in the user service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const getUserSpy = vi
      .spyOn(userService, 'getUserById')
      .mockReturnValue(throwError(() => mockError));

    const component = await harness.navigateByUrl(
      `/users/${chrisId}`,
      UserProfileComponent,
    );

    expect(component.error()).toEqual({
      help: 'There was a problem loading the user – try again.',
      httpResponse: mockError.message,
      message: mockError.error.title,
    });
    expect(getUserSpy).toHaveBeenCalledWith(chrisId);
  });
});
