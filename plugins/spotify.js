var spotifysearch = require('spotify'),
    Spotify = require("spotify-web"),
    spotifyCredentials = require('../spotifyCredentials');



exports.getURI = function(search, message, broadcast) {
    spotifysearch.search({ type: 'track', query: search }, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }

        if(data != null && data.tracks != null && data.tracks[0] != null
            && data.tracks[0].href != null) {

            var logout = JSON.stringify(data.tracks[0]);
            var title = data.tracks[0].artists[0].name + " - " + data.tracks[0].name + " (" + data.tracks[0].album.released + ")";

            console.log(search + " coming right up!")
            var track = JSON.stringify({data: "song-info", song: data.tracks[0].href, user: message.user, title: title});

            if(broadcast != null) broadcast(track);
        }
    });
}

exports.launch = function(app) {
    if (spotifyCredentials.username === "USERNAME") {
        throw "Invalid Spotify credentials -- please update ./spotifyCredentials.js";
    }

    console.log('Connecting to Spotify as %s...', spotifyCredentials.username);

    Spotify.login(spotifyCredentials.username, spotifyCredentials.password, function (err, spotify) {
        console.log("Spotify connected");

        if (err) throw err;

        app.get("/audio/:uri", function (req, res) {
            spotify.get(req.params.uri, function (err, track) {
                track.play().pipe(res);
            });
        });
    });
}