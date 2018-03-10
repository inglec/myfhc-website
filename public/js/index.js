const db = firebase.firestore();

var lastRef;
var postsHtml = '';

window.onload = populatePosts();

function populatePosts() {
    var ref;

    if (lastRef) {
        ref = db.collection('posts')
            .orderBy('date', 'desc')
            .startAfter(lastRef)
            .limit(10);
    }
    else {
        ref = db.collection('posts')
            .orderBy('date', 'desc')
            .limit(10);
    }

    ref.get().then(function(snapshot) {
        lastRef = snapshot.docs[snapshot.docs.length-1];

        if (!lastRef) $('#more-posts-button').hide();
        else $('#more-posts-button').show();

        snapshot.forEach(function(doc) {
            var post = doc.data();

            postsHtml += '<div class="card">';
            postsHtml += '<div class="card-body">';
            postsHtml += '<h3 class="card-title">' + post.title + '<span style="float: right"><font size="3">' + post.date.split('T')[0] + '</font></span></h5>';
            postsHtml += '<hr>';
            postsHtml += post.content;
            postsHtml += '</div>';
            postsHtml += '</div>';
            postsHtml += '<br>';
        });

        $('#posts').html(postsHtml);
    });
}
