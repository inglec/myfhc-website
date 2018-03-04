var testUrl = 'https://img.youtube.com/vi/C2xcdnYgUu8/0.jpg';

window.onload = function() {
    // Pull reactions from database.
    var ref = firebase.database().ref('reactions');
    ref.on('value', function(snapshot) {
        $('#videos').html('');

        var videos = snapshot.val();
        for (var i in videos) {
            var html = '';
            html += '<div class="card" style="width: 18rem">';
            html += '<a href="' + videos[i].url + '"><img class="card-img-top" src="' + getThumbnailUrl(videos[i].url) + '"></a>'
            html += '<div class="card-body">';
            html += '<h5 class="card-title">' + videos[i].artist + '</h5>';
            html += '<p class="card-text">' + videos[i].song + '</p>';
            html += '</div>';
            html += '</div>';
            html += '<br>'

            $('#videos').append(html);
        }

    });
}

function getThumbnailUrl(url) {
    if (url.includes('youtu.be')) {
        return 'https://img.youtube.com/vi/' + url.split('youtu.be/')[1] + '/0.jpg';
    }
    else return 'images/streamable.png';
}
