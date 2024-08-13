define(['./events', './about-us', './otherClubs', './ics-browserified'], function (events, aboutUs, otherClubs, ics) {
    let generateICS;

    function displayEvents() {
        const eventsContainer = document.getElementById('events-container');
        const pastEventsContainer = document.getElementById('past-events-container');
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
                eventElement.classList.add('favorite-event');
            }
    
            if (eventDate >= currentDate) {
                eventsContainer.appendChild(eventElement);
            } else {
                pastEventsContainer.appendChild(eventElement);
            }
        });
    }

    function createEventElement(event) {
        const locationElement = event.linkToMaps 
            ? `<p><strong>Місце:</strong> <a href="${event.linkToMaps}" target="_blank">${event.location}</a></p>` 
            : `<p><strong>Місце:</strong> ${event.location}</p>`;
    
        const googleCalendarLink = createGoogleCalendarLink(event);
        const appleCalendarButton = createAppleCalendarButton(event);
    
        const eventDiv = document.createElement('div');
        eventDiv.className = `event card mb-4 ${event.isFavorite ? 'border-warning bg-warning bg-opacity-10' : ''}`;
        eventDiv.id = event.id;
        eventDiv.innerHTML = `
            <div class="card-body">
                <h3 class="card-title">${event.name}</h3>
                <p class="card-text"><strong>Дата:</strong> ${formatDate(event.date)}</p>
                <p class="card-text"><strong>Час:</strong> ${event.time}</p>
                ${locationElement}
                <p class="card-text">${event.description}</p>
                ${event.image ? `<img src="${event.image}" alt="${event.name}" class="img-fluid mb-3">` : ''}
                <div class="row">
                    <div class="col-12 col-sm-6 col-md-4 mb-2">
                        ${event.googleFormLink ? `<a href="${event.googleFormLink}" target="_blank" class="btn btn-primary w-100">Зареєструватися</a>` : ''}
                    </div>
                    <div class="col-12 col-sm-6 col-md-4 mb-2">
                        <a href="${googleCalendarLink}" target="_blank" class="btn btn-success w-100">Додати до Google Calendar</a>
                    </div>
                    <div class="col-12 col-sm-6 col-md-4 mb-2">
                        ${appleCalendarButton}
                    </div>
                </div>
            </div>
        `;
        return eventDiv;
    }

    function getDescriptionForCalendar(event) {
        return event.locationForCalendar 
                ? `Локація: ` + `<a href="${event.linkToMaps}" target="_blank">${event.location}</a>\n\n${event.description}`
                : event.description;
    }

    function createGoogleCalendarLink(event) {
        const startDate = new Date(`${event.date}T${event.time}`);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assuming 2 hours duration
        const encodedName = encodeURIComponent(event.name);
        const encodedDescription = encodeURIComponent(getDescriptionForCalendar(event));
        const encodedLocation = encodeURIComponent(event.locationForCalendar ?? event.location);
        
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedName}&dates=${startDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}/${endDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodedDescription}&location=${encodedLocation}`;
    }

    function createAppleCalendarButton(event) {
        return `<button onclick="window.generateICS('${event.id}')" class="btn btn-info w-100">Додати до Apple Calendar</button>`;
    }

    generateICS = function(eventId) {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        const startDate = new Date(`${event.date}T${event.time}`);

        const icsEvent = {
            start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
            duration: { hours: 2 },
            title: event.name,
            description: getDescriptionForCalendar(event),
            location: event.location ?? event.locationForCalendar,
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
        const otherClubsContainer = document.getElementById('other-clubs-container');

        otherClubs.forEach(club => {
            const clubElement = createClubElement(club);
            otherClubsContainer.appendChild(clubElement);
        });
    }

    function createClubElement(club) {
        const linksHtml = club.links.map(link => `<a href="${link.url}" target="_blank">${link.label}</a>`).join(' | ');
    
        const clubDiv = document.createElement('div');
        clubDiv.className = 'club';
        clubDiv.id = club.id;
        clubDiv.innerHTML = `
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
        `;
        return clubDiv;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    function displayAboutUs() {
        document.getElementById('about-us-content').innerHTML = aboutUs;
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