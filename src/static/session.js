function main_session(){



var socket = io.connect('http://' + document.domain + ':' + location.port);
let sessionstatus = $( 'input.formsessionstatus' ).val()

socket.on( 'connect', function() {
  socket.emit( 'session_event', {
    data: 'New user connected'
    
  } )
  if (sessionstatus == 0) {

    socket.emit( 'session_event', {
    message : '15002_load_session'
  } )

    formsessionstatus.value = 1;
    sessionstatus = 1;
  }

  var form = $( 'form' ).on( 'submit', function( e ) {
    e.preventDefault()
    let user_name = $( 'input.username' ).val()
    let user_input = $( 'input.message' ).val()
    let sessionstatus = $( 'input.formsessionstatus' ).val()
    
    if (user_name.trim() == '') { 
      console.log('empty user field, please type your username')

  }

    else if (user_input.trim() === '')
  {
    console.log('empty message or status code, ignoring')
  }
    else if (user_name != '') {

    cookiseuserid = check_cookie_userid();
    setCookie("remname", user_name, 375);
    if (cookiseuserid == 0)
     {
    cookiseuserid = generateRandomUserId(24);
    setCookie("remuserid", cookiseuserid, 375);
     }

    socket.emit( 'session_event', {
      user_name : user_name,
      message : user_input,
      saveduserid : cookiseuserid
    } )

  }

    scrollToBottom();
    $( 'input.message' ).val( '' ).focus()
  } )
} )
socket.on( 'session_response', function( msg ) {
  if (Array.isArray(msg)) {
      messages_number = msg.length - 1;
      while (messages_number != -1){
        var datauserid = msg[messages_number][0];
        var datausername = msg[messages_number][1];
        var datatextmsg = msg[messages_number][4];
        var datatimemsg = msg[messages_number][3];

        let datatime = datatimemsg.split(":");
        let finaltimemsg = datatime[0] + ":" + datatime[1];

        messages_number -= 1;

        var cookieuserid = getCookie('remuserid');
          if (cookieuserid == datauserid) {
            
            if (datatextmsg == 'sent a nudge') {
              $('body > section > main').append('<div class="msg right-msg"> <div class="msg-img" style="background-image: url(static/img/defaultuser4.png)" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + datausername + '</div> <div class="msg-info-time">'+finaltimemsg+'</div> </div> <div class="msg-text"><div class="msg-info-nudge">' + datatextmsg + '</div></div>');


            }
            else {
              $('body > section > main').append('<div class="msg right-msg"> <div class="msg-img" style="background-image: url(static/img/defaultuser4.png)" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + datausername + '</div> <div class="msg-info-time">'+finaltimemsg+'</div> </div> <div class="msg-text">' + datatextmsg + '</div>');

            }

            
          }
          else {
            if (datatextmsg == 'sent a nudge') {
              $( 'body > section > main' ).append( '<div class="msg left-msg"> <div class="msg-img" style="background-image: url(static/img/defaultuser4.png)" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">'+datausername+'</div> <div class="msg-info-time">'+finaltimemsg+'</div> </div> <div class="msg-text"><div class="msg-info-nudge">'+datatextmsg+'</div></div>' )
            }
            else {
              $( 'body > section > main' ).append( '<div class="msg left-msg"> <div class="msg-img" style="background-image: url(static/img/defaultuser4.png)" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">'+datausername+'</div> <div class="msg-info-time">'+finaltimemsg+'</div> </div> <div class="msg-text">'+datatextmsg+'</div>' )
            }

          }

        }
  }

  var usernametext = $('#username').val();  
  var userid = getCookie('remuserid');
        
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  hours = hours.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');
  let finaltime = `${hours}:${minutes}`;



  if (userid == msg.saveduserid) {
    // show right bubble if owner's message
    if (msg.message == 'sent a nudge') {
    // show right bubble if owner's message
    $('body > section > main').append('<div class="msg right-msg"> <div class="msg-img" style="background-image: url(static/img/defaultuser4.png)" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + msg.user_name + '</div> <div class="msg-info-time">'+finaltime+'</div> </div> <div class="msg-text"><div class="msg-info-nudge">' + msg.message + '</div></div>');
    } 
    else {
    $('body > section > main').append('<div class="msg right-msg"> <div class="msg-img" style="background-image: url(static/img/defaultuser4.png)" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">' + msg.user_name + '</div> <div class="msg-info-time">'+finaltime+'</div> </div> <div class="msg-text">' + msg.message + '</div>');
  } 
  }
  // otherwise use left msg bubble for others
  else if( typeof msg.user_name !== 'undefined' ) {
    if (msg.message == 'sent a nudge') {
      $( 'body > section > main' ).append( '<div class="msg left-msg"> <div class="msg-img" style="background-image: url(static/img/defaultuser4.png)" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">'+msg.user_name+'</div> <div class="msg-info-time">'+finaltime+'</div> </div> <div class="msg-text"><div class="msg-info-nudge">'+msg.message+'</div></div>' )
      received_nudge();
      
    }
    else {
      $( 'body > section > main' ).append( '<div class="msg left-msg"> <div class="msg-img" style="background-image: url(static/img/defaultuser4.png)" ></div> <div class="msg-bubble"> <div class="msg-info"> <div class="msg-info-name">'+msg.user_name+'</div> <div class="msg-info-time">'+finaltime+'</div> </div> <div class="msg-text">'+msg.message+'</div>' )
      received_msg_sound();
    }
    }
  else {
    console.log('empty, ignore')
  }
  scrollToBottom();
})


}