  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function check_cookie_username() {
    var form_username = document.getElementById("username");
    var user = getCookie("remname");
    if (user != null) {
        form_username.value = user;
        console.log('welcome back ' + user)
    } else {
        console.log('empty username, unable to send until set.')
        cookiseuserid = check_cookie_userid();
        if (cookiseuserid == 0) {
            cookiseuserid = generateRandomUserId(24);
            setCookie("remuserid", cookiseuserid, 375);
            console.log('generating id');
        }
    }
}

function check_cookie_userid() {
    var userid = getCookie("remuserid");
    if (userid != null) {
        return (userid)
    } else {
        console.log('id doesnt exist, unable to send until set.')
        return (0)
    }
}

function generateRandomUserId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function scrollToBottom() {
    var chatContainer = document.getElementById("msger-chat");
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function received_nudge() {
    var audio_nudge = new Audio('static/img/nudge.ogg');
    audio_nudge.volume = 0.6;
    audio_nudge.play();
    console.log("received nudge")
}

function received_msg_sound() {
    var audio_newmsg = new Audio('static/img/newmsg.ogg');
    audio_newmsg.volume = 0.2;
    audio_newmsg.play();
    console.log("received nudge")
}


function nudge_icon_event() {
    document.getElementById("nudge_icon").addEventListener("click", function() {
        var audio_nudge = new Audio('static/img/nudge.ogg');
        var userid = getCookie("remuserid");
        var usernametext = $('#username').val();
        if (userid != null && usernametext != '') {
            cookiseuserid = check_cookie_userid();
            audio_nudge.volume = 0.6;
            audio_nudge.play();
            socket.emit('session_event', {
                user_name: usernametext,
                message: 'sent a nudge',
                saveduserid: cookiseuserid
            })
        } else {
            console.log('id doesnt exist, unable to send nudge until set.')
            return (0)
        }

        console.log("sent nudge")
    });
}