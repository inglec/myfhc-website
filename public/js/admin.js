const uploadsID = 'UUqAnBlp5RrpzoNLXHf6XUsA'; // Truant Channel Uploads ID
const youtubeAPIKey = 'AIzaSyBX-qSUESi7msVWH8UTmzDoBMQZObY3Uwo';

const db = firebase.firestore();

function pushAllYoutubeVideos() {
    var url = 'https://www.googleapis.com/youtube/v3/playlistItems?' +
        'playlistId=' + uploadsID +
        '&key=' + youtubeAPIKey +
        '&part=snippet&maxResults=50';
    $.getJSON(url, youtubeCallback);
}

var youtubeCallback = function(data) {
    for (var i = 0; i < data.items.length; i++) {
        var info = data.items[i].snippet;
        var title = parseTitle(info.title);

        var video = {
            artist: title.artist,
            song: title.song,
            url: 'https://youtu.be/' + info.resourceId.videoId,
            thumbnail: info.thumbnails.standard.url,
            tags: {},
            date: info.publishedAt
        };

        // Auto-add tags
        if (info.title.toLowerCase().includes('live')) video.tags['Live'] = null;
        if (info.title.toLowerCase().includes('jinjer')) video.tags['Jinjer Friday'] = null;
        if (info.title.toLowerCase().includes('subscriber band')) video.tags['Subscriber Band Sunday'] = null;

        pushReaction('yt=' + info.resourceId.videoId, video); // Push video to database.
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
        song: toUpperCamelCase(song.trim())
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
        var snippet = data.items[0].snippet

        var parsedTitle = parseTitle(snippet.title);
        var video = {
            url: url,
            title: snippet.title,
            artist: parsedTitle.artist,
            song: parsedTitle.song,
            date: snippet.publishedAt,
            thumbnail: snippet.thumbnails.default.url
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
        artist: '#input-add-youtube-reaction-artist',
        song: '#input-add-youtube-reaction-song',
        date: '#input-add-youtube-reaction-date',
        thumbnail: '#input-add-youtube-reaction-thumbnail'
    }
    getYoutubeInfo(url, fields);
});

$('#button-get-youtube-stream-info').click(function() {
    var url = $('#input-add-youtube-stream-url').val();
    console.log(url);
    var fields = {
        title: '#input-add-youtube-stream-title',
        date: '#input-add-youtube-stream-date',
        thumbnail: '#input-add-youtube-stream-thumbnail'
    }
    getYoutubeInfo(url, fields);
});

$('#button-push-youtube-reaction').click(function() {
    var video = {
        artist: $('#input-add-youtube-reaction-artist').val(),
        song: $('#input-add-youtube-reaction-song').val(),
        date: $('#input-add-youtube-reaction-date').val(),
        thumbnail: $('#input-add-youtube-reaction-thumbnail').val(),
        tags: {}
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
        song: $('#input-add-streamable-reaction-song').val(),
        date: $('#input-add-streamable-reaction-date').val(),
        tags: {}
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
        video.url = 'https://' + data.url;
        video.thumbnail = 'https:' + data.thumbnail_url.split('?')[0] + '?height=400';

        pushReaction('st=' + id, video);
    });
});

$('#button-push-facebook-reaction').click(function() {
    var video = {
        url: $('#input-add-facebook-reaction-url').val(),
        artist: $('#input-add-facebook-reaction-artist').val(),
        song: $('#input-add-facebook-reaction-song').val(),
        date: $('#input-add-facebook-reaction-date').val(),
        tags: {}
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
        title: $('#input-add-youtube-stream-title').val(),
        description: $('#input-add-youtube-stream-description').val(),
        date: $('#input-add-youtube-stream-date').val(),
        thumbnail: $('#input-add-youtube-stream-thumbnail').val(),
        tags: {}
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
        title: $('#input-add-streamable-stream-title').val(),
        description: $('#input-add-streamable-stream-description').val(),
        date: $('#input-add-streamable-stream-date').val(),
        tags: {}
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
        video.url = 'https://' + data.url;
        video.thumbnail = 'https:' + data.thumbnail_url.split('?')[0] + '?height=400';

        pushStream('st=' + id, video);
    });
});

$('#button-push-facebook-stream').click(function() {
    var video = {
        url: $('#input-add-facebook-stream-url').val(),
        title: $('#input-add-facebook-stream-title').val(),
        description: $('#input-add-facebook-stream-description').val(),
        date: $('#input-add-facebook-stream-date').val(),
        tags: {}
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


/* ------ END ------ */

function signOut() {
    firebase.auth().signOut().then(function() {
        console.log('Signed Out');
    }, function(error) {
        console.error('Sign Out Error', error);
    });
}
