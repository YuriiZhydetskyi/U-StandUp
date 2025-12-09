/**
 * One-time script to convert existing events.js to individual YAML files
 *
 * Usage: node scripts/convert-events-to-yaml.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const EVENTS_DIR = path.join(__dirname, '..', 'events');

// Import events from the old file
// We'll parse it manually since it's a JS file with template literals
const eventsContent = fs.readFileSync(path.join(__dirname, '..', 'events.js'), 'utf8');

// Extract the array part (between [ and ];)
const arrayMatch = eventsContent.match(/const events = \[([\s\S]*)\];\s*export default events;/);
if (!arrayMatch) {
    console.error('Could not parse events.js');
    process.exit(1);
}

// We need to evaluate this, but safely
// Let's use a simpler approach - just read the events and manually create YAML

// Actually, let's just create a Node-compatible version
const tempFile = path.join(__dirname, 'temp-events.cjs');
const nodeCompatibleContent = eventsContent
    .replace('export default events;', 'module.exports = events;');

fs.writeFileSync(tempFile, nodeCompatibleContent);

const events = require('./temp-events.cjs');

// Clean up temp file
fs.unlinkSync(tempFile);

console.log(`Found ${events.length} events\n`);

// Ensure events directory exists
if (!fs.existsSync(EVENTS_DIR)) {
    fs.mkdirSync(EVENTS_DIR, { recursive: true });
}

for (const event of events) {
    const filename = `${event.date}-${event.id.replace(/[^a-z0-9-]/g, '-')}.yaml`;
    const filepath = path.join(EVENTS_DIR, filename);

    // Clean up description - remove HTML tags for cleaner YAML
    let description = event.description || '';

    // Convert <br>, <p>, <br><br> to newlines
    description = description
        .replace(/<br\s*\/?><br\s*\/?>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>\s*<p>/gi, '\n\n')
        .replace(/<p>/gi, '')
        .replace(/<\/p>/gi, '\n')
        .replace(/<ul>/gi, '')
        .replace(/<\/ul>/gi, '')
        .replace(/<li>/gi, '• ')
        .replace(/<\/li>/gi, '\n')
        .trim();

    // Keep <a> tags for links
    // description already has them

    const yamlEvent = {
        id: event.id,
        name: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
    };

    if (event.locationForCalendar) {
        yamlEvent.locationForCalendar = event.locationForCalendar;
    }
    if (event.linkToMaps) {
        yamlEvent.linkToMaps = event.linkToMaps;
    }
    if (event.googleFormLink) {
        yamlEvent.ticketLink = event.googleFormLink;
    }
    if (event.image) {
        yamlEvent.image = event.image;
    }
    if (event.isFavorite) {
        yamlEvent.isFavorite = true;
    }

    yamlEvent.description = description;

    const yamlContent = yaml.dump(yamlEvent, {
        lineWidth: -1, // Don't wrap lines
        quotingType: '"',
        forceQuotes: false,
    });

    fs.writeFileSync(filepath, yamlContent);
    console.log(`✓ ${filename}`);
}

console.log(`\nConverted ${events.length} events to YAML files in events/`);
