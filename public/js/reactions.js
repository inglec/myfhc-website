var testUrl = "https://img.youtube.com/vi/C2xcdnYgUu8/0.jpg";

var database = firebase.database();

window.onload = function() {
    console.log('hello');

    var ref = database.ref('reactions');
    ref.on('value', function(snapshot) {
        console.log(snapshot.val());
    });
}
