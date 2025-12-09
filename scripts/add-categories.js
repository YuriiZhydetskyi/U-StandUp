/**
 * One-time script to add categories to existing YAML events
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const EVENTS_DIR = path.join(__dirname, '..', 'events');

function detectCategory(event, filename) {
    const id = event.id || '';
    const name = (event.name || '').toLowerCase();
    const fname = filename.toLowerCase();

    // Читка / Workshop
    if (id.includes('meeting') || fname.includes('meeting') ||
        name.includes('читка') || name.includes('перша зустріч')) {
        return 'workshop';
    }

    // Відкритий мікрофон / Open Mic
    if (id.includes('open') || fname.includes('open') ||
        name.includes('відкритий мікрофон') || name.includes('open mic')) {
        return 'open-mic';
    }

    // Концерт / Concert (default for shows)
    if (id.includes('concert') || id.includes('standup') ||
        fname.includes('concert') || fname.includes('standup') ||
        name.includes('стендап') || name.includes('концерт') ||
        name.includes('сольний') || name.includes('майстер')) {
        return 'concert';
    }

    // Default to concert for anything else
    return 'concert';
}

const categoryLabels = {
    'concert': 'Концерт',
    'open-mic': 'Відкритий мікрофон',
    'workshop': 'Читка'
};

function addCategories() {
    const files = fs.readdirSync(EVENTS_DIR)
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

    let updated = 0;

    for (const file of files) {
        const filePath = path.join(EVENTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const event = yaml.load(content);

        // Skip if already has category
        if (event.category) {
            console.log(`⏭ ${file} (already has category: ${event.category})`);
            continue;
        }

        const category = detectCategory(event, file);
        event.category = category;

        // Reorder keys: put category after date/time
        const orderedEvent = {};
        const keyOrder = ['id', 'name', 'category', 'date', 'time', 'location', 'locationForCalendar',
                         'linkToMaps', 'ticketLink', 'image', 'isFavorite', 'performers', 'description'];

        for (const key of keyOrder) {
            if (event[key] !== undefined) {
                orderedEvent[key] = event[key];
            }
        }
        // Add any remaining keys
        for (const key of Object.keys(event)) {
            if (!orderedEvent.hasOwnProperty(key)) {
                orderedEvent[key] = event[key];
            }
        }

        const newContent = yaml.dump(orderedEvent, {
            lineWidth: -1,
            quotingType: '"',
            forceQuotes: false,
        });

        fs.writeFileSync(filePath, newContent);
        console.log(`✓ ${file} → ${categoryLabels[category]}`);
        updated++;
    }

    console.log(`\nUpdated ${updated} files`);
}

addCategories();
