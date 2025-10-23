
import csv

# Create a quick reference table for commands
commands_data = [
    ["Task", "Command", "Description"],
    ["Build Mermaid (latest)", "pnpm run build:mermaid", "Builds latest stable Mermaid release"],
    ["Build Mermaid (specific)", "node scripts/build-mermaid.js v11.4.0", "Builds specific version"],
    ["Build Mermaid (bleeding edge)", "node scripts/build-mermaid.js main", "Builds from main branch"],
    ["Build extension", "pnpm run build:extension", "Compiles Chrome extension"],
    ["Build desktop", "pnpm run build:desktop", "Compiles Tauri desktop app"],
    ["Build all", "pnpm run build:all", "Builds Mermaid + both apps"],
    ["Dev extension", "pnpm run dev:extension", "Start extension dev server"],
    ["Dev desktop", "pnpm run dev:desktop", "Start desktop dev server"],
    ["Run tests", "pnpm test", "Execute all test suites"],
    ["Clean build", "pnpm run clean", "Remove all build artifacts"],
    ["Install deps", "pnpm install", "Install all dependencies"],
]

with open('quick-reference-commands.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(commands_data)

print("Quick Reference Commands:")
print("=" * 100)
for row in commands_data:
    print(f"{row[0]:<30} | {row[1]:<45} | {row[2]}")
print("=" * 100 + "\n")

# Create test diagram examples
test_diagrams = {
    "flowchart": """graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix Issue]
    E --> B
    C --> F[Deploy]
    F --> G[End]""",
    
    "sequence": """sequenceDiagram
    participant U as User
    participant E as Extension
    participant M as Mermaid
    participant P as Page
    
    U->>P: Visit webpage
    P->>E: Page loaded
    E->>P: Scan for blocks
    E->>P: Add overlay buttons
    U->>E: Click render
    E->>M: Parse diagram
    M->>E: Return SVG
    E->>P: Replace block
    P->>U: Show diagram""",
    
    "class": """classDiagram
    class MermaidRenderer {
        +String version
        +Config config
        +initialize()
        +render(code)
        +reset()
    }
    
    class Extension {
        +scanBlocks()
        +addOverlays()
        +handleClick()
    }
    
    class DesktopApp {
        +loadExample()
        +exportSVG()
        +exportPNG()
    }
    
    MermaidRenderer <|-- Extension
    MermaidRenderer <|-- DesktopApp""",
    
    "state": """stateDiagram-v2
    [*] --> Uninitialized
    Uninitialized --> Initialized: initialize()
    Initialized --> Rendering: render()
    Rendering --> Success: valid syntax
    Rendering --> Error: invalid syntax
    Success --> [*]
    Error --> Initialized: reset()""",
    
    "er": """erDiagram
    EXTENSION ||--o{ CONTENT_SCRIPT : contains
    DESKTOP_APP ||--o{ COMPONENT : contains
    CONTENT_SCRIPT ||--|{ MERMAID_BLOCK : detects
    COMPONENT ||--|{ DIAGRAM : renders
    MERMAID_BLOCK }|--|| DIAGRAM : transforms
    
    EXTENSION {
        string version
        json manifest
        array permissions
    }
    
    DESKTOP_APP {
        string version
        json config
        array features
    }""",
    
    "gantt": """gantt
    title Mermaid Tooling Development Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements gathering: 2024-01-01, 7d
    Architecture design: 2024-01-08, 5d
    section Development
    Build Mermaid script: 2024-01-13, 3d
    Chrome extension: 2024-01-16, 10d
    Desktop app: 2024-01-20, 12d
    section Testing
    Unit tests: 2024-02-01, 5d
    Integration tests: 2024-02-06, 5d
    section Release
    Documentation: 2024-02-11, 4d
    Release v1.0: milestone, 2024-02-15, 1d"""
}

print("\nTest Diagram Examples:")
print("=" * 100)
for diagram_type, code in test_diagrams.items():
    print(f"\n{diagram_type.upper()}:")
    print("-" * 100)
    print(code)
    print("-" * 100)

# Save test diagrams to files
for diagram_type, code in test_diagrams.items():
    filename = f'test-diagram-{diagram_type}.mmd'
    with open(filename, 'w') as f:
        f.write(code)
    print(f"\n✓ Created {filename}")

print("\n✓ All test files created successfully")
