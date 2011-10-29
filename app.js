
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

// Routes

app.get('/', routes.index);

// Socket I/O

stalkers = {};

// Listen to client connections
io.sockets.on('connection', function (socket) {

  // Listen to position change
  socket.on('position_change', function (user) {
    
    console.log(" Received position change: " + (user.name || ":)") + " (" + user.latLng + ")");

    // If this is their first position change notify them of all other stalker positions & add them to list of stalkers
    if (!stalkers[socket.id]) {
      for (var stalker in stalkers) {
        socket.emit('position_change', stalkers[stalker] );
      }
      stalkers[socket.id] = user;
    }

    // Notify all stalkers of position change
    for (var stalker in stalkers) {
      stalker.emit('position_change', stalkers[stalker]);
    }
  });

  // List to disconnect
  io.sockets.on('disconnect', function() {
    socket.emit('remove_stalker', stalkers[socket.id] )
    // Remove from list of stalkers
    delete stalkers[socket.id];
  });

});

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
