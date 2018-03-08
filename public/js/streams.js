const db = firebase.firestore();

var lastRef;
var streamsHtml; // Store html for all streams loaded.

window.onload = populateStreams();

function populateStreams() {
    var ref = db.collection('streams')
        .orderBy('date', 'desc')
        .limit(30);

    ref.get().then(function(snapshot) {
        lastRef = snapshot.docs[snapshot.docs.length-1]; // Remember ref for pagination.

        streamsHtml = '';
        snapshot.forEach(function(doc) {
            var video = doc.data();
            streamsHtml += createCard(video.title, video.description, video.thumbnail, video.url); // common.js
        });
        $('#video-cards').html(streamsHtml); // Populate video grid.
    });
}
