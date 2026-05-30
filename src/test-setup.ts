import 'zone.js';
// Make Vitest's `vi` available as `jest` so zone.js/testing will patch it.
// vitest exposes `vi`, but zone.js looks for `jest`/`mocha`/`jasmine`.
// @ts-ignore
(globalThis as any).jest = (globalThis as any).vi;
import 'zone.js/testing';
// eslint-disable-next-line no-console
console.log('[test-setup] loaded');
// eslint-disable-next-line no-console
console.log('[test-setup] resolveComponentResources typeof:', typeof resolveComponentResources);
// Wrap the global `fetch` so relative requests used by Angular's JIT resolver
// can be resolved from the local filesystem. Keep the original fetch for
// network requests.
{
  const originalFetch = (globalThis as any).fetch;
  (globalThis as any).fetch = async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input?.url;
    // Helper to search under `src/` by basename.
    async function findFile(dir: string, basename: string): Promise<string | null> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isFile() && ent.name === basename) return full;
        if (ent.isDirectory()) {
          const found = await findFile(full, basename);
          if (found) return found;
        }
      }
      return null;
    }

    try {
      if (!url || typeof url !== 'string') return originalFetch ? originalFetch(input, init) : { status: 404, ok: false, text: async () => '' };

      // Absolute URLs or network protocols should be forwarded to native fetch.
      if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) {
        // Handle file:// and /@fs/ by reading from disk directly.
        if (url.startsWith('/@fs/')) {
          const p = url.replace('/@fs/', '');
          try {
            const text = await fs.readFile(p, 'utf8');
            return { status: 200, ok: true, text: async () => text } as any;
          } catch (e) {}
        }
        if (url.startsWith('file://')) {
          const p = url.replace('file://', '');
          try {
            const text = await fs.readFile(p, 'utf8');
            return { status: 200, ok: true, text: async () => text } as any;
          } catch (e) {}
        }
        return originalFetch ? originalFetch(input, init) : { status: 404, ok: false, text: async () => '' };
      }

      // For relative paths (like "./login-form.ui.html"), try to find file by basename under src/.
      const basename = path.basename(url);
      try {
        const found = await findFile(path.resolve(process.cwd(), 'src'), basename);
        if (found) {
          const text = await fs.readFile(found, 'utf8');
          return { status: 200, ok: true, text: async () => text } as any;
        }
      } catch (e) {}

      // As last resort, attempt to resolve relative to cwd and read file.
      try {
        const abs = path.resolve(process.cwd(), url);
        const text = await fs.readFile(abs, 'utf8');
        return { status: 200, ok: true, text: async () => text } as any;
      } catch (e) {}

      // Fallback to native fetch if present.
      return originalFetch ? originalFetch(input, init) : { status: 404, ok: false, text: async () => '' };
    } catch (e) {
      try {
        return originalFetch ? originalFetch(input, init) : { status: 404, ok: false, text: async () => '' };
      } catch (e2) {
        return { status: 404, ok: false, text: async () => '' } as any;
      }
    }
  };
}
import { getTestBed } from '@angular/core/testing';
import { resolveComponentResources } from '@angular/core';
import fs from 'fs/promises';
import path from 'path';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';

// Initialize the Angular testing environment using the browser testing platform.
getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);

// Pre-resolve external component resources (templateUrl/styleUrls) for JIT tests.
beforeAll(async () => {
  // Helper: return Angular's resolveComponentResources, trying public and internal names.
  async function getResolveFn(): Promise<((resolver: (url: string) => Promise<string>) => Promise<void>) | undefined> {
    if (typeof resolveComponentResources === 'function') return resolveComponentResources as any;
    try {
      const core: any = await import('@angular/core');
      // eslint-disable-next-line no-console
      console.log('[test-setup] dynamic import @angular/core: resolveComponentResources?', !!core.resolveComponentResources, 'ɵresolveComponentResources?', !!core.ɵresolveComponentResources);
      return core.resolveComponentResources || core.ɵresolveComponentResources || core['ɵresolveComponentResources'];
    } catch (e) {
      return undefined;
    }
  }

  const resolveFn = await getResolveFn();
  if (typeof resolveFn === 'function') {
    try {
      const resolver = async (url: string) => {
        // Log requested resource for debugging
        // eslint-disable-next-line no-console
        console.log('[resolveComponentResources] request:', url);
        // Try fetch first when available.
        if (typeof fetch === 'function') {
          try {
            const resp = await fetch(url);
            if (resp && (resp.status === 200 || resp.status === 0 || resp.status === undefined)) {
              return await resp.text();
            }
          } catch (e) {
            // ignore and fallback to FS
          }
        }

        // Vite can expose files under /@fs/ prefix. Strip it.
        if (url.startsWith('/@fs/')) {
          const p = url.replace('/@fs/', '');
          try {
            return await fs.readFile(p, 'utf8');
          } catch (e) {}
        }

        // Handle file:// URLs
        if (url.startsWith('file://')) {
          const p = url.replace('file://', '');
          try {
            return await fs.readFile(p, 'utf8');
          } catch (e) {}
        }

        // Try resolving relative to current working directory.
        try {
          const p = path.resolve(process.cwd(), url);
          try {
            return await fs.readFile(p, 'utf8');
          } catch (e) {}
        } catch (e) {}

        // Fallback: search for the file under `src/` by basename.
        const basename = path.basename(url);
        async function findFile(dir: string): Promise<string | null> {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isFile() && ent.name === basename) return full;
            if (ent.isDirectory()) {
              const found = await findFile(full);
              if (found) return found;
            }
          }
          return null;
        }

        try {
          const found = await findFile(path.resolve(process.cwd(), 'src'));
          if (found) return await fs.readFile(found, 'utf8');
        } catch (e) {}

        throw new Error(`Unable to resolve component resource: ${url}`);
      };

      // Prefer passing the global `fetch` (which we polyfilled above) so Angular's
      // internal resolver can use the standard fetch behavior. If that fails,
      // fall back to our custom resolver that also reads from the filesystem.
      let usedFetch = false;
      if (typeof (globalThis as any).fetch === 'function') {
        try {
          await resolveFn((globalThis as any).fetch);
          usedFetch = true;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('resolveComponentResources(fetch) failed:', e && e.message ? e.message : e);
        }
      }
      if (!usedFetch) {
        await resolveFn(resolver);
      }
    } catch (e) {
      // Don't fail global setup on resolution errors; individual tests can still call compileComponents().
      // eslint-disable-next-line no-console
      console.warn('resolveComponentResources() failed:', e && e.message ? e.message : e);
    }
  }
});

// Ensure that component resources are resolved when individual tests call compileComponents().
// Some test runners import test modules after this setup file runs, so resolving resources
// at global setup time may be too early. Wrap TestBed.compileComponents to run the resolver
// right before compilation.
const _origCompile = (TestBed as any).compileComponents;
(TestBed as any).compileComponents = async function (...args: any[]) {
  if (typeof resolveComponentResources === 'function') {
    try {
      // eslint-disable-next-line no-console
      console.log('[test-setup] compileComponents wrapper: resolving resources');
      await (resolveComponentResources as any)(async (url: string) => {
        // eslint-disable-next-line no-console
        console.log('[resolveComponentResources] request (compile):', url);
        // Delegate to the same resolver logic defined above.
        // Try fetch first when available.
        if (typeof fetch === 'function') {
          try {
            const resp = await fetch(url);
            if (resp && (resp.status === 200 || resp.status === 0 || resp.status === undefined)) {
              return await resp.text();
            }
          } catch (e) {}
        }

        if (url.startsWith('/@fs/')) {
          const p = url.replace('/@fs/', '');
          try {
            return await fs.readFile(p, 'utf8');
          } catch (e) {}
        }

        if (url.startsWith('file://')) {
          const p = url.replace('file://', '');
          try {
            return await fs.readFile(p, 'utf8');
          } catch (e) {}
        }

        try {
          const p = path.resolve(process.cwd(), url);
          try {
            return await fs.readFile(p, 'utf8');
          } catch (e) {}
        } catch (e) {}

        const basename = path.basename(url);
        async function findFile(dir: string): Promise<string | null> {
          const entries = await fs.readdir(dir, { withFileTypes: true });
          for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isFile() && ent.name === basename) return full;
            if (ent.isDirectory()) {
              const found = await findFile(full);
              if (found) return found;
            }
          }
          return null;
        }

        try {
          const found = await findFile(path.resolve(process.cwd(), 'src'));
          if (found) return await fs.readFile(found, 'utf8');
        } catch (e) {}

        throw new Error(`Unable to resolve component resource: ${url}`);
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('resolveComponentResources() failed during compileComponents:', e && e.message ? e.message : e);
    }
  }
  return _origCompile.apply(this, args);
};
