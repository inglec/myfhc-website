const uploadsID = 'UUqAnBlp5RrpzoNLXHf6XUsA'; // Truant Channel Uploads ID
const youtubeAPIKey = 'AIzaSyBX-qSUESi7msVWH8UTmzDoBMQZObY3Uwo';

const db = firebase.firestore();

function getYoutubeVideos() {
    var url = 'https://www.googleapis.com/youtube/v3/playlistItems?playlistId=' + uploadsID +
        '&key=' + youtubeAPIKey + '&part=snippet&maxResults=50';
    $.getJSON(url, youtubeCallback);
}

var youtubeCallback = function(data) {
    for (var i = 0; i < data.items.length; i++) {
        var info = data.items[i].snippet;
        var title = parseTitle(info.title);

        var video = {
            artist: title.artist,
            song: title.song,
            title: info.title,
            url: 'https://youtu.be/' + info.resourceId.videoId,
            thumbnail: info.thumbnails.high.url,
            tags: {},
            date: info.publishedAt
        };

        // Auto-add tags
        if (info.title.toLowerCase().includes('live')) video.tags['live'] = 'Live';
        if (info.title.toLowerCase().includes('jinjer')) video.tags['jinjer-friday'] = 'Jinjer Friday';
        if (info.title.toLowerCase().includes('subscriber band')) video.tags['subscriber-band-sunday'] = 'Subscriber Band Sunday';

        db.collection('reactions').doc(info.resourceId.videoId).set(video); // Push video to database.
    }

    if (data.nextPageToken) {
        var url = 'https://www.googleapis.com/youtube/v3/playlistItems?pageToken=' + data.nextPageToken +
            '&playlistId=' + uploadsID + '&key=' + serverKey + '&part=snippet&maxResults=50';

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

function addStreamableReaction(url, artist, song, date) {
    var videoID = url.split('streamable.com/')[1];

    var url = 'https://api.streamable.com/videos/' + videoID;
    $.getJSON(url, function(data) {
        var video = {
            artist: artist,
            song: song,
            url: 'https://' + data.url,
            thumbnail: 'http:' + data.thumbnail_url.split('?')[0],
            date: date
        }

        console.log(video);
        db.collection('reactions').doc(videoID).set(video);
    });
}

function signOut() {
    firebase.auth().signOut().then(function() {
        console.log('Signed Out');
    }, function(error) {
        console.error('Sign Out Error', error);
    });
}
