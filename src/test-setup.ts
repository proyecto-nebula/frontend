import 'zone.js';
import 'zone.js/testing';
import { TestBed, resolveComponentResources } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

// Initialize the Angular testing environment.
TestBed.initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);

// Pre-resolve component external resources (templateUrl/styleUrls)
beforeAll(async () => {
  try {
    await resolveComponentResources();
  } catch (e) {
    // If resolution fails, tests that rely on external resources will still
    // attempt to compile components individually via compileComponents().
    // Log the error for debugging but don't fail the global setup.
    // eslint-disable-next-line no-console
    console.warn('resolveComponentResources() failed:', e && e.message ? e.message : e);
  }
});
