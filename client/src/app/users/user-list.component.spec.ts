import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { MockUserService } from 'src/testing/user.service.mock';
import { User } from './user';
import { UserCardComponent } from './user-card.component';
import { UserListComponent } from './user-list.component';
import { UserService } from './user.service';
import {
  HttpErrorResponse,
  provideHttpClient,
  withXhr,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('User list', () => {
  let userList: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: UserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent, UserCardComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: UserService, useClass: MockUserService },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(UserListComponent);
    userList = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    await fixture.whenStable();
  });

  it('should initialize with serverFilteredUsers available', () => {
    const users = userList.serverFilteredUsers.value();
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should call getUsers() when userForm role signal changes', () => {
    const spy = vi.spyOn(userService, 'getUsers');
    userList.userModel.update((m) => ({ ...m, role: 'admin' }));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({ role: 'admin', age: undefined });
  });

  it('should call getUsers() when userForm age signal changes', () => {
    const spy = vi.spyOn(userService, 'getUsers');
    userList.userModel.update((m) => ({ ...m, age: 25 }));
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith({ role: undefined, age: 25 });
  });

  it('should not show error message on successful load', () => {
    expect(userList.errMsg()).toBe('');
  });
});

/*
 * This test is a little odd, but illustrates how we can use stubs
 * to create mock objects (a service in this case) that be used for
 * testing. Here we set up the mock UserService (userServiceStub) so that
 * _always_ fails (throws an exception) when you request a set of users.
 */
describe('Misbehaving User List', () => {
  let userList: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  // stub UserService for test purposes
  let userServiceStub = {
    getUsers: () =>
      throwError(
        () =>
          new HttpErrorResponse({ status: 500, statusText: 'Server Error' }),
      ),
    filterUsers: () => [],
  };

  // Construct the `userList` used for the testing in the `it` statement
  // below.
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [UserListComponent],
      // providers:    [ UserService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [
        {
          provide: UserService,
          useValue: userServiceStub,
        },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(UserListComponent);
    userList = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("generates an error if we don't set up a UserListService", () => {
    // If the service fails, we expect the `serverFilteredUsers` signal to
    // be an empty array of users.
    expect(
      userList.serverFilteredUsers.hasValue()
        ? userList.serverFilteredUsers.value()
        : [],
      "service can't give values to the list if it's not there",
    ).toEqual([]);
    // We also expect the `errMsg` signal to contain the "Problem contacting…"
    // error message. (It's arguably a bit fragile to expect something specific
    // like this; maybe we just want to expect it to be non-empty?)
    expect(userList.errMsg(), 'the error message will be').toContain(
      'Problem contacting the server – Error Code:',
    );
  });
});
