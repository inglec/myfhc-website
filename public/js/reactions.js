const db = firebase.firestore();

var lastRef;
var reactionsHtml; // Store html for all reactions loaded.

var artistsPopulated = false;
var tagsPopulated = false;

window.onload = populateReactions();

function populateReactions() {
    var ref = db.collection('reactions')
        .orderBy('date', 'desc')
        .limit(30);

    ref.get().then(function(snapshot) {
        lastRef = snapshot.docs[snapshot.docs.length-1]; // Remember ref for pagination.

        reactionsHtml = '';
        snapshot.forEach(function(doc) {
            var video = doc.data();
            reactionsHtml += createCard(video.artist, video.song, video.thumbnail, video.url); // common.js
        });
        $('#video-cards').html(reactionsHtml); // Populate video grid.

        $('#more-videos-button').show();
    });
}

function populateNextReactions() {
    var ref = db.collection('reactions')
        .orderBy('date', 'desc')
        .startAfter(lastRef)
        .limit(30);
    ref.get().then(function(snapshot) {
        lastRef = snapshot.docs[snapshot.docs.length-1];

        snapshot.forEach(function(doc) {
            var video = doc.data();
            reactionsHtml += createCard(video.artist, video.song, video.thumbnail, video.url); // common.js
        });
        $('#video-cards').html(reactionsHtml); // Append to video grid.
    });
}

function populateTags() {
    if (!tagsPopulated) {
        tagsPopulated = true;

        var ref = db.collection('schema').doc('reactions');
        ref.get().then(function(doc) {
            if (doc.exists) {
                var html = createTagOptions(doc.data().tags);
                $('#video-tag').html(html); // Populate video tag fields.
            }
            else console.log('Schema does not exist!');
        });
    }
}

function populateArtists() {
    if (!artistsPopulated) {
        artistsPopulated = true;

        var ref = db.collection('reactions');
        ref.get().then(function(snapshot) {
            var artists = {};
            snapshot.forEach(function(doc) {
                var artist = doc.data().artist;
                if (artist) {
                    artists[artist] = true;
                }
            });
            $('#artists').html(getArtistsOptions(artists)); // Populate artists in search modal.
        });
    }
}

function getArtistsOptions(artists) {
    artists = Object.keys(artists).sort();

    var html = '<option value="all">All</option>';
    for (var i = 0; i < artists.length; i++) {
        html += '<option>' + artists[i] + '</option>';
    }
    return html;
}

function createTagOptions(tags) {
    var html = '<option value="all">All</option>';
    for (var i = 0; i < tags.length; i++) {
        html += '<option>' + tags[i] + '</option>';
    }
    return html;
}

$('#show-modal').click(function() {
    populateTags();
    populateArtists();
})

$('#search-reactions').click(function() {
    $('#more-videos-button').hide();

    // Get fields from search modal.
    if (!$('#artists').find(':selected').attr('value'))
        var artist = $('#artists').find(':selected').text();

    if (!$('#video-tag').find(':selected').attr('value'))
        var tag = $('#video-tag').find(':selected').text();

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
        $('#more-videos-button').show();
    }
});
