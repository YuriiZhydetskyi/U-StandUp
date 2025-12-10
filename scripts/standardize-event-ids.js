/**
 * Script to standardize event IDs to format: {type}-{name}-{YYYY-MM-DD}
 *
 * WARNING: This will break existing links to old event URLs!
 * Run with --dry-run first to see what changes will be made.
 *
 * Usage:
 *   node scripts/standardize-event-ids.js --dry-run   # Preview changes
 *   node scripts/standardize-event-ids.js             # Apply changes
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const EVENTS_DIR = path.join(__dirname, '..', 'events');
const DRY_RUN = process.argv.includes('--dry-run');

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function generateStandardId(event) {
    const date = event.date; // Already in YYYY-MM-DD format
    const category = event.category || 'event';

    // Map category to shorter prefix
    const prefixMap = {
        'concert': 'concert',
        'open-mic': 'open-mic',
        'workshop': 'workshop'
    };

    const prefix = prefixMap[category] || 'event';

    // For workshops (readings), just use date
    if (category === 'workshop') {
        return `workshop-${date}`;
    }

    // For open-mics, include location hint if available
    if (category === 'open-mic') {
        const location = event.location || '';
        if (location.toLowerCase().includes('bonn')) {
            return `open-mic-bonn-${date}`;
        }
        if (location.toLowerCase().includes('düsseldorf') || location.toLowerCase().includes('dusseldorf')) {
            return `open-mic-dusseldorf-${date}`;
        }
        return `open-mic-${date}`;
    }

    // For concerts, create a short name from event name
    const name = event.name || '';
    let shortName = '';

    if (name.toLowerCase().includes('зимовий') || name.toLowerCase().includes('winter')) {
        shortName = 'winter';
    } else if (name.toLowerCase().includes('осінній') || name.toLowerCase().includes('herbst')) {
        shortName = 'herbst';
    } else if (name.toLowerCase().includes('весняний') || name.toLowerCase().includes('spring')) {
        shortName = 'spring';
    } else if (name.toLowerCase().includes('травневий') || name.toLowerCase().includes('may')) {
        shortName = 'may';
    } else if (name.toLowerCase().includes('крафтовий')) {
        shortName = 'craft';
    } else if (name.toLowerCase().includes('абрамов')) {
        shortName = 'abramov-solo';
    } else if (name.toLowerCase().includes('майстер') || name.toLowerCase().includes('masterclass')) {
        shortName = 'masterclass';
    } else {
        shortName = slugify(name).substring(0, 20);
    }

    return `${prefix}-${shortName}-${date}`;
}

function standardizeEventIds() {
    console.log(DRY_RUN ? '🔍 DRY RUN - No changes will be made\n' : '🚀 Applying changes...\n');

    const changes = [];

    // Get all YAML files
    const yamlFiles = fs.readdirSync(EVENTS_DIR).filter(f => f.endsWith('.yaml'));

    for (const filename of yamlFiles) {
        const filepath = path.join(EVENTS_DIR, filename);
        const content = fs.readFileSync(filepath, 'utf8');
        const event = yaml.load(content);

        const oldId = event.id;
        const newId = generateStandardId(event);

        if (oldId === newId) {
            console.log(`✓ ${oldId} (already standard)`);
            continue;
        }

        changes.push({
            filename,
            filepath,
            oldId,
            newId,
            event,
            content
        });

        console.log(`📝 ${oldId} → ${newId}`);
    }

    if (changes.length === 0) {
        console.log('\n✅ All event IDs are already standardized!');
        return;
    }

    console.log(`\n📊 ${changes.length} events need ID changes`);

    if (DRY_RUN) {
        console.log('\n💡 Run without --dry-run to apply changes');
        return;
    }

    // Apply changes
    console.log('\n🔄 Applying changes...');

    for (const change of changes) {
        // Update YAML file with new ID
        change.event.id = change.newId;
        const newContent = yaml.dump(change.event, {
            lineWidth: -1,
            quotingType: '"',
            forceQuotes: false
        });

        // Write updated YAML
        fs.writeFileSync(change.filepath, newContent, 'utf8');
        console.log(`  ✓ Updated ${change.filename}`);

        // Remove old event folder if exists
        const oldDir = path.join(EVENTS_DIR, change.oldId);
        if (fs.existsSync(oldDir)) {
            fs.rmSync(oldDir, { recursive: true });
            console.log(`  🗑️ Removed old folder: events/${change.oldId}/`);
        }
    }

    console.log('\n✅ All IDs standardized!');
    console.log('💡 Run "npm run build" to regenerate event pages and sitemap');
    console.log('\n⚠️  WARNING: Old event URLs will no longer work!');
    console.log('   Consider adding redirects or updating any external links.');
}

standardizeEventIds();
