
# Create the build-mermaid.js script
build_script = '''#!/usr/bin/env node

/**
 * Build Mermaid from source and copy to shared vendor directory
 * 
 * Usage:
 *   node scripts/build-mermaid.js [version]
 *   
 * Examples:
 *   node scripts/build-mermaid.js v11.4.0    # Build specific release
 *   node scripts/build-mermaid.js main       # Build from main branch
 *   node scripts/build-mermaid.js            # Build latest release
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const MERMAID_REPO = 'https://github.com/mermaid-js/mermaid.git';
const TEMP_DIR = path.join(__dirname, '..', '.temp', 'mermaid');
const VENDOR_DIR = path.join(__dirname, '..', 'packages', 'shared', 'vendor');
const VERSION = process.argv[2] || 'latest';

// Colors for console output
const colors = {
  reset: '\\x1b[0m',
  bright: '\\x1b[1m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  red: '\\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, cwd = process.cwd()) {
  log(`\\n→ ${command}`, 'blue');
  try {
    execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    log(`✗ Command failed: ${command}`, 'red');
    process.exit(1);
  }
}

function main() {
  log('\\n╔════════════════════════════════════════════════╗', 'bright');
  log('║   Mermaid Build Script                         ║', 'bright');
  log('╚════════════════════════════════════════════════╝\\n', 'bright');
  
  log(`Building Mermaid version: ${VERSION}`, 'yellow');
  
  // Step 1: Clean up temp directory
  log('\\n[1/7] Cleaning temp directory...', 'green');
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  
  // Step 2: Clone repository
  log('\\n[2/7] Cloning Mermaid repository...', 'green');
  exec(`git clone --depth 1 ${VERSION !== 'latest' && VERSION !== 'main' ? `--branch ${VERSION}` : ''} ${MERMAID_REPO} ${TEMP_DIR}`);
  
  // Step 3: Checkout specific version if needed
  if (VERSION === 'latest') {
    log('\\n[3/7] Fetching latest release tag...', 'green');
    const tags = execSync('git describe --tags --abbrev=0', { cwd: TEMP_DIR }).toString().trim();
    log(`Latest release: ${tags}`, 'yellow');
    exec(`git checkout ${tags}`, TEMP_DIR);
  } else if (VERSION !== 'main') {
    log(`\\n[3/7] Already on version ${VERSION}`, 'green');
  } else {
    log('\\n[3/7] Using main branch', 'green');
  }
  
  // Step 4: Install dependencies
  log('\\n[4/7] Installing dependencies with pnpm...', 'green');
  log('This may take several minutes...', 'yellow');
  exec('pnpm install', TEMP_DIR);
  
  // Step 5: Build Mermaid
  log('\\n[5/7] Building Mermaid...', 'green');
  exec('pnpm run build', TEMP_DIR);
  
  // Step 6: Copy built files
  log('\\n[6/7] Copying built files to vendor directory...', 'green');
  fs.mkdirSync(VENDOR_DIR, { recursive: true });
  
  // Find the ESM output file
  const distDir = path.join(TEMP_DIR, 'packages', 'mermaid', 'dist');
  const esmFiles = fs.readdirSync(distDir).filter(f => f.includes('.esm.') && f.endsWith('.mjs'));
  
  if (esmFiles.length === 0) {
    log('✗ No ESM build found!', 'red');
    log('Looking in: ' + distDir, 'yellow');
    log('Contents: ' + fs.readdirSync(distDir).join(', '), 'yellow');
    process.exit(1);
  }
  
  const esmFile = esmFiles.find(f => f.includes('.min.')) || esmFiles[0];
  const sourcePath = path.join(distDir, esmFile);
  const targetPath = path.join(VENDOR_DIR, 'mermaid.esm.min.mjs');
  
  fs.copyFileSync(sourcePath, targetPath);
  log(`Copied ${esmFile} → mermaid.esm.min.mjs`, 'yellow');
  
  // Copy types if available
  const typesFile = path.join(distDir, 'mermaid.d.ts');
  if (fs.existsSync(typesFile)) {
    fs.copyFileSync(typesFile, path.join(VENDOR_DIR, 'mermaid.d.ts'));
    log('Copied type definitions', 'yellow');
  }
  
  // Step 7: Create version metadata
  log('\\n[7/7] Creating version metadata...', 'green');
  const commitHash = execSync('git rev-parse HEAD', { cwd: TEMP_DIR }).toString().trim().slice(0, 8);
  const buildDate = new Date().toISOString();
  
  const metadata = {
    version: VERSION,
    commitHash,
    buildDate,
    file: 'mermaid.esm.min.mjs',
    source: MERMAID_REPO
  };
  
  fs.writeFileSync(
    path.join(VENDOR_DIR, 'build-info.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  log('\\n✓ Build complete!', 'green');
  log(`\\nVendor files created in: ${VENDOR_DIR}`, 'yellow');
  log('  - mermaid.esm.min.mjs', 'yellow');
  log('  - build-info.json', 'yellow');
  
  // Cleanup
  log('\\nCleaning up temp directory...', 'blue');
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  
  log('\\n✓ Done!\\n', 'bright');
}

// Run
try {
  main();
} catch (error) {
  log('\\n✗ Build failed!', 'red');
  log(error.message, 'red');
  process.exit(1);
}
'''.replace('\\x1b', '\x1b')

print("build-mermaid.js script:")
print("="*80)
print(build_script)
print("="*80 + "\n")

with open('build-mermaid.js', 'w') as f:
    f.write(build_script)

print("✓ Script created successfully")
