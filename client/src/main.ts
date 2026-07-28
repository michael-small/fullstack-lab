import { LayoutModule } from '@angular/cdk/layout';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/routes';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // TODO - remove this and the dependency once I have the explanation hashed out
    provideAnimations(),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
  ],
}).catch((err) => console.error(err));
