
# Create package.json for monorepo root
import json

package_json = {
    "name": "mermaid-tooling-monorepo",
    "version": "1.0.0",
    "private": True,
    "description": "Monorepo for Mermaid rendering tools: Chrome extension and desktop app",
    "scripts": {
        "build:mermaid": "node scripts/build-mermaid.js",
        "build:extension": "pnpm --filter @mermaid-tools/extension build",
        "build:desktop": "pnpm --filter @mermaid-tools/desktop build",
        "build:all": "pnpm run build:mermaid && pnpm run build:extension && pnpm run build:desktop",
        "dev:extension": "pnpm --filter @mermaid-tools/extension dev",
        "dev:desktop": "pnpm --filter @mermaid-tools/desktop dev",
        "test": "pnpm --recursive test",
        "clean": "pnpm --recursive clean && rm -rf node_modules"
    },
    "workspaces": [
        "packages/*",
        "apps/*"
    ],
    "devDependencies": {
        "@types/node": "^20.0.0",
        "typescript": "^5.3.0",
        "vite": "^5.0.0"
    },
    "engines": {
        "node": ">=20.0.0",
        "pnpm": ">=8.0.0"
    }
}

package_root = json.dumps(package_json, indent=2)
print("Root package.json:")
print(package_root)
print("\n" + "="*80 + "\n")

with open('package.json', 'w') as f:
    f.write(package_root)

# Create pnpm-workspace.yaml
workspace_yaml = """packages:
  - 'packages/*'
  - 'apps/*'
"""

print("pnpm-workspace.yaml:")
print(workspace_yaml)
print("="*80 + "\n")

with open('pnpm-workspace.yaml', 'w') as f:
    f.write(workspace_yaml)
