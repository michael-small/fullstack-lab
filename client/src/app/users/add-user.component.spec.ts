import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Location } from '@angular/common';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { MockUserService } from 'src/testing/user.service.mock';
import { AddUserComponent } from './add-user.component';
import { UserProfileComponent } from './user-profile.component';
import { UserService } from './user.service';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

describe('AddUserComponent#submitForm()', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let userService: UserService;
  let location: Location;
  let loader: HarnessLoader;

  const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddUserComponent, MatSnackBarModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: UserService, useClass: MockUserService }, // A (more-async-tests) - provide + use class of the mock
        provideRouter([{ path: 'users/1', component: UserProfileComponent }]),
      ],
    })
      .compileComponents()
      .catch((error) => {
        expect(error).toBeNull();
      });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService); // B (more-async-tests) - inject the service as the mock
    location = TestBed.inject(Location);
    // We need to inject the router and the HttpTestingController, but
    // never need to use them. So, we can just inject them into the TestBed
    // and ignore the returned values.
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  beforeEach(async () => {
    const nameField = await loader.getHarness(
      MatInputHarness.with({ label: 'Name' }),
    );
    await nameField.setValue('Chris Smith');
    const ageField = await loader.getHarness(
      MatInputHarness.with({ label: 'Age' }),
    );
    await ageField.setValue('27');
    const companyField = await loader.getHarness(
      MatInputHarness.with({ label: 'Company' }),
    );
    await companyField.setValue('Ohmnet');
    const emailField = await loader.getHarness(
      MatInputHarness.with({ label: 'Email' }),
    );
    await emailField.setValue('this@that.com');
    const roleField = await loader.getHarness(
      MatSelectHarness.with({ label: 'Role' }),
    );
    await roleField.clickOptions({ text: 'Admin' });
  });

  // The `fakeAsync()` wrapper is necessary because the `submitForm()` method
  // calls `navigate()` on the router, which is an asynchronous operation, and we
  // need to wait (using `tick()`) for that to complete before we can check the
  // new location.
  it('should call addUser() and handle success response', async () => {
    // "Spy" on the `.addUser()` method in the user service. Here we basically
    // intercept any calls to that method and return a canned response ('1').
    // This means we don't have to worry about the details of the `.addUser()`,
    // or actually have a server running to receive the HTTP request that
    // `.addUser()` would typically generate. Note also that the particular values
    // we set up in our form (e.g., 'Chris Smith') are actually ignored
    // thanks to our `spyOn()` call.
    const addUserSpy = vi
      .spyOn(userService, 'addUser')
      .mockReturnValue(of('1'));
    await component.onSave();
    // Check that `.addUser()` was called with the form's values which we set
    // up above.
    expect(addUserSpy).toHaveBeenCalledWith(component.addUserForm().value());
    // Wait for the router to navigate to the new page. This is necessary since
    // navigation is an asynchronous operation.
    // Now we can check that the router actually navigated to the right place.
    await wait();
    expect(location.path()).toBe('/users/1');
  });

  it('should call addUser() and handle error response', async () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addUser()` method in the user service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addUserSpy = vi
      .spyOn(userService, 'addUser')
      .mockReturnValue(throwError(() => errorResponse));
    await component.onSave();
    // Check that `.addUser()` was called with the form's values which we set
    // up above.
    expect(addUserSpy).toHaveBeenCalledWith(component.addUserForm().value());
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should call addUser() and handle error response for illegal user', async () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 400, message: 'Illegal user error' };
    // "Spy" on the `.addUser()` method in the user service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addUserSpy = vi
      .spyOn(userService, 'addUser')
      .mockReturnValue(throwError(() => errorResponse));
    await component.onSave();
    // Check that `.addUser()` was called with the form's values which we set
    // up above.
    expect(addUserSpy).toHaveBeenCalledWith(component.addUserForm().value());
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should call addUser() and handle unexpected error response if it arises', async () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 404, message: 'Not found' };
    // "Spy" on the `.addUser()` method in the user service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addUserSpy = vi
      .spyOn(userService, 'addUser')
      .mockReturnValue(throwError(() => errorResponse));
    await component.onSave();
    // Check that `.addUser()` was called with the form's values which we set
    // up above.
    expect(addUserSpy).toHaveBeenCalledWith(component.addUserForm().value());
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });
});
