/**
 * Beta Features Test Suite
 *
 * Tests specifically for Mermaid beta diagram types to ensure
 * they use correct syntax and follow beta specifications.
 *
 * Usage:
 *   node tests/beta-features.test.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Test configuration
const BETA_DIAGRAMS = {
    'architecture': {
        file: 'test-diagram-architecture.mmd',
        requiredKeywords: ['architecture-beta', 'service', 'group'],
        requiredPatterns: [/service\s+\w+/, /group\s+\w+/],
        description: 'Cloud and CI/CD architecture diagrams'
    },
    'block': {
        file: 'test-diagram-block.mmd',
        requiredKeywords: ['block-beta', 'columns'],
        requiredPatterns: [/block:/],
        description: 'System component diagrams with precise layout'
    },
    'mindmap': {
        file: 'test-diagram-mindmap.mmd',
        requiredKeywords: ['mindmap', 'root'],
        requiredPatterns: [/root\(\(/],
        description: 'Hierarchical mind mapping diagrams'
    },
    'xychart': {
        file: 'test-diagram-xychart.mmd',
        requiredKeywords: ['xychart-beta', 'x-axis', 'y-axis'],
        requiredPatterns: [/x-axis/, /y-axis/],
        description: 'Data visualization charts'
    },
    'sankey': {
        file: 'test-diagram-sankey.mmd',
        requiredKeywords: ['sankey-beta'],
        requiredPatterns: [/\w+,\w+,\d+/],
        description: 'Flow and transfer diagrams'
    },
    'quadrant': {
        file: 'test-diagram-quadrant.mmd',
        requiredKeywords: ['quadrantChart', 'quadrant-'],
        requiredPatterns: [/quadrant-\d/],
        description: 'Four-quadrant analysis charts'
    }
};

// Colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test result tracker
 */
class TestRunner {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    test(name, fn) {
        try {
            fn();
            this.results.passed++;
            this.results.tests.push({ name, status: 'passed' });
            log(`  ✅ ${name}`, 'green');
        } catch (error) {
            this.results.failed++;
            this.results.tests.push({ name, status: 'failed', error: error.message });
            log(`  ❌ ${name}`, 'red');
            log(`     ${error.message}`, 'gray');
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    summary() {
        const total = this.results.passed + this.results.failed;
        const passRate = total > 0 ? (this.results.passed / total * 100).toFixed(1) : 0;

        log('\n' + '═'.repeat(60), 'cyan');
        log('\n📊 Test Summary:', 'cyan');
        log(`  Total: ${total} tests`, 'blue');
        log(`  Passed: ${this.results.passed}`, 'green');
        log(`  Failed: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'green');
        log(`  Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow');

        return this.results.failed === 0;
    }
}

/**
 * Read diagram file
 */
function readDiagramFile(filename) {
    const path = join(projectRoot, filename);
    try {
        return readFileSync(path, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to read ${filename}: ${error.message}`);
    }
}

/**
 * Test architecture diagram syntax
 */
function testArchitectureDiagram(runner) {
    log('\n⚡ Testing Architecture Diagram (architecture-beta)', 'yellow');

    const config = BETA_DIAGRAMS.architecture;
    const content = readDiagramFile(config.file);

    runner.test('Uses architecture-beta keyword', () => {
        runner.assert(
            content.includes('architecture-beta'),
            'Must use architecture-beta keyword'
        );
    });

    runner.test('Defines at least one service', () => {
        runner.assert(
            content.match(/service\s+\w+/),
            'Must define at least one service'
        );
    });

    runner.test('Defines at least one group', () => {
        runner.assert(
            content.match(/group\s+\w+/),
            'Must define at least one group'
        );
    });

    runner.test('Uses valid icon syntax', () => {
        runner.assert(
            content.match(/\(\w+\)/),
            'Must use valid icon syntax (iconName)'
        );
    });

    runner.test('Defines connections between services', () => {
        runner.assert(
            content.match(/-->/),
            'Must define at least one connection'
        );
    });
}

/**
 * Test block diagram syntax
 */
function testBlockDiagram(runner) {
    log('\n⚡ Testing Block Diagram (block-beta)', 'yellow');

    const config = BETA_DIAGRAMS.block;
    const content = readDiagramFile(config.file);

    runner.test('Uses block-beta keyword', () => {
        runner.assert(
            content.includes('block-beta'),
            'Must use block-beta keyword'
        );
    });

    runner.test('Defines column layout', () => {
        runner.assert(
            content.includes('columns'),
            'Must define column layout'
        );
    });

    runner.test('Uses block grouping syntax', () => {
        runner.assert(
            content.match(/block:/),
            'Must use block: grouping syntax'
        );
    });

    runner.test('Defines at least one connection', () => {
        runner.assert(
            content.match(/-->/),
            'Must define at least one connection'
        );
    });
}

/**
 * Test mindmap syntax
 */
function testMindmap(runner) {
    log('\n⚡ Testing Mindmap', 'yellow');

    const config = BETA_DIAGRAMS.mindmap;
    const content = readDiagramFile(config.file);

    runner.test('Uses mindmap keyword', () => {
        runner.assert(
            content.includes('mindmap'),
            'Must use mindmap keyword'
        );
    });

    runner.test('Defines root node', () => {
        runner.assert(
            content.match(/root\(\(/),
            'Must define root node with root(( syntax'
        );
    });

    runner.test('Has hierarchical structure', () => {
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        const indentedLines = lines.filter(l => l.startsWith('  '));
        runner.assert(
            indentedLines.length > 0,
            'Must have indented hierarchy'
        );
    });
}

/**
 * Test XY chart syntax
 */
function testXYChart(runner) {
    log('\n⚡ Testing XY Chart (xychart-beta)', 'yellow');

    const config = BETA_DIAGRAMS.xychart;
    const content = readDiagramFile(config.file);

    runner.test('Uses xychart-beta keyword', () => {
        runner.assert(
            content.includes('xychart-beta'),
            'Must use xychart-beta keyword'
        );
    });

    runner.test('Defines x-axis', () => {
        runner.assert(
            content.includes('x-axis'),
            'Must define x-axis'
        );
    });

    runner.test('Defines y-axis', () => {
        runner.assert(
            content.includes('y-axis'),
            'Must define y-axis'
        );
    });

    runner.test('Has data series (bar or line)', () => {
        runner.assert(
            content.includes('bar') || content.includes('line'),
            'Must have at least one data series'
        );
    });
}

/**
 * Test Sankey diagram syntax
 */
function testSankeyDiagram(runner) {
    log('\n⚡ Testing Sankey Diagram (sankey-beta)', 'yellow');

    const config = BETA_DIAGRAMS.sankey;
    const content = readDiagramFile(config.file);

    runner.test('Uses sankey-beta keyword', () => {
        runner.assert(
            content.includes('sankey-beta'),
            'Must use sankey-beta keyword'
        );
    });

    runner.test('Defines flow connections', () => {
        runner.assert(
            content.match(/\w+,\w+,\d+/),
            'Must define flows in format: source,target,value'
        );
    });

    runner.test('Has at least 3 flows', () => {
        const flows = content.match(/\w+,\w+,\d+/g) || [];
        runner.assert(
            flows.length >= 3,
            `Must have at least 3 flows, found ${flows.length}`
        );
    });
}

/**
 * Test Quadrant chart syntax
 */
function testQuadrantChart(runner) {
    log('\n⚡ Testing Quadrant Chart', 'yellow');

    const config = BETA_DIAGRAMS.quadrant;
    const content = readDiagramFile(config.file);

    runner.test('Uses quadrantChart keyword', () => {
        runner.assert(
            content.includes('quadrantChart'),
            'Must use quadrantChart keyword'
        );
    });

    runner.test('Defines x-axis labels', () => {
        runner.assert(
            content.includes('x-axis'),
            'Must define x-axis labels'
        );
    });

    runner.test('Defines y-axis labels', () => {
        runner.assert(
            content.includes('y-axis'),
            'Must define y-axis labels'
        );
    });

    runner.test('Defines all four quadrants', () => {
        for (let i = 1; i <= 4; i++) {
            runner.assert(
                content.includes(`quadrant-${i}`),
                `Must define quadrant-${i}`
            );
        }
    });

    runner.test('Has data points with coordinates', () => {
        runner.assert(
            content.match(/:\s*\[\d+\.?\d*,\s*\d+\.?\d*\]/),
            'Must have data points with [x, y] coordinates'
        );
    });
}

/**
 * Test beta diagram version compatibility
 */
function testVersionCompatibility(runner) {
    log('\n🔍 Testing Version Compatibility', 'blue');

    runner.test('All beta diagrams use correct syntax keywords', () => {
        let allCorrect = true;

        for (const [name, config] of Object.entries(BETA_DIAGRAMS)) {
            const content = readDiagramFile(config.file);

            for (const keyword of config.requiredKeywords) {
                if (!content.includes(keyword)) {
                    allCorrect = false;
                    throw new Error(`${config.file} missing keyword: ${keyword}`);
                }
            }
        }

        runner.assert(allCorrect, 'All diagrams use correct keywords');
    });

    runner.test('No diagrams use deprecated diagram type keywords', () => {
        // Check for deprecated diagram type declarations (not internal syntax)
        // e.g., "architecture:" instead of "architecture-beta" at start of file
        const deprecatedPatterns = [
            { pattern: /^architecture:/m, message: 'architecture: (use architecture-beta)' },
            { pattern: /^xychart:/m, message: 'xychart: (use xychart-beta)' },
            { pattern: /^sankey:/m, message: 'sankey: (use sankey-beta)' }
        ];

        let foundDeprecated = false;

        for (const [name, config] of Object.entries(BETA_DIAGRAMS)) {
            const content = readDiagramFile(config.file);

            for (const { pattern, message } of deprecatedPatterns) {
                if (pattern.test(content)) {
                    foundDeprecated = true;
                    throw new Error(`${config.file} uses deprecated syntax: ${message}`);
                }
            }
        }

        runner.assert(!foundDeprecated, 'No deprecated diagram type keywords found');
    });
}

/**
 * Main test runner
 */
async function main() {
    log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
    log('║         Beta Diagram Features - Test Suite             ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════╝', 'cyan');

    log('\n📦 Testing Mermaid v11.1.0+ Beta Diagram Syntax', 'blue');
    log('   This suite validates beta diagram syntax compliance\n', 'gray');

    const runner = new TestRunner();

    // Run all tests
    testArchitectureDiagram(runner);
    testBlockDiagram(runner);
    testMindmap(runner);
    testXYChart(runner);
    testSankeyDiagram(runner);
    testQuadrantChart(runner);
    testVersionCompatibility(runner);

    // Print summary
    const success = runner.summary();

    log('\n' + '═'.repeat(60) + '\n', 'cyan');

    // Exit with appropriate code
    process.exit(success ? 0 : 1);
}

// Run tests
main().catch(error => {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
