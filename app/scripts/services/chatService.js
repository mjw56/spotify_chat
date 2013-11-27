app.service('chatService', function ($rootScope, $location) {

    var url = ['ws://', $location.host(), ':', $location.port()].join('');
    console.log('Url: ', url)
    var ws = new WebSocket(url);

    // messages from node server
    ws.onmessage = function (event) {
        var server_response = JSON.parse(event.data);
        if (server_response != null && server_response.data != null) {
            switch (server_response.data) {
                case "user-list": // users in chat room
                    $rootScope.$broadcast('userList', server_response);
                    break;
                case "delete-user": // user left chat room
                    $rootScope.$broadcast('userLeft', server_response);
                    break;
                case 0: // user information
                    $rootScope.$broadcast('userJoined', server_response);
                    break;
                case 1: // song information
                    $rootScope.$broadcast('songRequested', server_response);
                    break;
                case 2: // chat message
                    $rootScope.$broadcast('chatMessageReceived', server_response);
                    break;
                case 3: // user info change
                    $rootScope.$broadcast('userUpdatedInfo', server_response);
                    break;
            }
        }
    };

    function send(message) {
        $rootScope.$broadcast('sending', message);
        ws.send(message);
    }

    function scrollDown() {
        var objDiv = document.getElementById("chat-log");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    return {
        send: send,
        scroll: scrollDown
    };
})