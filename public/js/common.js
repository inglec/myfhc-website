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
