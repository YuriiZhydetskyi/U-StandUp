define(['jquery', './events', './about-us', './otherClubs', './ics-browserified'], function ($, events, aboutUs, otherClubs, ics) {
    let generateICS;

    function displayEvents() {
        const eventsContainer = $('#events-container');
        const pastEventsContainer = $('#past-events-container');
        const currentDate = new Date();
    
        events.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return new Date(a.date) - new Date(b.date);
        });
    
        events.forEach(event => {
            const eventDate = new Date(event.date);
            const eventElement = createEventElement(event);
    
            if (event.isFavorite) {
                eventElement.addClass('favorite-event');
            }
    
            if (eventDate >= currentDate) {
                eventsContainer.append(eventElement);
            } else {
                pastEventsContainer.append(eventElement);
            }
        });
    }

    function createEventElement(event) {
        const locationElement = event.linkToMaps ? `<p><strong>Місце:</strong> <a href="${event.linkToMaps}" target="_blank">${event.location}</a></p>` : `<p><strong>Місце:</strong> ${event.location}</p>`;
    
        const googleCalendarLink = createGoogleCalendarLink(event);
        const appleCalendarButton = createAppleCalendarButton(event);
    
        return $(`
            <div class="event" id="${event.id}">
                <h3>${event.name}</h3>
                <p><strong>Дата:</strong> ${formatDate(event.date)}</p>
                <p><strong>Час:</strong> ${event.time}</p>
                ${locationElement}
                <p>${event.description}</p>
                ${event.image ? `<img src="${event.image}" alt="${event.name}">` : ''}
                ${event.googleFormLink ? `<a href="${event.googleFormLink}" target="_blank" class="btn btn-primary">Зареєструватися</a>` : ''}
                <div class="mt-3">
                    <a href="${googleCalendarLink}" target="_blank" class="btn btn-success">Додати до Google Calendar</a>
                    ${appleCalendarButton}
                </div>
            </div>
        `);
    }

    function createGoogleCalendarLink(event) {
        const startDate = new Date(`${event.date}T${event.time}`);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assuming 2 hours duration
        const encodedName = encodeURIComponent(event.name);
        const encodedDescription = encodeURIComponent(event.description);
        const encodedLocation = encodeURIComponent(event.location);
        
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedName}&dates=${startDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}/${endDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodedDescription}&location=${encodedLocation}`;
    }

    function createAppleCalendarButton(event) {
        return `<button onclick="window.generateICS('${event.id}')" class="btn btn-info ml-2">Додати до Apple Calendar</button>`;
    }

    generateICS = function(eventId) {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        const startDate = new Date(`${event.date}T${event.time}`);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assuming 2 hours duration

        const icsEvent = {
            start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
            duration: { hours: 2 },
            title: event.name,
            description: event.description,
            location: event.location,
            url: event.linkToMaps,
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
            productId: 'adamgibbons/ics',
            alarms: []
        };

        if (event.isFavorite) {
            icsEvent.alarms.push(
                { action: 'display', trigger: { days: 2, before: true } },
                { action: 'display', trigger: { hours: 2, before: true } }
            );
        } else {
            icsEvent.alarms.push(
                { action: 'display', trigger: { hours: 3, before: true } }
            );
        }

        ics.createEvent(icsEvent, (error, value) => {
            if (error) {
                console.log(error);
                return;
            }

            const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${event.name}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    function displayOtherClubs() {
        const otherClubsContainer = $('#other-clubs-container');

        otherClubs.forEach(club => {
            const clubElement = createClubElement(club);
            otherClubsContainer.append(clubElement);
        });
    }

    function createClubElement(club) {
        const linksHtml = club.links.map(link => `<a href="${link.url}" target="_blank">${link.label}</a>`).join(' | ');
    
        return $(`
            <div class="club" id="${club.id}">
                <div class="row">
                    <div class="col-md-3">
                        ${club.picture ? `<img src="${club.picture}" alt="${club.title}" class="club-logo">` : ''}
                    </div>
                    <div class="col-md-9">
                        <h3>${club.title}</h3>
                        <p><strong>Місто:</strong> ${club.city}, ${club.country}</p>
                        <p>${club.description}</p>
                        <p>Посилання: ${linksHtml}</p>
                    </div>
                </div>
            </div>
        `);
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    function displayAboutUs() {
        $('#about-us-content').html(aboutUs);
    }

    function init() {
        displayEvents();
        displayAboutUs();
        displayOtherClubs();
        window.generateICS = generateICS; // Make generateICS available globally
    }

    return {
        init: init
    };
});