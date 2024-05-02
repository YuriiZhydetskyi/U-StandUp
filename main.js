requirejs.config({
    paths: {
        jquery: 'https://code.jquery.com/jquery-3.6.0.min',
        bootstrap: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min',
        app: 'app'
    },
    shim: {
        'bootstrap': ['jquery']
    }
});

requirejs(['jquery', 'bootstrap', 'app'], function($, bootstrap, app) {
    app.init();
});