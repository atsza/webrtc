$(function () {
    var socket = io.connect();
    var $messageForm = $('#message-form');
    var $message = $('#message');
    var $chat = $('#chat');
    var $messageArea = $('#message-area');
    var $userFormArea = $('#user-form-area');
    var $userForm = $('#user-form');
    var $users = $('#users');
    var $username = $('#username');
    
    var username = '';
    var target;
    var localStream;
    var pc;
    var remoteStream;
    var session = {};
    var localMessage;
    var offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      };

    var pcConfig = {
        'iceServers': [{
            'urls': 'stun:stun.l.google.com:19302'
        }]
    };

    // Set up audio and video
    var sdpConstraints = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    };

    var localVid = document.querySelector('#localVideo');
    var remoteVid = document.querySelector('#remoteVideo');

    $userForm.submit((e) => {
        e.preventDefault();
        username = $username.val();
        socket.emit('new user', username);
    });

    $messageForm.submit((e) => {
        e.preventDefault();
        socket.emit('send message', $message.val());
    });

    $(document).on('click', '#disconnect-btn', (event) => {
        $userFormArea.show();
        $messageArea.hide();
        $message.val('');
        socket.emit('user disconnect', username);
        username = '';
    });

    $(document).on('click', '.call-btn', (event) => {
        target = event.target.getAttribute('data-user');

        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        }).then(
                (stream) => {
                    setupStreamAndOffer(stream, () => {
                        session.fromUser = username;
                    	session.toUser = target;
	                    session.type = 'offer';
    	                console.log(session);
        	            socket.emit('message', session);
                    });
                });
    });

    //socket chat
    socket.on('new message', (data) => {
        $chat.append('<div class="well"><strong>' + data.user + '</strong>:' + data.msg + '</div>');
    });

    socket.on('message', (data) => {
        console.log(data);
        localMessage = data;    
        if (data.toUser == username) {
            if (data.type == 'offer') {
                pc = new RTCPeerConnection(null);
                // pc.onicecandidate = (event) => {
                //     if (event.candidate) {
                //         socket.emit('message', {
                //             toUser: data.fromUser,
                //             fromUser: username,
                //             type: 'candidate',
                //             label: event.candidate.sdpMLineIndex,
                //             id: event.candidate.sdpMid,
                //             candidate: event.candidate.candidate
                //         });
                //     };
                // };
                // pc.onaddstream = (event) => {
                //     remoteStream = event.stream;
                //     remoteVideo.srcObject = remoteStream;
                // };

                navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true
                }).then(
                    (stream) => {
                        setupStream(stream);
                        pc.setRemoteDescription(new RTCSessionDescription(localMessage.description));
                        pc.createAnswer().then((sessionData) => {
                            setupRTCData(sessionData);
                            session.toUser = localMessage.fromUser;
                            session.fromUser = username;
                            session.type = 'answer';
                            socket.emit('message', session);
                        });
                    }
                );
            } else if (data.type == 'answer') {
                pc.setRemoteDescription(new RTCSessionDescription(localMessage.description));
            } else if (data.type === 'candidate') {
                var candidate = new RTCIceCandidate({
                    sdpMLineIndex: data.label,
                    candidate: data.candidate
                });
                console.log(candidate);
                pc.addIceCandidate(candidate);
            } else if (data === 'bye') {
                pc.close();
                pc = null;
            }
        }
    });

    socket.on('user added', (data) => {
        if (data.user == username) {
            $userFormArea.hide();
            $messageArea.show();
            $message.val('');
        }
    });

    socket.on('invalid username', (data) => {
        if (data.user == username) {
            $('#name-alert').show();
        }
    });

    socket.on('get users', (data) => {
        var html = '';
        for (i = 0; i < data.length; i++) {

            if (true || data[i].username != username) {
                let button = '<div class="call-btn btn btn-success" data-user="' + data[i].username + '">Call user</div>';
                html += '<li class="list-group-item">' + data[i].username + button + '</li>';
            }
        }
        $users.html(html);
    });

    //functions
    function setupStream(stream) {
        localStream = stream;
        localVideo.srcObject = stream;

        pc = new RTCPeerConnection(null);
        // pc.onicecandidate = (event) => {
        //     if (event.candidate) {
        //         socket.emit('message', {
        //             toUser: target,
        //             fromUser: username,
        //             type: 'candidate',
        //             label: event.candidate.sdpMLineIndex,
        //             id: event.candidate.sdpMid,
        //             candidate: event.candidate.candidate
        //         });
        //     };
        // };
        pc.onaddstream = (event) => {
            remoteStream = event.stream;
            remoteVideo.srcObject = remoteStream;
        };

        pc.addStream(localStream);
    }

    function setupStreamAndOffer(stream, cb) {
        setupStream(stream);
        pc.createOffer(offerOptions).then((rtcData) => {
	        setupRTCData(rtcData);
    	    cb();
        });
    }

    function setupRTCData(rtcData) {
        pc.setLocalDescription(rtcData);
        session.description = rtcData;
        //console.log(session.description);
    }


});
