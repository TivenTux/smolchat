
var socket = io.connect( window.location.protocol + '//' + document.domain + ':' + location.port);
let sessionstatus = $('input.formsessionstatus').val()

socket.on('connect', function() {
    socket.emit('session_event', {
        data: 'New user connected'
    })

    if (sessionstatus == 0) {
        socket.emit('session_event', {
            message: '15002_load_session'
        })
        formsessionstatus.value = 1;
        sessionstatus = 1;
    }
    // manage client created event
    var form = $('form').on('submit', function(e) {
        e.preventDefault()
        let user_name = $('input.username').val()
        let user_input_original = $('input.message').val()
        let sessionstatus = $('input.formsessionstatus').val()
        user_input = user_input_original

        if (user_name.trim() == '') {
            console.log('empty user field, please type your username')
        }
        else if (user_input.trim() === '') {
            console.log('empty message or status code, ignoring')
        }

        else if (user_name != '') {
            cookiseuserid = check_cookie_userid();
            profilepicurl = check_cookie_profilepic();
            set_cookie("remname", user_name, 375);

            if (cookiseuserid == 0) {
                cookiseuserid = generate_random_userid(24);
                set_cookie("remuserid", cookiseuserid, 375);
            }

            if (profilepicurl == 0) {
              profilepicurl = 'static/img/defaultuser4.png'
              set_cookie("remprofilepic", profilepicurl, 375);
            }
            
            //push client data to server
            socket.emit('session_event', {
                user_name: user_name,
                message: user_input,
                saveduserid: cookiseuserid,
                profilepicurl: profilepicurl
            })
        }
        scroll_to_bottom();
        $('input.message').val('').focus()
    })
})

socket.on('session_response', function(msg) {
    // load history
    if (Array.isArray(msg)) {
        messages_number = msg.length - 1;
        while (messages_number != -1) {
            var datauserid = msg[messages_number][0];
            var datausername = msg[messages_number][1];
            var datatextmsg = msg[messages_number][4];
            var datatimemsg = msg[messages_number][3];
            var dataprofilepicurl = msg[messages_number][5];

            let datatime = datatimemsg.split(":");
            let finaltimemsg = datatime[0] + ":" + datatime[1];
            const datatimemsglocal = convert_UTC_to_local(finaltimemsg);
            messages_number -= 1;
            var cookieuserid = get_cookie('remuserid');

            if (cookieuserid == datauserid) {
                if (datatextmsg == '1800028_sent_a_nudge') {
                    $('body > section > main').append('<div class="msg right-msg"> <div id="cacheuserimg" class="msg-img" style="background-image: url('+dataprofilepicurl+')" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + datausername + '</div> <div class="msg-info-time">' + datatimemsglocal + '</div> </div> <div class="msg-text"><div class="msg-info-nudge">' + 'sent a nudge' + '</div></div>');

                } else {
                    $('body > section > main').append('<div class="msg right-msg"> <div id="cacheuserimg" class="msg-img" style="background-image: url('+dataprofilepicurl+')" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + datausername + '</div> <div class="msg-info-time">' + datatimemsglocal + '</div> </div> <div class="msg-text">' + datatextmsg + '</div>');
                }
            }

            else {
                if (datatextmsg == '1800028_sent_a_nudge') {
                    $('body > section > main').append('<div class="msg left-msg"> <div id="cacheotheruserimg" class="msg-img" style="background-image: url('+dataprofilepicurl+')" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + datausername + '</div> <div class="msg-info-time">' + datatimemsglocal + '</div> </div> <div class="msg-text"><div class="msg-info-nudge">' + 'sent a nudge' + '</div></div>')
                } else {
                    $('body > section > main').append('<div class="msg left-msg"> <div id="cacheotheruserimg" class="msg-img" style="background-image: url('+dataprofilepicurl+')" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + datausername + '</div> <div class="msg-info-time">' + datatimemsglocal + '</div> </div> <div class="msg-text">' + datatextmsg + '</div>')
                }
            }
        }
        scroll_to_bottom();
    }
    
      // receiving new from event
    var usernametext = $('#username').val();
    var userid = get_cookie('remuserid');
    var dataprofilepicurl = get_cookie('remprofilepic')
    var dataotherprofilepicurl = msg.profilepicurl
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    let finaltime = `${hours}:${minutes}`;

    const local_time = convert_UTC_to_local(finaltime);

    if (userid == msg.saveduserid) {
        // use right bubble if owner's message
        if (msg.message == '1800028_sent_a_nudge') {
            $('body > section > main').append('<div class="msg right-msg"> <div id="simuserimg" class="msg-img" style="background-image: url('+dataprofilepicurl+')" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + msg.user_name + '</div> <div class="msg-info-time">' + finaltime + '</div> </div> <div class="msg-text"><div class="msg-info-nudge">' + 'sent a nudge' + '</div></div>');
        } else {
            $('body > section > main').append('<div class="msg right-msg"> <div id="simuserimg" class="msg-img" style="background-image: url('+dataprofilepicurl+')" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + msg.user_name + '</div> <div class="msg-info-time">' + finaltime + '</div> </div> <div class="msg-text">' + msg.message + '</div>');
        }
    }
    // use left bubble for others
    else if (typeof msg.user_name !== 'undefined') {
        if (msg.message == '1800028_sent_a_nudge') {
            $('body > section > main').append('<div class="msg left-msg"> <div id="simotheruserimg" class="msg-img" style="background-image: url('+dataotherprofilepicurl+')" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + msg.user_name + '</div> <div class="msg-info-time">' + finaltime + '</div> </div> <div class="msg-text"><div class="msg-info-nudge">' + 'sent a nudge' + '</div></div>')
            received_nudge();
        } else {
            $('body > section > main').append('<div class="msg left-msg"> <div id="simotheruserimg" class="msg-img" style="background-image: url('+dataotherprofilepicurl+')" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + msg.user_name + '</div> <div class="msg-info-time">' + finaltime + '</div> </div> <div class="msg-text">' + msg.message + '</div>')
            received_msg_sound();
        }
    } else {
        console.log('empty, ignore')
    }
    scroll_to_bottom();
})

function set_cookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function get_cookie(name) {
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
    var user = get_cookie("remname");
    if (user != null) {
        form_username.value = user;
        console.log('welcome back ' + user)
    } else {
        console.log('empty username, unable to send until set.')
        cookiseuserid = check_cookie_userid();
        //if no cookie generate id and cook it
        if (cookiseuserid == 0) {
            cookiseuserid = generate_random_userid(24);
            set_cookie("remuserid", cookiseuserid, 375);
            console.log('generating id');
        }
    }
}

function check_cookie_userid() {
    var userid = get_cookie("remuserid");
    if (userid != null) {
        return (userid)
    } else {
        console.log('id doesnt exist, unable to send until set.')
        return (0)
    }
}

function check_cookie_profilepic() {
    var profilepicurl = get_cookie("remprofilepic");
    if (profilepicurl != null) {
        return (profilepicurl)
    } else {
        console.log('id doesnt exist, unable to check profile pic cookie.')
        return (0)
    }
}

function generate_random_userid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function scroll_to_bottom() {
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

function insert_new_line(text, limit = 40) {
    return text.split(' ').map(word => {
        if (word.length > limit) {
            return word.match(new RegExp(`.{1,${limit}}`, 'g')).join('\n');
        }
        return word;
    }).join(' ');
}

    //check for nudge event, 30 sec cooldown
let isCooldown = false;
document.getElementById("nudge_icon").addEventListener("click", function() {
    if (isCooldown) {
        console.log("Nudge is on cooldown. Please wait.");
        return;
    }
    var audio_nudge = new Audio('static/img/nudge.ogg');
    var userid = get_cookie("remuserid");
    var usernametext = $('#username').val();
    profilepicurl = check_cookie_profilepic();
    if (profilepicurl == 0) {
          profilepicurl = 'static/img/defaultuser4.png'
          set_cookie("remprofilepic", profilepicurl, 375);
            }
    if (userid != null && usernametext != '') {
        cookiseuserid = check_cookie_userid();
        audio_nudge.volume = 0.6;
        audio_nudge.play();
        socket.emit('session_event', {
            user_name: usernametext,
            message: '1800028_sent_a_nudge',
            saveduserid: cookiseuserid,
            profilepicurl: profilepicurl
        })
        isCooldown = true;
    } else {
        console.log('id doesnt exist, unable to send nudge until set.')
        return (0)
    }

    console.log("sent nudge")

    setTimeout(function() {
        isCooldown = false;
        console.log("Nudge cooldown over, you can nudge again.");
    }, 30000);
});

function on_resize() {
    scroll_to_bottom();
}
window.addEventListener('resize', on_resize);


  document.getElementById("gear_icon").addEventListener("click", function () {

    var newprofilepicinput = prompt('Enter new profile pic URL. Will be active after sending a new message.');

      if (newprofilepicinput) {
        check_link_status(newprofilepicinput)
          .then(status => {
              if (status === 'valid') {
                  set_cookie("remprofilepic", newprofilepicinput, 375);
                  console.log('new profile pic set')
              } else if (status === 'notfound') {
                  console.log('not found error, not saving pic');
              } else if (status === 'error') {
                  console.log('error with profile pic check');
              }
            })
      }
            
    });

  function convert_UTC_to_local(utcTime) {

      const now = new Date();
      const [hours, minutes] = utcTime.split(':').map(Number);
      const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes));
      const localTimeString = utcDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
      });
      return localTimeString;
  }
  
