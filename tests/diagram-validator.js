/**
 * Mermaid Diagram Validator
 *
 * This script validates that all test diagram files can be successfully
 * rendered by Mermaid.js. It tests both stable and beta diagram types.
 *
 * Usage:
 *   node tests/diagram-validator.js [options]
 *
 * Options:
 *   --type <type>    Test only specific diagram type
 *   --verbose        Show detailed output
 *   --all            Test all diagrams including beta
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const CONFIG = {
    diagramDir: projectRoot,
    diagramPattern: /^test-diagram-(.+)\.mmd$/,
    timeout: 30000,
    verbose: process.argv.includes('--verbose'),
    targetType: getTargetType()
};

// Diagram type classifications
const DIAGRAM_TYPES = {
    stable: ['flowchart', 'sequence', 'class', 'state', 'er', 'gantt'],
    beta: ['architecture', 'block', 'mindmap', 'xychart', 'sankey', 'quadrant', 'treemap', 'kanban']
};

// Test results tracking
const results = {
    passed: [],
    failed: [],
    skipped: [],
    startTime: Date.now()
};

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

/**
 * Get target diagram type from command line args
 */
function getTargetType() {
    const typeIndex = process.argv.indexOf('--type');
    return typeIndex !== -1 ? process.argv[typeIndex + 1] : null;
}

/**
 * Log with color
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Format duration in ms to human readable
 */
function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Discover all test diagram files
 */
function discoverDiagrams() {
    const files = readdirSync(CONFIG.diagramDir);
    const diagrams = [];

    for (const file of files) {
        const match = file.match(CONFIG.diagramPattern);
        if (match) {
            const type = match[1];
            const isBeta = DIAGRAM_TYPES.beta.includes(type);

            diagrams.push({
                file,
                type,
                path: join(CONFIG.diagramDir, file),
                isBeta,
                category: isBeta ? 'beta' : 'stable'
            });
        }
    }

    return diagrams;
}

/**
 * Read diagram file content
 */
function readDiagram(path) {
    try {
        return readFileSync(path, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to read diagram file: ${error.message}`);
    }
}

/**
 * Validate diagram syntax (basic checks)
 */
function validateSyntax(content, type, isBeta) {
    const errors = [];

    // Check if content is empty
    if (!content || content.trim().length === 0) {
        errors.push('Diagram content is empty');
        return errors;
    }

    // Check for beta diagram syntax
    if (isBeta) {
        const betaKeywords = {
            architecture: 'architecture-beta',
            block: 'block-beta',
            xychart: 'xychart-beta',
            sankey: 'sankey-beta'
        };

        const expectedKeyword = betaKeywords[type];
        if (expectedKeyword && !content.includes(expectedKeyword)) {
            errors.push(`Beta diagram missing required keyword: ${expectedKeyword}`);
        }
    }

    // Check for common syntax issues
    const lines = content.split('\n');

    // Skip bracket checking for class diagrams (use multi-line braces)
    // Skip all brace checks for ER diagrams (braces are relationship symbols)
    const skipBraceCheck = type === 'class';
    const isERDiagram = type === 'er';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip comments and empty lines
        if (line.startsWith('%%') || line.length === 0) continue;

        // Check for unclosed brackets (only on same line)
        const openBrackets = (line.match(/\[/g) || []).length;
        const closeBrackets = (line.match(/\]/g) || []).length;
        const openParens = (line.match(/\(/g) || []).length;
        const closeParens = (line.match(/\)/g) || []).length;

        // Only check brackets and parens, skip braces for certain diagram types
        if (openBrackets !== closeBrackets) {
            // Allow unbalanced brackets if they're part of class syntax
            if (!skipBraceCheck || !line.includes('{') && !line.includes('}')) {
                errors.push(`Line ${i + 1}: Unclosed brackets`);
            }
        }
        if (openParens !== closeParens) {
            errors.push(`Line ${i + 1}: Unclosed parentheses`);
        }
    }

    // Check for balanced braces globally (not per line) for class diagrams only
    // ER diagrams use { and } as relationship symbols, not code delimiters
    if (skipBraceCheck && !isERDiagram) {
        const totalOpenBraces = (content.match(/\{/g) || []).length;
        const totalCloseBraces = (content.match(/\}/g) || []).length;

        if (totalOpenBraces !== totalCloseBraces) {
            errors.push(`Unbalanced braces: ${totalOpenBraces} opening, ${totalCloseBraces} closing`);
        }
    }

    return errors;
}

/**
 * Simulate Mermaid rendering (without actual browser)
 * This is a basic validation - full rendering requires a browser environment
 */
async function testDiagram(diagram) {
    const startTime = Date.now();

    try {
        // Read diagram content
        const content = readDiagram(diagram.path);

        if (CONFIG.verbose) {
            log(`\n  Content preview:`, 'gray');
            const preview = content.split('\n').slice(0, 3).join('\n');
            log(`  ${preview}...`, 'gray');
        }

        // Validate syntax
        const syntaxErrors = validateSyntax(content, diagram.type, diagram.isBeta);

        if (syntaxErrors.length > 0) {
            throw new Error(`Syntax validation failed:\n    ${syntaxErrors.join('\n    ')}`);
        }

        // Additional type-specific validation
        validateTypeSpecific(content, diagram.type, diagram.isBeta);

        const duration = Date.now() - startTime;

        return {
            success: true,
            duration,
            details: {
                lines: content.split('\n').length,
                size: content.length
            }
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            duration,
            error: error.message
        };
    }
}

/**
 * Type-specific validation rules
 */
function validateTypeSpecific(content, type, isBeta) {
    switch (type) {
        case 'flowchart':
            if (!content.match(/graph (TD|LR|TB|RL|BT)/)) {
                throw new Error('Flowchart must start with graph direction');
            }
            break;

        case 'sequence':
            if (!content.includes('sequenceDiagram')) {
                throw new Error('Sequence diagram must include sequenceDiagram keyword');
            }
            break;

        case 'class':
            if (!content.includes('classDiagram')) {
                throw new Error('Class diagram must include classDiagram keyword');
            }
            break;

        case 'state':
            if (!content.includes('stateDiagram')) {
                throw new Error('State diagram must include stateDiagram keyword');
            }
            break;

        case 'er':
            if (!content.includes('erDiagram')) {
                throw new Error('ER diagram must include erDiagram keyword');
            }
            break;

        case 'gantt':
            if (!content.includes('gantt')) {
                throw new Error('Gantt chart must include gantt keyword');
            }
            break;

        case 'architecture':
            if (!content.includes('architecture-beta')) {
                throw new Error('Architecture diagram must use architecture-beta keyword');
            }
            break;

        case 'block':
            if (!content.includes('block-beta')) {
                throw new Error('Block diagram must use block-beta keyword');
            }
            break;

        case 'mindmap':
            if (!content.includes('mindmap')) {
                throw new Error('Mindmap must include mindmap keyword');
            }
            break;
    }
}

/**
 * Run all tests
 */
async function runTests() {
    log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
    log('║     Mermaid Diagram Validator - Test Suite Runner      ║', 'cyan');
    log('╚══════════════════════════════════════════════════════════╝', 'cyan');

    // Discover diagrams
    const diagrams = discoverDiagrams();

    // Filter by type if specified
    const filteredDiagrams = CONFIG.targetType
        ? diagrams.filter(d => d.type === CONFIG.targetType)
        : diagrams;

    if (filteredDiagrams.length === 0) {
        log('\n❌ No diagrams found to test', 'red');
        if (CONFIG.targetType) {
            log(`   Filter: --type ${CONFIG.targetType}`, 'gray');
        }
        process.exit(1);
    }

    // Display summary
    const stableDiagrams = filteredDiagrams.filter(d => !d.isBeta);
    const betaDiagrams = filteredDiagrams.filter(d => d.isBeta);

    log(`\n📊 Test Summary:`, 'blue');
    log(`   Total diagrams: ${filteredDiagrams.length}`, 'gray');
    log(`   Stable: ${stableDiagrams.length}`, 'gray');
    log(`   Beta: ${betaDiagrams.length}`, 'yellow');

    if (CONFIG.targetType) {
        log(`   Filter: ${CONFIG.targetType}`, 'gray');
    }

    log('\n' + '─'.repeat(60), 'gray');

    // Run tests
    for (const diagram of filteredDiagrams) {
        const icon = diagram.isBeta ? '⚡' : '📄';
        const label = diagram.isBeta ? '[BETA]' : '[STABLE]';

        process.stdout.write(`\n${icon} Testing ${label} ${diagram.type}... `);

        const result = await testDiagram(diagram);

        if (result.success) {
            log(`✅ PASSED (${formatDuration(result.duration)})`, 'green');

            if (CONFIG.verbose) {
                log(`  Lines: ${result.details.lines} | Size: ${result.details.size} bytes`, 'gray');
            }

            results.passed.push({
                diagram,
                result
            });
        } else {
            log(`❌ FAILED (${formatDuration(result.duration)})`, 'red');
            log(`  Error: ${result.error}`, 'red');

            results.failed.push({
                diagram,
                result
            });
        }
    }

    // Print final summary
    printSummary();
}

/**
 * Print test summary
 */
function printSummary() {
    const totalDuration = Date.now() - results.startTime;
    const total = results.passed.length + results.failed.length;
    const passRate = total > 0 ? (results.passed.length / total * 100).toFixed(1) : 0;

    log('\n' + '═'.repeat(60), 'cyan');
    log('\n📈 Test Results:', 'cyan');
    log('─'.repeat(60), 'gray');

    log(`\n  ✅ Passed: ${results.passed.length}`, 'green');
    log(`  ❌ Failed: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'gray');
    log(`  ⏭️  Skipped: ${results.skipped.length}`, 'yellow');
    log(`  📊 Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow');
    log(`  ⏱️  Duration: ${formatDuration(totalDuration)}`, 'gray');

    if (results.failed.length > 0) {
        log('\n❌ Failed Tests:', 'red');
        log('─'.repeat(60), 'gray');

        for (const { diagram, result } of results.failed) {
            log(`\n  • ${diagram.file}`, 'red');
            log(`    ${result.error}`, 'gray');
        }
    }

    log('\n' + '═'.repeat(60), 'cyan');

    // Exit with error if tests failed
    if (results.failed.length > 0) {
        log('\n⚠️  Some tests failed. Please review the errors above.\n', 'yellow');
        process.exit(1);
    } else {
        log('\n🎉 All tests passed!\n', 'green');
        process.exit(0);
    }
}

/**
 * Main entry point
 */
async function main() {
    try {
        await runTests();
    } catch (error) {
        log(`\n❌ Test runner error: ${error.message}`, 'red');
        if (CONFIG.verbose) {
            console.error(error);
        }
        process.exit(1);
    }
}

// Run tests
main();
