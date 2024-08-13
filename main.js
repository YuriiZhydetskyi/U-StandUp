requirejs.config({
    paths: {
        bootstrap: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min',
        app: 'app',
        ics: 'ics-browserified'
    }
});

requirejs(['bootstrap', 'app'], function(bootstrap, app) {
    app.init();
});