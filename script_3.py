
# Create Tauri configuration
import json

tauri_config = {
    "build": {
        "beforeDevCommand": "pnpm dev",
        "beforeBuildCommand": "pnpm build",
        "devPath": "http://localhost:5173",
        "distDir": "../dist"
    },
    "package": {
        "productName": "Mermaid Desktop Editor",
        "version": "1.0.0"
    },
    "tauri": {
        "allowlist": {
            "all": False,
            "fs": {
                "all": False,
                "writeFile": True,
                "scope": ["$DOWNLOAD/*", "$DOCUMENT/*"]
            },
            "dialog": {
                "all": False,
                "save": True
            },
            "shell": {
                "all": False,
                "open": True
            }
        },
        "bundle": {
            "active": True,
            "targets": ["appimage", "deb"],
            "identifier": "com.mermaid-tools.desktop",
            "icon": [
                "icons/32x32.png",
                "icons/128x128.png",
                "icons/128x128@2x.png",
                "icons/icon.icns",
                "icons/icon.ico"
            ]
        },
        "security": {
            "csp": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://cdn.jsdelivr.net"
        },
        "windows": [
            {
                "fullscreen": False,
                "resizable": True,
                "title": "Mermaid Desktop Editor",
                "width": 1200,
                "height": 800,
                "minWidth": 800,
                "minHeight": 600
            }
        ]
    }
}

tauri_json = json.dumps(tauri_config, indent=2)
print("Tauri Configuration (tauri.conf.json):")
print("="*80)
print(tauri_json)
print("="*80 + "\n")

with open('tauri.conf.json', 'w') as f:
    f.write(tauri_json)
