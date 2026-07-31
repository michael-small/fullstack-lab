import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Location } from '@angular/common';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormGroup } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { MockUserService } from 'src/testing/user.service.mock';
import { AddUserComponent, AddUserFormModel } from './add-user.component';
import { UserProfileComponent } from './user-profile.component';
import { UserService } from './user.service';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { FieldTree } from '@angular/forms/signals';
import { Signal, WritableSignal } from '@angular/core';

// TODO - align comments to new API

describe('AddUserComponent', () => {
  let addUserComponent: AddUserComponent;
  let addUserForm: FieldTree<AddUserFormModel, string | number, 'writable'>;
  let fixture: ComponentFixture<AddUserComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AddUserComponent, MatSnackBarModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: UserService, useClass: MockUserService },
      ],
    })
      .compileComponents()
      .catch((error) => {
        expect(error).toBeNull();
      });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserComponent);
    addUserComponent = fixture.componentInstance;
    fixture.detectChanges();
    addUserForm = addUserComponent.addUserForm;
  });

  // Not terribly important; if the component doesn't create
  // successfully that will probably blow up a lot of things.
  // Including it, though, does give us confidence that our
  // our component definitions don't have errors that would
  // prevent them from being successfully constructed.
  it('should create the component and form', () => {
    expect(addUserComponent).toBeTruthy();
    expect(addUserForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be invalid when empty', () => {
    expect(addUserForm().valid()).toBeFalsy();
  });

  describe('The name field', () => {
    let userModel: WritableSignal<AddUserFormModel>;
    let userForm: FieldTree<AddUserFormModel, string | number, 'writable'>;

    beforeEach(() => {
      userModel = addUserComponent.addUserModel;
      userForm = addUserComponent.addUserForm;
    });

    it('should not allow empty names', () => {
      userModel.update((model) => ({ ...model, name: '' }));
      expect(userForm.name().valid()).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      userModel.update((model) => ({ ...model, name: 'Chris Smith' }));
      expect(userForm.name().valid()).toBeTruthy();
    });

    it('should fail on single character names', () => {
      userModel.update((model) => ({ ...model, name: 'x' }));
      expect(userForm.name().valid()).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.minLength(2)`.
      expect(userForm.name().getError('minLength')).toBeTruthy();
    });

    // In the real world, you'd want to be pretty careful about
    // setting upper limits on things like name lengths just
    // because there are people with really long names.
    it('should fail on really long names', () => {
      userModel.update((model) => ({ ...model, name: 'x'.repeat(51) }));
      expect(userForm.name().valid()).toBeFalsy();
      expect(userForm.name().valid()).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.maxLength(2)`.
      expect(userForm.name().getError('maxLength')).toBeTruthy();
    });

    it('should allow digits in the name', () => {
      userModel.update((model) => ({ ...model, name: 'Bad2Th3B0ne' }));
      expect(userForm.name().valid()).toBeTruthy();
    });

    it('should fail if we provide an "existing" name', () => {
      // We're assuming that "abc123" and "123abc" already
      // exist so we disallow them.
      userModel.update((model) => ({ ...model, name: 'abc123' }));
      expect(userForm.name().valid()).toBeFalsy();
      expect(userForm.name().getError('existingName')).toBeTruthy();

      userModel.update((model) => ({ ...model, name: '123abc' }));
      expect(userForm.name().valid()).toBeFalsy();
      expect(userForm.name().getError('existingName')).toBeTruthy();
    });
  });

  describe('The age field', () => {
    let userModel: WritableSignal<AddUserFormModel>;
    let userForm: FieldTree<AddUserFormModel, string | number, 'writable'>;

    beforeEach(() => {
      userModel = addUserComponent.addUserModel;
      userForm = addUserComponent.addUserForm;
    });

    it('should not allow empty ages', () => {
      userModel.update((model) => ({ ...model, age: null }));
      expect(userForm.age().valid()).toBeFalsy();
    });

    it('should be fine with "27"', () => {
      userModel.update((model) => ({ ...model, age: 27 }));
      expect(userForm.age().valid()).toBeTruthy();
    });

    it('should fail on ages that are too low', () => {
      userModel.update((model) => ({ ...model, age: 14 }));
      expect(userForm.age().valid()).toBeFalsy();
      expect(userForm.age().getError('min')).toBeTruthy();
    });

    it('should fail on negative ages', () => {
      userModel.update((model) => ({ ...model, age: -27 }));
      expect(userForm.age().valid()).toBeFalsy();
      expect(userForm.age().getError('min')).toBeTruthy();
    });

    // In the real world, you'd want to be pretty careful about
    // setting upper limits on things like ages.
    it('should fail on ages that are too high', () => {
      userModel.update((model) => ({ ...model, age: 201 }));
      expect(userForm.age().valid()).toBeFalsy();
      // I have no idea why I have to use a lower case 'l' here
      // when it's an upper case 'L' in `Validators.maxLength(2)`.
      // But I apparently do.
      expect(userForm.age().getError('max')).toBeTruthy();
    });

    // TODO - remove this with approval
    // REASON: html inputs of type `number` can have `step="1"` which prevents decimal points already
    // it('should not allow an age to contain a decimal point', () => {
    //   userModel.update((model) => ({ ...model, age: 27.5 }));
    //   expect(userForm.age().valid()).toBeFalsy();
    //   expect(userForm.age().getError('pattern')).toBeTruthy();
    // });
  });

  describe('The company field', () => {
    it('should allow empty values', () => {
      addUserComponent.addUserModel.update((model) => ({
        ...model,
        company: '',
      }));
      expect(addUserComponent.addUserForm.company().valid()).toBeTruthy();
    });
  });

  describe('The email field', () => {
    let userModel: WritableSignal<AddUserFormModel>;
    let userForm: FieldTree<AddUserFormModel, string | number, 'writable'>;

    beforeEach(() => {
      userModel = addUserComponent.addUserModel;
      userForm = addUserComponent.addUserForm;
    });

    it('should not allow empty values', () => {
      userModel.update((model) => ({ ...model, email: '' }));
      expect(userForm.email().valid()).toBeFalsy();
      expect(userForm.email().getError('required')).toBeTruthy();
    });

    it('should accept legal emails', () => {
      userModel.update((model) => ({
        ...model,
        email: 'conniestewart@ohmnet.com',
      }));
      expect(userForm.email().valid()).toBeTruthy();
    });

    it('should fail without @', () => {
      userModel.update((model) => ({ ...model, email: 'conniestewart' }));
      expect(userForm.email().valid()).toBeFalsy();
      expect(userForm.email().getError('email')).toBeTruthy();
    });
  });

  describe('The role field', () => {
    let userModel: WritableSignal<AddUserFormModel>;
    let userForm: FieldTree<AddUserFormModel, string | number, 'writable'>;

    beforeEach(() => {
      userModel = addUserComponent.addUserModel;
      userForm = addUserComponent.addUserForm;
    });

    it('should not allow empty values', () => {
      // `as` is fine here because we validate that anything else is invalid
      userModel.update((model) => ({
        ...model,
        role: '' as 'admin' | 'editor' | 'viewer',
      }));
      expect(userForm.role().valid()).toBeFalsy();
      expect(userForm.role().getError('required')).toBeTruthy();
    });

    it('should allow "admin"', () => {
      userModel.update((model) => ({ ...model, role: 'admin' }));
      expect(userForm.role().valid()).toBeTruthy();
    });

    it('should allow "editor"', () => {
      userModel.update((model) => ({ ...model, role: 'editor' }));
      expect(userForm.role().valid()).toBeTruthy();
    });

    it('should allow "viewer"', () => {
      userModel.update((model) => ({ ...model, role: 'viewer' }));
      expect(userForm.role().valid()).toBeTruthy();
    });

    it('should not allow "Supreme Overlord"', () => {
      // This `as` is valid because we can expect the form would not validate this if it were open to be whatever
      userModel.update((model) => ({
        ...model,
        role: 'Supreme Overlord' as 'admin' | 'editor' | 'viewer',
      }));
      expect(userForm.role().valid()).toBeFalsy();
    });
  });
});

describe('AddUserComponent#submitForm()', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let userService: UserService;
  let location: Location;

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
  });

  beforeEach(() => {
    // Set up the form with valid values.
    // We don't actually have to do this, but it does mean that when we
    // check that `submitForm()` is called with the right arguments below,
    // we have some reason to believe that that wasn't passing "by accident".
    component.addUserModel.set({
      name: 'Chris Smith',
      age: 27,
      company: 'Ohmnet',
      email: 'this@that.com',
      role: 'admin',
    });
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
