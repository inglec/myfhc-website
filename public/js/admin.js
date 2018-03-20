window.onload = function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            $('#signed-out').hide();
            $('#signed-in').show();

            fetchSecureData();
        }
        else {
            $('#signed-in').hide();
            $('#signed-out').show();
        }
    }, function(error) {
        console.log(error);
    });
};

function signOut() {
    firebase.auth().signOut().then(function() {
        console.log('Signed Out');
    }, function(error) {
        console.error('Sign Out Error', error);
    });
}

var youtubeAPIKey; // Fetch from DB.
var twitchClientID; // Fetch from DB.
const uploadsID = 'UUqAnBlp5RrpzoNLXHf6XUsA'; // Truant Channel Uploads ID

const db = firebase.firestore();

function fetchSecureData() {
    db.collection('secure')
        .get()
        .then(function(snapshot) {
            snapshot.forEach(function(doc) {
                var data = doc.data();
                youtubeAPIKey = data.youtube['api-key'];
                twitchClientID = data.twitch['client-id'];
            }
        );
    });
}

function pushAllYoutubeVideos() {
    var url = 'https://www.googleapis.com/youtube/v3/playlistItems?' +
        'playlistId=' + uploadsID +
        '&key=' + youtubeAPIKey +
        '&part=snippet&maxResults=50';
    $.getJSON(url, youtubeCallback);
}

var youtubeCallback = function(data) {
    for (var i = 0; i < data.items.length; i++) {
        var snippet = data.items[i].snippet;
        var parsedTitle = parseTitle(snippet.title);
        var video = {
            url: url,
            title:     snippet.title,
            artist:    parsedTitle.artist,
            song:      parsedTitle.song,
            date:      snippet.publishedAt,
            thumbnail: snippet.thumbnails.maxres.url
        };

        // Auto-add tags
        var title = snippet.title.toLowerCase();
        if (title.includes('live')) video.tags['Live'] = null;
        if (title.includes('jinjer')) video.tags['Jinjer Friday'] = null;
        if (title.includes('subscriber band')) video.tags['Subscriber Band Sunday'] = null;

        pushReaction('yt=' + snippet.resourceId.videoId, video); // Push video to database.
    }

    if (data.nextPageToken) {
        var url = 'https://www.googleapis.com/youtube/v3/playlistItems?' +
            'pageToken=' + data.nextPageToken +
            '&playlistId=' + uploadsID +
            '&key=' + youtubeAPIKey +
            '&part=snippet&maxResults=50';

        console.log(data.nextPageToken);
        $.getJSON(url, youtubeCallback);
    }
}

function parseTitle(title) {
    var split = ['', ''];
    var delims = ['|', '//', ':', '"', '–', '-'];
    var minDelim = null;
    var minDelimIndex = title.length;

    for (var i = 0; i < delims.length; i++) {
        var index = title.indexOf(delims[i]);
        if (index !== -1 && index < minDelimIndex) {
            minDelimIndex = index;
            minDelim = delims[i];
        }
    }
    if (minDelim) {
        split = title.split(minDelim);
    }
    var artist = split[0];
    var song = split[1];

    split = [song]
    delims = ['(', '[', '-', ':'];
    minDelim = null;
    minDelimIndex = song.length;
    for (var i = 0; i < delims.length; i++) {
        var index = song.indexOf(delims[i]);
        if (index !== -1 && index < minDelimIndex) {
            minDelimIndex = index;
            minDelim = delims[i];
        }
    }
    if (minDelim) {
        split = song.split(minDelim);
    }
    song = split[0].split('"').join(''); // Remove quote marks

    return {
        artist: toUpperCamelCase(artist.trim()),
        song:   toUpperCamelCase(song.trim())
    };
}

function toUpperCamelCase(string) {
    var split = string.split(' ');
    var result = '';
    for (var i = 0; i < split.length; i++) {
        result += split[i].charAt(0).toUpperCase();
        result += split[i].toLowerCase().substring(1, split[i].length);

        if (i < split.length-1)
            result += ' ';
    }
    return result;
}

function getYoutubeInfo(url, fieldIds) {
    var id = url.split('youtu.be/')[1];

    var url = 'https://www.googleapis.com/youtube/v3/videos?' +
        'part=snippet' +
        '&id=' + id +
        '&key=' + youtubeAPIKey;
    $.getJSON(url, function(data) {
        var snippet = data.items[0].snippet;

        var parsedTitle = parseTitle(snippet.title);
        var video = {
            url: url,
            title:     snippet.title,
            artist:    parsedTitle.artist,
            song:      parsedTitle.song,
            date:      snippet.publishedAt,
            thumbnail: snippet.thumbnails.high.url
        };

        // Inject data into IDs
        var keys = Object.keys(fieldIds);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            $(fieldIds[key]).val(video[key]);
        }
    });
}

/* ------ ADD A REACTION ------ */

function pushReaction(id, video) {
    console.log('Pushing video ' + id + ' to reactions.');
    console.log(video);

    db.collection('reactions').doc(id).set(video);
}

$('#button-get-youtube-reaction-info').click(function() {
    var url = $('#input-add-youtube-reaction-url').val();
    console.log(url);
    var fields = {
        artist:    '#input-add-youtube-reaction-artist',
        song:      '#input-add-youtube-reaction-song',
        date:      '#input-add-youtube-reaction-date',
        thumbnail: '#input-add-youtube-reaction-thumbnail'
    }
    getYoutubeInfo(url, fields);
});

$('#button-get-youtube-stream-info').click(function() {
    var url = $('#input-add-youtube-stream-url').val();
    console.log(url);
    var fields = {
        title:     '#input-add-youtube-stream-title',
        date:      '#input-add-youtube-stream-date',
        thumbnail: '#input-add-youtube-stream-thumbnail'
    }
    getYoutubeInfo(url, fields);
});

$('#button-push-youtube-reaction').click(function() {
    var video = {
        url:       $('#input-add-youtube-reaction-url').val(),
        artist:    $('#input-add-youtube-reaction-artist').val(),
        song:      $('#input-add-youtube-reaction-song').val(),
        date:      $('#input-add-youtube-reaction-date').val(),
        thumbnail: $('#input-add-youtube-reaction-thumbnail').val(),
        tags:      {}
    };

    var id = $('#input-add-youtube-reaction-url').val().split('youtu.be/')[1];

    var tags = $('#input-add-youtube-reaction-tags').val().split(',');
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].trim();
        if (tag) {
            video.tags[tag] = null;
        }
    }

    pushReaction('yt=' + id, video);
});

$('#button-push-streamable-reaction').click(function() {
    var video = {
        artist: $('#input-add-streamable-reaction-artist').val(),
        song:   $('#input-add-streamable-reaction-song').val(),
        date:   $('#input-add-streamable-reaction-date').val(),
        tags:   {}
    };

    var id = $('#input-add-streamable-reaction-url').val().split('streamable.com/')[1];

    var tags = $('#input-add-streamable-reaction-tags').val().split(',');
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].trim();
        if (tag) {
            video.tags[tag] = null;
        }
    }

    var url = 'https://api.streamable.com/videos/' + id;
    $.getJSON(url, function(data) {
        video.url       = 'https://' + data.url;
        video.thumbnail = 'https:' + data.thumbnail_url.split('?')[0] + '?height=400';

        pushReaction('st=' + id, video);
    });
});

$('#button-push-facebook-reaction').click(function() {
    var video = {
        url:    $('#input-add-facebook-reaction-url').val(),
        artist: $('#input-add-facebook-reaction-artist').val(),
        song:   $('#input-add-facebook-reaction-song').val(),
        date:   $('#input-add-facebook-reaction-date').val(),
        tags:   {}
    };

    var id = $('#input-add-facebook-reaction-url').val().split('videos/')[1].split('/')[0];

    var tags = $('#input-add-facebook-reaction-tags').val().split(',');
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].trim();
        if (tag) {
            video.tags[tag] = null;
        }
    }

    pushReaction('fb=' + id, video);
});

/* ------ ADD STREAM ------ */

function pushStream(id, video) {
    console.log('Pushing video ' + id + ' to streams.');
    console.log(video);

    db.collection('streams').doc(id).set(video);
}

$('#button-push-youtube-stream').click(function() {
    var video = {
        url:         $('#input-add-youtube-stream-url').val(),
        title:       $('#input-add-youtube-stream-title').val(),
        description: $('#input-add-youtube-stream-description').val(),
        date:        $('#input-add-youtube-stream-date').val(),
        thumbnail:   $('#input-add-youtube-stream-thumbnail').val(),
        tags:        {}
    };

    var id = $('#input-add-youtube-stream-url').val().split('youtu.be/')[1];

    var tags = $('#input-add-youtube-stream-tags').val().split(',');
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].trim();
        if (tag) {
            video.tags[tag] = null;
        }
    }

    pushStream('yt=' + id, video);
});

$('#button-push-streamable-stream').click(function() {
    var video = {
        title:       $('#input-add-streamable-stream-title').val(),
        description: $('#input-add-streamable-stream-description').val(),
        date:        $('#input-add-streamable-stream-date').val(),
        tags:        {}
    };

    var id = $('#input-add-streamable-stream-url').val().split('streamable.com/')[1];

    var tags = $('#input-add-streamable-stream-tags').val().split(',');
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].trim();
        if (tag) {
            video.tags[tag] = null;
        }
    }

    var url = 'https://api.streamable.com/videos/' + id;
    $.getJSON(url, function(data) {
        video.url       = 'https://' + data.url;
        video.thumbnail = 'https:' + data.thumbnail_url.split('?')[0] + '?height=400';

        pushStream('st=' + id, video);
    });
});

$('#button-push-facebook-stream').click(function() {
    var video = {
        url:         $('#input-add-facebook-stream-url').val(),
        title:       $('#input-add-facebook-stream-title').val(),
        description: $('#input-add-facebook-stream-description').val(),
        date:        $('#input-add-facebook-stream-date').val(),
        tags:        {}
    };

    var id = $('#input-add-facebook-stream-url').val().split('videos/')[1].split('/')[0];

    var tags = $('#input-add-facebook-stream-tags').val().split(',');
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].trim();
        if (tag) {
            video.tags[tag] = null;
        }
    }

    pushStream('fb=' + id, video);
});

$('#button-push-twitch-stream').click(function() {
    var video = {
        title:       $('#input-add-twitch-stream-title').val(),
        description: $('#input-add-twitch-stream-description').val(),
        tags:        {}
    };

    var id = $('#input-add-twitch-stream-url').val().split('videos/')[1].split('/')[0];

    var tags = $('#input-add-twitch-stream-tags').val().split(',');
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].trim();
        if (tag) {
            video.tags[tag] = null;
        }
    }

    var url = 'https://api.twitch.tv/kraken/videos/' + id;
    $.ajax({
        url: url,
        type: 'GET',
        headers: {
            'Client-ID': twitchClientID
        },
        success: function(data) {
            video.url       = data.url;
            video.thumbnail = data.preview;
            video.date      = data.recorded_at;

            pushStream('tw=' + id, video);
        },
        error: function(response) {
            console.log(response);
        }
    });
});


/* ------ END ------ */

function injectTimestamp(id) {
    $(id).val(new Date().toISOString());
}

$('#button-push-post').click(function() {
    var post = {
        title:   $('#input-add-post-title').val(),
        date:    $('#input-add-post-date').val(),
        content: $('#input-add-post-content').val(),
    };

    console.log(post);
    db.collection('posts').doc(post.date).set(post);
});

$('#button-push-poll').click(function() {
    var poll = {
        url:         $('#input-add-poll-url').val(),
        title:       $('#input-add-poll-title').val(),
        date:        $('#input-add-poll-date').val(),
        endDate:     $('#input-add-poll-end-date').val(),
        description: $('#input-add-poll-description').val()
    };

    console.log(poll);
    db.collection('polls').doc(poll.date).set(poll);
});
