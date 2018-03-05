window.onload = function() {
    // Pull reactions from database.
    var ref = firebase.database().ref('reactions');
    ref.on('value', function(snapshot) {
        var html = createVideoPanel(snapshot.val());
        $('#videos').html(html);

        html = getArtistsOptions(snapshot.val());
        $('#artists').html(html);
    });

    ref = firebase.database().ref('schema');
    ref.on('value', function(snapshot) {
        var html = getTagOptions(snapshot.val());
        $('#video-tag').html(html);
    });
}

function createVideoPanel(videos) {
    var keys = Object.keys(videos);
    var html = '<div class="row">';
    var i;
    for (i = 0; i < keys.length; i++) {
        if (i % 3 === 0 && i > 0) {
            html += '</div>';
            html += '<br>';
            html += '<div class="row">';
        }

        var key = keys[i];
        var video = videos[key];

        html += '<div class="col">';
        if (video.artist && video.song)
            html += createCard(video.artist, video.song, video.thumbnail, video.url);
        else
            html += createCard(video.title, '', video.thumbnail, video.url);
        html += '</div>';
    }
    for (; i % 3 !== 0; i++) {
        html += '<div class="col"></div>';
    }

    html += '</div>';

    return html;
}

function getThumbnailUrl(url) {
    if (url.includes('youtu.be')) {
        return 'https://img.youtube.com/vi/' + url.split('youtu.be/')[1] + '/0.jpg';
    }
    else if (url.includes('streamable.com')) {
        return 'http://images.streamable.com/east/image/' + url.split('streamable.com/')[1] + '.jpg'
    }
    else return '';
}

function createCard(title, content, image, link) {
    var html = '';
    html += '<div class="card">';
    html += '<a href="' + link + '"><img class="card-img-top" src="' + image + '"></a>'
    html += '<div class="card-body">';
    html += '<h5 class="card-title">' + title + '</h5>';
    html += '<p class="card-text">' + content + '</p>';
    html += '</div>';
    html += '</div>';
    return html;
}

function getArtistsOptions(videos) {
    var artists = {};

    var html = '<option></option>';
    for (var video in videos) {
        var artist = videos[video].artist;
        if (artist) {
            artists[artist] = true;
        }
    }

    artists = Object.keys(artists);
    artists = artists.sort();
    for (var i = 0; i < artists.length; i++) {
        html += '<option>' + artists[i] + '</option>';
    }

    return html;
}

function getTagOptions(schema) {
    var html = '<option></option>';
    for (var tag in schema.reactions.tags) {
        html += '<option value="' + tag + '">' + schema.reactions.tags[tag] + '</option>';
    }
    return html;
}

$('#search-reactions').click(function() {
    // Get fields from search modal.
    var artist = $('#artists').find(':selected').text();
    var tag = $('#video-tag').find(':selected').attr('value');
    var tagName = $('#video-tag').find(':selected').text();

    var ref = firebase.database().ref('reactions');

    if (artist)
        ref = ref.orderByChild('artist').equalTo(artist);

    if (tag)
        ref = ref.orderByChild('tags/' + tag).equalTo(tagName);

    ref.on('value', function(snapshot) {
        var html = '';
        if (snapshot.val()) {
            html = createVideoPanel(snapshot.val());
        }
        $('#videos').html(html);
    });
});
