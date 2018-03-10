const db = firebase.firestore();

var lastRef;
var reactionsHtml = ''; // Store html for all reactions loaded.

var searchOptionsPopulated = false;

window.onload = populateReactions();

function populateReactions() {
    var ref;

    if (lastRef) {
        ref = db.collection('reactions')
            .orderBy('date', 'desc')
            .startAfter(lastRef)
            .limit(30);
    }
    else {
        ref = db.collection('reactions')
            .orderBy('date', 'desc')
            .limit(30);
    }


    ref.get().then(function(snapshot) {
        lastRef = snapshot.docs[snapshot.docs.length-1]; // Remember ref for pagination.

        if (!lastRef) $('#more-videos-button').hide();
        else $('#more-videos-button').show();

        snapshot.forEach(function(doc) {
            var video = doc.data();
            reactionsHtml += createCard(video.artist, video.song, video.thumbnail, video.url); // common.js
        });
        $('#video-cards').html(reactionsHtml); // Populate video grid.
    });
}

function populateSearchOptions() {
    if (!searchOptionsPopulated) {
        searchOptionsPopulated = true;

        var ref = db.collection('reactions');
        ref.get().then(function(snapshot) {
            var artists = {};
            var tags = {};
            snapshot.forEach(function(doc) {
                var video = doc.data();
                if (video.artist) {
                    artists[video.artist] = true;
                }
                var keys = Object.keys(video.tags);
                for (var i = 0; i < keys.length; i++) {
                    var tag = keys[i];
                    tags[tag] = true;
                }
            });
            $('#artists').append(getOptions(artists)); // Populate artists in search modal.
            $('#tags').append(getOptions(tags));
        });
    }
}

$('#show-modal').click(function() {
    populateSearchOptions();
})

$('#search-reactions').click(function() {
    $('#more-videos-button').hide();

    // Get fields from search modal.
    if (!$('#artists').find(':selected').attr('value'))
        var artist = $('#artists').find(':selected').text();

    if (!$('#tags').find(':selected').attr('value'))
        var tag = $('#tags').find(':selected').text();

    if (artist || tag) {
        // Get firestore reference to database for search query.
        var ref = db.collection('reactions');
        if (artist) ref = ref.where('artist', '==', artist); // Add artist query.
        if (tag) ref = ref.where('tags.' + tag, '==', null); // Add tag query.

        ref.get().then(function(snapshot) {
            var html = '';
            snapshot.forEach(function(doc) {
                var video = doc.data();
                html += createCard(video.artist, video.song, video.thumbnail, video.url); // common.js
            });
            $('#video-cards').html(html);
        });
    }
    else {
        $('#video-cards').html(reactionsHtml);
        if (lastRef) $('#more-videos-button').show();
    }
});
