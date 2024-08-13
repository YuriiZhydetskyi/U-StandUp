requirejs.config({
    paths: {
        app: 'app',
        ics: 'ics-browserified'
    }
});

requirejs(['app'], function(app) {
    app.init();
});