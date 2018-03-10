const db = firebase.firestore();

var lastRef;
var pollsHtml = '';

window.onload = populatePolls();

function populatePolls() {
    var ref;

    if (lastRef) {
        ref = db.collection('polls')
            .orderBy('date', 'desc')
            .startAfter(lastRef)
            .limit(10);
    }
    else {
        ref = db.collection('polls')
            .orderBy('date', 'desc')
            .limit(10);
    }

    ref.get().then(function(snapshot) {
        lastRef = snapshot.docs[snapshot.docs.length-1];

        if (!lastRef) $('#more-polls-button').hide();
        else $('#more-polls-button').show();

        snapshot.forEach(function(doc) {
            var poll = doc.data();

            pollsHtml += '<div class="card">';
            pollsHtml += '<div class="card-body">';
            pollsHtml += '<h3 class="card-title">' + poll.title + '<span style="float: right"><font size="3">' + poll.date.split('T')[0] + '</font></span></h5>';
            pollsHtml += '<hr>';
            pollsHtml += '<p class="card-text">' + poll.description + '</p>'
            pollsHtml += '<p class="card-text"><b>This poll closes at ' + poll.endDate.split('T')[0] + '.</b></p>'
            pollsHtml += '<hr>';
            pollsHtml += '<a href="' + poll.url + '" target="_blank">Click here to visit the poll.</a>';
            pollsHtml += '</div>';
            pollsHtml += '</div>';
            pollsHtml += '<br>';
        });

        $('#polls').html(pollsHtml);
    });
}
