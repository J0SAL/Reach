const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server)
const {v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
	debug: true
});

app.set('view engine', 'ejs'); //setting the view engine
app.use(express.static('public')) //using public folder


app.use('/peerjs', peerServer);
app.get('/room', (req, res) => {
	res.redirect(`/${uuidv4()}`); //generate unique id
})

app.get('/', (req, res) => {
	res.render('home');
})

app.get('/about', (req, res) => {
	res.render('about');
})



app.get('/:room', (req, res) => {
	// console.log('redirected', req.url)
	res.render('room', {roomId: req.params.room});
})


io.on('connection', socket => { 
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId); //join room
		socket.to(roomId).emit('user-connected', userId);
		// socket.broadcast.to(roomId).emit('user-connected');
		// socket.to(roomId).broadcast.emit('user-connected', userId);
		socket.on('message', (message) => {
			prefix = 'user'
			// if(userId == user_id) prefix = 'you'
			io.to(roomId).emit('createMessage',prefix, message)
		})
		socket.on('disconnect', ()=>{ 
			// called & handled by socket io
			socket.to(roomId).emit('user-disconnected', userId);	
		})
		// socket.on('btn-disconnect', ()=>{
		// 	console.log("disconnecting from server")
		// 	socket.disconnect();
		// })
	})
})

// app.listen(3030);
server.listen(process.env.PORT || 3030);
console.log("You are listening on port 3030");