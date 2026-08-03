import { Service, signal } from '@angular/core';
import {
  apply,
  email,
  form,
  max,
  maxLength,
  min,
  minLength,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { User, UserConstants, UserRole } from './user';

/**
 * @description Form models (`AddUserFormModel`) !== domain models (`User`), but often close enough with some minor adjustments.
 * This pattern of making them separate is not always needed, but for the following reasons is great to have:
 *
 * When you have a form that is initialized from server data or saved to the server, this distinction is great.
 * Without this distinction, you may be tempted to water down the domain model with `| null` or `| undefined` or `value?: ...` (optional field)`,
 * but that compromises the backend model (domain model) at the cost of working for a form.
 * However, by having a layer on form initialization from the server or form submit to server, this separation of models and their
 * translation layer keep the domain model clean and the form logic clean
 * (no `undefined/null/optional fields`, not constrained to backend directly).
 *
 * If you slap on `| undefined` or `| null` or `value?: ...` onto the domain model, all of a sudden you have
 * so much domain logic in the frontend need to use `?? (nullisch coalescing)` or `?.` (optional chaining) or `!` (non-null assertion)
 * or `if (thing.name)` or `if (thing.name !== undefined)` or `if (thing.name !== null)` etc.
 * You reading this right now, I assume, I wouldn't blame you: "We get it, we get it, it's nice to have defined values, that's plenty of examples."
 * But hear me out: when you have to do those 100s (or 1000s) of times in an app, it becomes so much noise
 * and uncertainty for the sake of a form or two being the same model.
 * And when the domain model is changed a bit? Even more noise.
 *
 * @description Signal forms streamline a lot of form logic but assume most primitive values are defined.
 * `number` or entire objects can have `null`.
 * Your validators will ensure that you are not `null` or `''` by submit time.
 * @link https://angular.dev/guide/forms/signals/model-design#form-model-vs-domain-model
 */
export type AddUserFormModel = {
  name: string;
  age: number | null;
  company: string;
  email: string;
  role: UserRole;
};

// Alternative approach: using the TS helper `Omit` and extending the type w/`&`
//
// We use `Omit<User, 'age'> & { age: number | null }` here because the `User` model
// expects a number for age, but the form control for age could be null.
// So we allow null in the form model, but when we submit the form, we will have a number for age.
//
// export type AddUserFormModel = Omit<User, 'age' | '_id' | 'avatar'> & {
//   age: number | null;
// };

/**
 * @description All validation and logic for a string representing a name
 * Created because all these rules were too verbose to put inline in the form below
 */
const nameSchema = schema<string>((name) => {
  required(name, { message: 'Name is required' });
  minLength(name, 2, {
    message: 'Name must be at least 2 characters long',
  });
  maxLength(name, 50, {
    message: 'Name cannot be more than 50 characters long',
  });
  validate(name, ({ value }) => {
    if (
      value().toLowerCase() === 'abc123' ||
      value().toLowerCase() === '123abc'
    ) {
      return { kind: 'existingName', message: 'Name has already been taken' };
    } else {
      return null;
    }
  });
});

@Service()
export class AddUserFormService {
  addUserModel = signal<AddUserFormModel>({
    name: '',
    age: null,
    company: '',
    email: '',
    role: 'viewer',
  });

  addUserForm = form(this.addUserModel, (p) => {
    // Applying form logic
    // 1: `@angular/forms/signals` package logic
    // 2: schema functions (compose multiple logic calls into one function)

    // #1: `@angular/forms/signals` package logic
    // When you don't need re-use or do not consider something too verbose
    //
    // `age`
    required(p.age, { message: 'Age is required' });
    min(p.age, UserConstants.minAge, {
      message: `Age must be at least ${UserConstants.minAge}`,
    });
    max(p.age, UserConstants.maxAge, {
      message: `Age may not be greater than ${UserConstants.maxAge}`,
    });
    // `email`
    required(p.email, { message: 'Email is required' });
    email(p.email, { message: 'Email must be formatted properly' });
    // `role`
    required(p.role, { message: 'Role is required' });
    validate(p.role, ({ value }) => {
      if (!UserConstants.roles.find((role) => role === value().toLowerCase())) {
        return {
          kind: 'existingRole',
          message: 'Role must be Admin, Editor, or Viewer',
        };
      } else {
        return null;
      }
      // Alternative validation approach using regex.
      // pattern(p.role, /^(admin|editor|viewer)$/, {
      //   message: 'Role must be Admin, Editor, or Viewer',
      // });
    });

    // #2: schema function
    // Reusable set of rules you can pull in from somewhere else.
    // Composed of the invididual field logic like above's #1
    // Schema could be literally one function or however many
    // Benefit of schema outside of this class: easier testing w/o injection context of the class
    //
    // `name`
    // Use the name schema defined above on the `name` field
    apply(p.name, nameSchema);
  });

  /**
   * @description Converts the form model to the domain model
   * The `User` model expects a number, but the form control for age could be null.
   * @link https://angular.dev/guide/forms/signals/model-design#form-model-to-domain-model
   */
  public formToDomainModel(formModel: AddUserFormModel): Omit<User, '_id'> {
    return {
      ...formModel,
      age: formModel.age ?? 15,
    };
  }
}
