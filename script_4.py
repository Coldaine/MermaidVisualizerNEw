
# Create directory structure overview
structure = """
mermaid-tooling-monorepo/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── .gitignore
├── scripts/
│   └── build-mermaid.js          # Script to build Mermaid from source
├── packages/
│   └── shared/
│       └── vendor/
│           ├── mermaid.esm.min.mjs    # Built Mermaid ESM bundle
│           ├── mermaid.d.ts           # TypeScript definitions
│           └── build-info.json        # Version metadata
├── apps/
│   ├── extension/                     # Chrome MV3 Extension
│   │   ├── manifest.json
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── content.ts            # Content script for page scanning
│   │   │   ├── background.ts         # Service worker
│   │   │   ├── popup.html/ts         # Extension popup
│   │   │   ├── options.html/ts       # Settings page
│   │   │   └── inject.css            # Styles for overlays
│   │   ├── vendor/
│   │   │   └── mermaid.esm.min.mjs   # Symlink to shared bundle
│   │   ├── icons/
│   │   │   ├── icon16.png
│   │   │   ├── icon48.png
│   │   │   └── icon128.png
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── desktop/                       # Tauri Desktop App
│       ├── package.json
│       ├── tauri.conf.json
│       ├── src-tauri/                # Rust backend
│       │   ├── Cargo.toml
│       │   ├── tauri.conf.json
│       │   ├── build.rs
│       │   └── src/
│       │       └── main.rs
│       ├── src/                      # Frontend (Vite + TS)
│       │   ├── main.ts
│       │   ├── App.vue
│       │   ├── components/
│       │   │   ├── Editor.vue
│       │   │   ├── Preview.vue
│       │   │   └── Toolbar.vue
│       │   ├── vendor/
│       │   │   └── mermaid.esm.min.mjs  # Symlink to shared bundle
│       │   └── styles/
│       │       └── main.css
│       ├── vite.config.ts
│       └── tsconfig.json
└── docs/
    ├── extension-usage.md
    ├── desktop-usage.md
    └── building-mermaid.md
"""

print("Project Directory Structure:")
print("="*80)
print(structure)
print("="*80 + "\n")

# Create .gitignore
gitignore_content = """# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.tsbuildinfo

# Temporary files
.temp/
.cache/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.env.local

# Tauri
apps/desktop/src-tauri/target/

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Test coverage
coverage/
"""

print(".gitignore content:")
print("="*80)
print(gitignore_content)
print("="*80 + "\n")

with open('.gitignore', 'w') as f:
    f.write(gitignore_content)

print("✓ Files created successfully")
