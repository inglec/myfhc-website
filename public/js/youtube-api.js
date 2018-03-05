var uploadsID = 'UUqAnBlp5RrpzoNLXHf6XUsA';

var serverKey = 'AIzaSyBX-qSUESi7msVWH8UTmzDoBMQZObY3Uwo';
var browserKey = 'AIzaSyAPc7s-7oNUzx42LRSYV9HxgLIv4qp_kIA';

function getChannelVideos() {
    var url = 'https://www.googleapis.com/youtube/v3/playlistItems?playlistId=' + uploadsID + '&key=' + serverKey + '&part=snippet&maxResults=50';

    $.getJSON(url, callback);
}

var callback = function(data) {
    for (var i = 0; i < data.items.length; i++) {
        var info = data.items[i].snippet;
        var title = parseTitle(info.title);

        var id = info.resourceId.videoId;
        var video = {
            artist: title.artist,
            song: title.song,
            title: info.title,
            url: 'https://youtu.be/' + id,
            thumbnail: info.thumbnails.high.url,
            tags: {}
        };

        if (info.title.toLowerCase().includes('live')) {
            video.tags['live'] = 'Live';
        }
        if (info.title.toLowerCase().includes('jinjer')) {
            video.tags['jinjer-friday'] = 'Jinjer Friday';
        }
        if (info.title.toLowerCase().includes('subscriber band')) {
            video.tags['subscriber-band-sunday'] = 'Subscriber Band Sunday';
        }

        firebase.database().ref('reactions/' + id).set(video);
    }

    if (data.nextPageToken) {
        var url = 'https://www.googleapis.com/youtube/v3/playlistItems?pageToken=' + data.nextPageToken + '&playlistId=' + uploadsID + '&key=' + serverKey + '&part=snippet&maxResults=50';

        console.log(data.nextPageToken);
        $.getJSON(url, callback);
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
    song = split[0];

    return {artist: toUpperCamelCase(artist.trim()), song: toUpperCamelCase(song.trim())};
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
