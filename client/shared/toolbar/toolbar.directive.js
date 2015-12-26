app.directive('toolbar', function() {
    return {
        scope: {
            title: '@'
        },
        replace: true,
        templateUrl: '/shared/toolbar/toolbar.html'
    };
});