const db = firebase.firestore();

var lastRef;
var streamsHtml = ''; // Store html for all streams loaded.

var searchOptionsPopulated = false;

window.onload = populateStreams();

function populateStreams() {
    var ref;

    if (lastRef) {
        ref = db.collection('streams')
            .orderBy('date', 'desc')
            .startAfter(lastRef)
            .limit(30);
    }
    else {
        ref = db.collection('streams')
            .orderBy('date', 'desc')
            .limit(30);
    }

    ref.get().then(function(snapshot) {
        lastRef = snapshot.docs[snapshot.docs.length-1]; // Remember ref for pagination.

        if (!lastRef) $('#more-streams-button').hide();
        else $('#more-streams-button').show();

        snapshot.forEach(function(doc) {
            var video = doc.data();
            streamsHtml += createCard(video.title, video.description, video.thumbnail, video.url); // common.js
        });
        $('#video-cards').html(streamsHtml); // Populate video grid.
    });
}

function populateSearchOptions() {
    if (!searchOptionsPopulated) {
        searchOptionsPopulated = true;

        var ref = db.collection('streams');
        ref.get().then(function(snapshot) {
            var tags = {};
            snapshot.forEach(function(doc) {
                var keys = Object.keys(doc.data().tags);
                for (var i = 0; i < keys.length; i++) {
                    var tag = keys[i];
                    tags[tag] = true;
                }
            });
            $('#tags').append(getOptions(tags));
        });
    }
}

$('#show-modal').click(function() {
    populateSearchOptions();
})

$('#search-streams').click(function() {
    $('#more-streams-button').hide();

    // Get fields from search modal.
    if (!$('#tags').find(':selected').attr('value'))
        var tag = $('#tags').find(':selected').text();

    if (tag) {
        // Get firestore reference to database for search query.
        var ref = db.collection('streams');
        if (tag) ref = ref.where('tags.' + tag, '==', null); // Add tag query.

        ref.get().then(function(snapshot) {
            var html = '';
            snapshot.forEach(function(doc) {
                var video = doc.data();
                html += createCard(video.title, video.description, video.thumbnail, video.url); // common.js
            });
            $('#video-cards').html(html);
        });
    }
    else {
        $('#video-cards').html(streamsHtml);
        if (lastRef) $('#more-streams-button').show();
    }
});
