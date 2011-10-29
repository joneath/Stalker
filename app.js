
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , socket = require('socket.io');

var app = module.exports = express.createServer()
  , io = socket.listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public/stylus', dest: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var stalkers = {};

// Routes

app.get('/', routes.index);

app.get('/:socket_id', function (req, res) {
  var socketId = req.params.socket_id;
  var stalker  = stalkers[socketId];

  res.render('stalker', { layout: false, stalker: stalker });  
});

// Socket I/O

// Listen to client connections
io.sockets.on('connection', function (socket) {

  // Listen to position change
  socket.on('position_change', function (user) {
    console.log(" Received position change: " + user);

    // If this is their first position change notify them of all other stalker positions & add them to list of stalkers
    if (!stalkers[socket.id]) {
      for (stalker in stalkers) {
        socket.emit('position_change', stalkers[stalker].user);
      }
      stalkers[socket.id] = { user: user, socket: socket };
    }

    // Notify all stalkers of position change
    for (stalker in stalkers) {
      stalkers[stalker].socket.emit('position_change', stalkers[stalker].user);
    }
  });

  // List to disconnect
  // socket.on('disconnect', function() {
  //   // Remove from list of stalkers after 60 seconds
  //   setTimeout(function() {
  //     delete stalkers[socket.id];
  //   }, 60000);
  // });

});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
