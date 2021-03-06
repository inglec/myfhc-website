function createCard(title, content, image, link) {
    if (!image) {
        if (link.includes('facebook'))
            image = 'images/facebook.png';
        else console.log('Thumbnail error for ' + link);
    }

    var html = '';
    html += '<div class="col mb-3" align="center">';
    html += '<div class="card video-card">';
    html += '<a href="' + link + '" target="_blank"><img class="card-img-top" src="' + image + '"></a>'
    html += '<div class="card-body">';
    html += '<h5 class="card-title">' + title + '</h5>';
    html += '<p class="card-text">' + content + '</p>';
    html += '</div>';
    html += '</div>';
    html += '</div>'
    return html;
}

function getOptions(object) {
    object = Object.keys(object).sort();

    var html = '';
    for (var i = 0; i < object.length; i++) {
        html += '<option>' + object[i] + '</option>';
    }
    return html;
}
