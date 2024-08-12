requirejs.config({
    paths: {
        jquery: 'https://code.jquery.com/jquery-3.7.1.min',
        bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min',
        app: 'app',
        ics: 'https://unpkg.com/ics-js@0.10.2/dist/ics-js'
    },
    shim: {
        'bootstrap': ['jquery'],
        'ics': {
            exports: 'ics'
        }
    }
});
requirejs(['jquery', 'bootstrap', 'app'], function($, bootstrap, app) {
    app.init();
});