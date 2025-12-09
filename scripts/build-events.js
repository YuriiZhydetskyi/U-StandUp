/**
 * Build script to compile YAML event files into JavaScript
 *
 * Usage: npm run build-events
 *
 * Reads all .yaml files from events/ folder and generates:
 * - js/events.js (ES6 module for the app)
 * - data/events.json (for SEO and external use)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const EVENTS_DIR = path.join(__dirname, '..', 'events');
const OUTPUT_JS = path.join(__dirname, '..', 'js', 'events.js');
const OUTPUT_JSON = path.join(__dirname, '..', 'data', 'events.json');

function buildEvents() {
    console.log('Building events from YAML files...\n');

    // Get all YAML files
    const files = fs.readdirSync(EVENTS_DIR)
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
        .sort()
        .reverse(); // Newest first

    const events = [];

    for (const file of files) {
        const filePath = path.join(EVENTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');

        try {
            const event = yaml.load(content);

            // Process description - convert newlines to proper format
            if (event.description) {
                event.description = event.description.trim();
            }

            // Add ticket link to googleFormLink for backwards compatibility
            if (event.ticketLink && !event.googleFormLink) {
                event.googleFormLink = event.ticketLink;
            }

            events.push(event);
            console.log(`✓ ${file}`);
        } catch (err) {
            console.error(`✗ ${file}: ${err.message}`);
        }
    }

    // Sort by date (newest first for upcoming, oldest first for past)
    events.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    // Generate JS file
    const jsContent = `// Auto-generated from YAML files in events/ folder
// Run 'npm run build-events' to regenerate

const events = ${JSON.stringify(events, null, 2)};

export default events;
`;

    fs.writeFileSync(OUTPUT_JS, jsContent, 'utf8');
    console.log(`\n✓ Generated ${OUTPUT_JS}`);

    // Generate JSON file
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(events, null, 2), 'utf8');
    console.log(`✓ Generated ${OUTPUT_JSON}`);

    console.log(`\nTotal: ${events.length} events`);
}

buildEvents();
