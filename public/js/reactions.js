const db = firebase.firestore();
var reactionsHtml = '';

window.onload = function() {
    // Pull reactions from database.
    var reactions = db.collection('reactions').orderBy('date', 'desc');
    reactions.get().then(function(snapshot) {
        var artists = {};
        var html = '';
        snapshot.forEach(function(doc) {
            html += createCard(doc.data().artist, doc.data().song, doc.data().thumbnail, doc.data().url);
            if (doc.data().artist) {
                artists[doc.data().artist] = true;
            }
        });
        reactionsHtml = html;
        $('#videos').html(html); // Populate video grid.
        $('#artists').html(getArtistsOptions(artists)); // Populate artist select fields.
    });

    var schema = db.collection('schema').doc('reactions');
    schema.get().then(function(doc) {
        if (doc.exists) {
            var html = getTagOptions(doc.data());
            $('#video-tag').html(html); // Populate video tag fields.
        }
        else console.log('Schema does not exist!');
    });
}

function createCard(title, content, image, link) {
    var html = '';
    html += '<div class="col mb-3" align="center">';
    html += '<div class="card video-card">';
    html += '<a href="' + link + '"><img class="card-img-top" src="' + image + '"></a>'
    html += '<div class="card-body">';
    html += '<h5 class="card-title">' + title + '</h5>';
    html += '<p class="card-text">' + content + '</p>';
    html += '</div>';
    html += '</div>';
    html += '</div>'
    return html;
}

function getArtistsOptions(artists) {
    artists = Object.keys(artists).sort();

    var html = '<option>All</option>';
    for (var i = 0; i < artists.length; i++) {
        html += '<option value="' + artists[i] + '">' + artists[i] + '</option>';
    }
    return html;
}

function getTagOptions(video) {
    var html = '<option>All</option>';
    for (var tag in video.tags) {
        html += '<option value="' + tag + '">' + video.tags[tag] + '</option>';
    }
    return html;
}

$('#search-reactions').click(function() {
    // Get fields from search modal.
    var artist = $('#artists').find(':selected').attr('value');
    var tag = $('#video-tag').find(':selected').attr('value');
    var tagName = $('#video-tag').find(':selected').text();

    if (!artist && !tag) {
        $('#videos').html(reactionsHtml); // Return original html.
    }
    else {
        // Get firestore reference to database for search query.
        var ref = db.collection('reactions');
        if (artist) ref = ref.where('artist', '==', artist);
        if (tag) ref = ref.where('tags.' + tag, '==', tagName);

        ref.get().then(function(snapshot) {
            var html = '';
            snapshot.forEach(function(doc) {
                html += createCard(doc.data().artist, doc.data().song, doc.data().thumbnail, doc.data().url);
            });
            $('#videos').html(html);
        });
    }
});
