/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { rmSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const RMRF_OPTIONS = { recursive: true, force: true };

console.log('Starting cleanup...');

// --- Static cleanup of root-level artifacts ---
rmSync(join(root, 'node_modules'), RMRF_OPTIONS);
rmSync(join(root, 'bundle'), RMRF_OPTIONS);
rmSync(join(root, 'packages/cli/src/generated/'), RMRF_OPTIONS);

// --- Dynamic cleanup based on workspaces ---
const rootPackageJson = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf-8'),
);

for (const workspace of rootPackageJson.workspaces) {
  // Use forward slashes for the glob pattern for cross-platform compatibility.
  const globPattern = `${workspace}/package.json`;
  console.log(`\nSearching for packages in: "${globPattern}"`);

  const packages = globSync(globPattern, { cwd: root });

  for (const pkgPath of packages) {
    const pkgDir = dirname(join(root, pkgPath));
    console.log(`   > Cleaning package: ${pkgDir}`);

    // Remove both 'dist' and 'node_modules' inside each found package directory.
    rmSync(join(pkgDir, 'dist'), RMRF_OPTIONS);
    rmSync(join(pkgDir, 'node_modules'), RMRF_OPTIONS);
  }
}

// Clean up vsix files in vscode-ide-companion
const vsixFiles = globSync('packages/vscode-ide-companion/*.vsix', {
  cwd: root,
});
for (const vsixFile of vsixFiles) {
  rmSync(join(root, vsixFile), RMRF_OPTIONS);
}

console.log('\n Cleanup complete.');


