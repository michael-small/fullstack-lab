import { signal, WritableSignal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { AddUserFormModel, AddUserFormService } from './add-user.form.service';
import { FieldTree } from '@angular/forms/signals';
import { TestBed } from '@angular/core/testing';
import { UserRole } from './user';

describe('AddUserFormService', () => {
  let userModel: WritableSignal<AddUserFormModel>;
  let userForm: FieldTree<AddUserFormModel, string | number, 'writable'>;
  let addUserFormService: AddUserFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddUserFormService],
    });
  });
  beforeEach(() => {
    addUserFormService = TestBed.inject(AddUserFormService);
    userModel = addUserFormService.addUserModel;
    userForm = addUserFormService.addUserForm;
  });

  // Not terribly important; if the component doesn't create
  // successfully that will probably blow up a lot of things.
  // Including it, though, does give us confidence that our
  // our component definitions don't have errors that would
  // prevent them from being successfully constructed.
  it('should create the component and form', () => {
    expect(userForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be invalid when empty', () => {
    expect(userForm().valid()).toBeFalsy();
  });

  describe('The name field', () => {
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
  });

  describe('The company field', () => {
    it('should allow empty values', () => {
      userModel.update((model) => ({
        ...model,
        company: '',
      }));
      expect(userForm.company().valid()).toBeTruthy();
    });
  });

  describe('The email field', () => {
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
    it('should not allow empty values', () => {
      // `as` is fine here because we validate that anything else is invalid
      userModel.update((model) => ({
        ...model,
        role: '' as UserRole,
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
        role: 'Supreme Overlord' as UserRole,
      }));
      expect(userForm.role().valid()).toBeFalsy();
    });
  });
});
