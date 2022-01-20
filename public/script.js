const socket = io('/');

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')

myVideo.muted = true
const peers = {} //to contain the users

var peer = new Peer(undefined, {
	path: '/peerjs',
	host:'/',
	port: '443'
}); 

// port: 3030
let myVideoStream
// let UuserId

// --promise start
navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true
}).then(stream => {
	myVideoStream = stream
	addVideoStream(myVideo, stream);

	peer.on('call', call => {
		// console.log("hey")
		call.answer(stream)
		const video = document.createElement('video')
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream) // - my screen to user connected
		})

    call.on("close", () => { //from github
	        video.remove();
	    })
	    peers[call.peer] = call;//from github
	})
	socket.on('user-connected', (userId)=>{
		setTimeout(() => { //-- from github
			connectToNewUser(userId, stream)
		}, 1000) //-- 
	})

	socket.on('createMessage', (prefix, message)=>{
	  	// console.log('server: ', message)
		$('ul').append(`<li class="message"><b>${prefix}</b><br/>${message}</li>`);
		scrollToBottom();
	})
	
})
// promise end

socket.on('user-disconnected', userId =>{
	console.log("user-disconnected: ",userId);
	if(peers[userId]) peers[userId].close()	
})

peer.on('open', id=>{ //peer created unique id for each user
	// console.log("Your Id ",id)
	// UuserId = id;
	socket.emit('join-room', ROOM_ID, id);
	// console.log(peers)
});

const connectToNewUser= (userId, stream) =>{
	console.log("New User: ", userId)

	const call = peer.call(userId, stream) // make a call to userId and send him my stream
	const video = document.createElement('video')
	call.on('stream', userVideoStream => { //when i receive video stream from userId
		addVideoStream(video, userVideoStream) // user's screen to me
	})

	call.on('close', ()=>{
		video.remove();
	})

	peers[userId] = call
}

const addVideoStream =(video, stream) => {
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', ()=>{
		video.play()
	})
	videoGrid.append(video);
}






// scroll in msg section
const scrollToBottom = () => {
  	var d = $('.msg-view');
  	d.scrollTop(d.prop("scrollHeight"));
}

// --msg function
// input value
	let text = $("input");

	// when press 'enter' send message
	$('html').keydown(function (e) {
		// 13 ~ Enter key
		if (e.which == 13 && text.val().length !== 0) {
		   	// console.log(text.val());
		    socket.emit('message', text.val());
		    text.val('')
		}
	});

	
// msg function end

// --for audio
const muteUnmute = () => {
	// console.log("myVideoStream: ", myVideoStream);
  	const enabled = myVideoStream.getAudioTracks()[0].enabled;
  	if (enabled) {
   		myVideoStream.getAudioTracks()[0].enabled = false;
    	setUnmuteButton();
  	} else {
    	setMuteButton();
    	myVideoStream.getAudioTracks()[0].enabled = true;
  	}
}

const setMuteButton = () => {
  	const html = `<i class="fas fa-microphone"></i><span>Mute</span>`
  	document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  	const html = `<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>`
  	document.querySelector('.main__mute_button').innerHTML = html;
}
// --for audio end

// --for video
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setStopVideo = () => {
  	const html = `<i class="fas fa-video"></i><span>Stop Video</span>`
  	document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  	const html = `<i class="stop fas fa-video-slash"></i><span>Play Video</span>`
  	document.querySelector('.main__video_button').innerHTML = html;
}
// --for video end

// end call start

const leaveRoom = () => {
		// console.log("end call button clicked")
		// socket.emit('btn-disconnect');
}

// end call end

// --copy link btn start
const copyRoomId = () => {
	let copyText = ROOM_ID;
	navigator.clipboard.writeText(copyText);
  alert("Copied room Id: " + copyText);
}
// copy link btn end

