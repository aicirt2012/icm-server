
app.service('Statistics', function($resource) {
    return $resource('/api/statistics');
});

app.service('Email', function($resource) {
    return $resource('/api/email/:id');
});