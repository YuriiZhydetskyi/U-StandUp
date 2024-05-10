define(['jquery', './events', './about-us', './otherClubs'], function ($, events, aboutUs, otherClubs) {    function displayEvents() {
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
    
        return $(`
            <div class="event" id="${event.id}">
                <h3>${event.name}</h3>
                <p><strong>Дата:</strong> ${formatDate(event.date)}</p>
                <p><strong>Час:</strong> ${event.time}</p>
                ${locationElement}
                <p>${event.description}</p>
                ${event.image ? `<img src="${event.image}" alt="${event.name}">` : ''}
                ${event.googleFormLink ? `<a href="${event.googleFormLink}" target="_blank" class="btn btn-primary">Зареєструватися</a>` : ''}
            </div>
        `);
    }

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
    }

    return {
        init: init
    };
});