import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';
import { MockUserService } from 'src/testing/user.service.mock';
import { UserCardComponent } from './user-card.component';
import { UserListComponent } from './user-list.component';
import { UserService } from './user.service';
import {
  HttpErrorResponse,
  provideHttpClient,
  withXhr,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatInputHarness } from '@angular/material/input/testing';

describe('User list', () => {
  let userList: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userService: UserService;

  // MATERIAL HARNESSES - this doc gives five steps in understanding them in practice. Overview first:
  // Material provides component harnesses for testing,
  //     which allow interacting with Material components
  //     in tests in a really straight forward programmatic way.
  //
  //     Without harnesses, finding and interacting with stuff in the DOM is annoying and vague.
  //     Example of before and after using harnesses: https://material.angular.dev/guide/using-component-harnesses#comparison-with-and-without-component-harnesses
  //         BEFORE: Need to know how to trigger native DOM event handlers to open the select and select an option,
  //             what CSS class selectors to find,
  //             and manually detect changes.
  //             Little to no auto-complete or type checking.
  //         AFTER: Harness makes finding the and interacting with the select easier.
  //             Has auto-complete and type checking.
  //
  // Before the steps, here are some links with overviews/examples:
  //     Example of a test using a harness for material inputs: https://material.angular.dev/components/input/examples#input-harness
  //     Dedicated harness docs page: https://material.angular.dev/guide/using-component-harnesses

  // (Harness 1) Declare the loader, which you later instantiate in the `beforeEach`.
  // The loader can instantiate any different Material harness
  let loader: HarnessLoader;

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
    // (Harness 2) Actually instantiate the harness loader, most often in the `beforeEach`.
    loader = TestbedHarnessEnvironment.loader(fixture);
    userList = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    await fixture.whenStable();
  });

  it('should initialize with serverFilteredUsers available', () => {
    const users = userList.serverFilteredUsers.value();
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should call getUsers() when userForm role signal changes', async () => {
    const spy = vi.spyOn(userService, 'getUsers');

    // (Harness 3) Use the harness loader to get a harness for the role selector
    // Notice that the loader can grab any Material harness, in this case, for `<mat-select>` with the label "Role"
    // And that you `await` the harness instance
    const roleInput = await loader.getHarness(
      MatSelectHarness.with({ label: 'Role' }),
    );
    // (Harness 4) Use the harness to select the "Admin" option
    // IMPORTANT: This must be awaited because this is asynchronous and returns a promise.
    //     You will see this error if you do not `await` the harness action:
    //     `Error: Harness is attempting to use a fixture that has already been destroyed.`
    await roleInput.clickOptions({ text: 'Admin' });

    expect(spy).toHaveBeenCalledWith({ role: 'admin', age: undefined });
  });

  it('should call getUsers() when userForm age signal changes', async () => {
    const spy = vi.spyOn(userService, 'getUsers');
    // (Harness 5) The same harness loader can grab a different Material element with its harness
    // The Material docs have examples of each type of component harness tests
    //     in a component's "Examples" tab: https://material.angular.dev/components/input/examples#input-harness
    const ageInput = await loader.getHarness(
      MatInputHarness.with({ label: 'Age' }),
    );
    await ageInput.setValue('25');

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
  const userServiceStub = {
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
