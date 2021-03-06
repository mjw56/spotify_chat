app.service('videoChatService', function($location) {

    var channel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
    var sender = Math.round(Math.random() * 999999999) + 999999999;

    var url = ['http://', $location.host(), ':', $location.port()].join('');
    io.connect(url).emit('new-channel', {
        channel: channel,
        sender: sender
    });

    var socket = io.connect(url+ channel);
    socket.on('connect', function () {
        // setup peer connection & pass socket object over the constructor!
    });

    socket.send = function (message) {
        socket.emit('message', {
            sender: sender,
            data: message
        });
    };

    // var peer = new PeerConnection('http://socketio-signaling.jit.su:80');
    var peer = new PeerConnection(socket);
    peer.onUserFound = function(userid) {
        if (document.getElementById(userid)) return;
        var tr = document.createElement('tr');

        var td1 = document.createElement('td');
        var td2 = document.createElement('td');

        td1.innerHTML = userid + ' has camera. Are you interested in video chat?';

        var button = document.createElement('button');
        button.innerHTML = 'Join';
        button.id = userid;
        button.style.float = 'right';
        button.onclick = function() {
            button = this;
            getUserMedia(function(stream) {
                peer.addStream(stream);
                peer.sendParticipationRequest(button.id);
            });
            button.disabled = true;
        };
        td2.appendChild(button);

        tr.appendChild(td1);
        tr.appendChild(td2);
        roomsList.appendChild(tr);
    };

    peer.onStreamAdded = function(e) {
        var video = e.mediaElement;
        video.setAttribute('width', 600);
        videosContainer.insertBefore(video, videosContainer.firstChild);

        video.play();
        rotateVideo(video);
        scaleVideos();
    };

    peer.onStreamEnded = function(e) {
        var video = e.mediaElement;
        if (video) {
            video.style.opacity = 0;
            rotateVideo(video);
            setTimeout(function() {
                video.parentNode.removeChild(video);
                scaleVideos();
            }, 1000);
        }
    };

    function connect(id) {
        peer.userid = id;
        this.disabled = true;
        getUserMedia(function(stream) {
            peer.addStream(stream);
            peer.startBroadcasting();
        });
    }

    var videosContainer = document.getElementById('videos-container');
    var btnSetupNewRoom = document.getElementById('setup-new-room');
    var roomsList = document.getElementById('rooms-list');

    //if (btnSetupNewRoom) btnSetupNewRoom.onclick = setupNewRoomButtonClickHandler;

    function rotateVideo(video) {
        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
        setTimeout(function() {
            video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
        }, 1000);
    }

    function scaleVideos() {
        var videos = document.querySelectorAll('video'),
            length = videos.length, video;

        var minus = 130;
        var windowHeight = 700;
        var windowWidth = 600;
        var windowAspectRatio = windowWidth / windowHeight;
        var videoAspectRatio = 4 / 3;
        var blockAspectRatio;
        var tempVideoWidth = 0;
        var maxVideoWidth = 0;

        for (var i = length; i > 0; i--) {
            blockAspectRatio = i * videoAspectRatio / Math.ceil(length / i);
            if (blockAspectRatio <= windowAspectRatio) {
                tempVideoWidth = videoAspectRatio * windowHeight / Math.ceil(length / i);
            } else {
                tempVideoWidth = windowWidth / i;
            }
            if (tempVideoWidth > maxVideoWidth)
                maxVideoWidth = tempVideoWidth;
        }
        for (var i = 0; i < length; i++) {
            video = videos[i];
            if (video)
                video.width = maxVideoWidth - minus;
        }
    }

    window.onresize = scaleVideos;

    // you need to capture getUserMedia yourself!
    function getUserMedia(callback) {
        var hints = {audio:true,video:{
            optional: [],
            mandatory: {
                minWidth: 1280,
                minHeight: 720,
                maxWidth: 1920,
                maxHeight: 1080,
                minAspectRatio: 1.77
            }
        }};
        navigator.getUserMedia(hints,function(stream) {
            var video = document.createElement('video');
            video.src = URL.createObjectURL(stream);
            video.controls = true;
            video.muted = true;

            peer.onStreamAdded({
                mediaElement: video,
                userid: 'self',
                stream: stream
            });

            callback(stream);
        });
    }

    (function() {
        var uniqueToken = document.getElementById('unique-token');
        if (uniqueToken)
            if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
            else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
    })();

    function showVideoChat() {
        var chatDiv = document.getElementById("chat");
        var chatWindow = chatDiv.getElementsByClassName("messages");
        var input = chatDiv.getElementsByClassName("chat-input");

        chatWindow[0].style.height = "54%";
        chatWindow[0].style.maxHeight = "56%";
        input[0].style.position = "relative";
    }

    function hideVideoChat() {
        var chatDiv = document.getElementById("chat");
        var chatWindow = chatDiv.getElementsByClassName("messages");
        var input = chatDiv.getElementsByClassName("chat-input");

        chatWindow[0].style.height = "90%";
        chatWindow[0].style.maxHeight = "91%";
        input[0].style.position = "absolute";
    }

    return {
        connect: connect,
        show: showVideoChat,
        hide: hideVideoChat
    }
});