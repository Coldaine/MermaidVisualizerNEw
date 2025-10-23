
# Create manifest.json for Chrome MV3 Extension
import json

manifest = {
    "manifest_version": 3,
    "name": "Mermaid Diagram Renderer",
    "version": "1.0.0",
    "description": "Render Mermaid diagrams inline on any webpage with a single click",
    "permissions": [
        "scripting",
        "activeTab"
    ],
    "host_permissions": [
        "<all_urls>"
    ],
    "optional_host_permissions": [
        "<all_urls>"
    ],
    "action": {
        "default_popup": "popup.html",
        "default_icon": {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
        }
    },
    "content_scripts": [
        {
            "matches": ["<all_urls>"],
            "js": ["content.js"],
            "css": ["inject.css"],
            "run_at": "document_idle"
        }
    ],
    "web_accessible_resources": [
        {
            "resources": ["vendor/mermaid.esm.min.mjs"],
            "matches": ["<all_urls>"]
        }
    ],
    "background": {
        "service_worker": "background.js"
    },
    "options_page": "options.html",
    "icons": {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
    },
    "commands": {
        "_execute_action": {
            "suggested_key": {
                "default": "Ctrl+Shift+M",
                "mac": "Command+Shift+M"
            }
        },
        "rescan": {
            "suggested_key": {
                "default": "Ctrl+Alt+M",
                "mac": "Command+Alt+M"
            },
            "description": "Re-scan page for Mermaid blocks"
        }
    }
}

manifest_json = json.dumps(manifest, indent=2)
print("Chrome MV3 Extension Manifest:")
print(manifest_json)
print("\n" + "="*80 + "\n")

# Save to file
with open('manifest.json', 'w') as f:
    f.write(manifest_json)
