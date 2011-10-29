var APP = {};
Object.append(APP, new Events,new Options, {
  user: {
     position:null
    ,latLng: null
  }
  ,markers: {}
  ,initialize: function(options){
    this.setOptions(options);
    this.addFB();
    this.addGoogleMaps();
    this.socketConnect();
    this.attachEvents();
    this.setupToggle();
  }
  ,setupToggle: function(){
    var self = this;
    this.toggler = $('toggle-pane');
    this.mapPane = $('app-map-wrapper');
    this.notificationPane = $('app-notifications-wrapper');
    
    this.toggler.addEvent('click', function(el){
      var clicked = this.retrieve('clicked');
      if(clicked){
        self.mapPane.show();
        self.notificationPane.hide();
      } else {
        self.mapPane.hide();
        self.notificationPane.show();
      }
      this.store('clicked', clicked?false:true);
    });
    
    
  }
  ,attachEvents: function(){
    var self = this;
    var eventCount = 0;
    this.addEvent('User.Position.Changed', function(position){
      self.socket.emit('position_change', self.user);

      console.log(self.socket.socket.sessionid);

      if (eventCount % 6 == 0){
        self.publishNotification(self.user.me + ' has moved.');
      }
      eventCount += 1;

      self.addEvent('GoogleMaps.Ready',function(){
        var latLng = self.user.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        // Make sure the map is available...
        self.addEvent('Map.Ready', function(){
          if(!self.Map) throw new Error('Map wasn\'t really ready.');
          self.Map.panTo(latLng);
          self.Map.setZoom(12);
        });
      });
    });
    
    this.socket.on('position_change', function (user) {
      // Plot stalker
      self.plotStalker(user);
    });
    
    this.socket.on('position_change', function (user) {
      // Plot stalker
      self.plotStalker(user);
    });
    
    this.addEvent('FB.Initialized', this.checkFBAuth);
    
    this.addEvent('GoogleMaps.Ready', this.getMap);

    this.addEvent('FB.LoggedIn', this.getUserLocation);

    $('fb_login').addEvent('click', this.loginFBUser.bind(this));
  }

  ,showLoginOverlay: function(){
    $('login-overlay').show();
  }

  ,hideLoginOverlay: function(){
    $('login-overlay').hide();
  }

  ,addFB: function(){
    var self = this;
    // this will add the Facebook sdk to the page.
    fbAsyncInit = function(){
      self.fbInit();
    };
    
    var script = new Element('script',{
      src: "//connect.facebook.net/en_US/all.js",
      defer: "defer"
    }).inject(document.head);

    this.addEvent('FB.Ready', function(){
      FB.init({ 
        appId: '280290902003741', 
        status: true, 
        cookie: true,
        xfbml: true,
        oauth: true
      });
      self.fireEvent('FB.Initialized:latched');
    });
  }
  
  ,fbInit: function(){
    this.fireEvent('FB.Ready:latched');
  }

  ,checkFBAuth: function(){
    var self = this;
    FB.getLoginStatus(function(response) {
      if (response.authResponse) {
        self.getFBUser();
      } else {
        // no user session available, someone you dont know
        self.showLoginOverlay();
      }
    });
  }

  ,loginFBUser: function(){
    var self = this;
    FB.login(function(response) {
      if (response.authResponse) {
        self.getFBUser();
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, {scope: 'publish_actions'});
  }

  ,getFBUser: function(){
    var self = this;
    FB.api('/me', function(response) {
      Object.append(self.user, response);
      self.fireEvent('FB.LoggedIn');
      self.hideLoginOverlay();
    });
  }

  ,publishNotification: function(message){
    var self = this;
    FB.api('/me/stalker_ed:stalk', 'post', {location: window.location.href + self.socket.socket.sessionid}, function(data){
      self.notificationPane.adopt(new Element('li',{
        text: message
      }));
    });
    
  }
  
  // Google Maps methods
  ,addGoogleMaps: function(){
    var self = this;
    googleMapsAsyncInit = function(){
      self.googleMapsInit();
    };
    // this will add the Facebook sdk to the page
    var script = new Element('script',{
      src: "//maps.googleapis.com/maps/api/js?sensor=false&callback=googleMapsAsyncInit",
      defer:"defer"
    }).inject(document.head);
    
  }
  ,googleMapsInit: function(){
    this.fireEvent('GoogleMaps.Ready:latched');
  }
  
  ,socketConnect: function(){
    var self = this;
    self.socket = io.connect(window.location.href);
  }
  ,getMap: function(){
    return this._map || this.buildMap();
  }
  ,buildMap: function(){
    console.log('Building Map');
    var self = this;
    var map = this._map = new Element('div#map');
    if(!map.retrieve('initialized'))
    this.addEvent('GoogleMaps.Ready',function(){
      var latLng = new google.maps.LatLng(37.0625,-95.677068);
      self.Map = new google.maps.Map(map,{
        zoom: 4,
        center: latLng,
        mapTypeControl: false,
        navigationControlOptions: {
          style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      console.log(self.Map);
      
      map.store('initialized', true);
      map.inject($('app-map-wrapper'));
      self.fireEvent('Map.Ready:latched', self.Map);
    });
  }
  
  // Location Methods
  ,getUserLocation: function(){
    var self = this;
    navigator.geolocation.getCurrentPosition(self.getLocationSuccess.bind(self), self.getLocationError.bind(self), {enableHighAccuracy:false});
    setInterval(function(){
      navigator.geolocation.getCurrentPosition(self.getLocationSuccess.bind(self), self.getLocationError.bind(self), {enableHighAccuracy:false});
    }, 5000);
  }
  
  ,getLocationSuccess: function(position){
    // If the current position and the new position are the same - do nothing.
    //console.log(this);
    if(this.user.position && matchesExactly(this.user.position, position)) return;
    var self = this;
    console.log(position);
    this.user.position = position;
    this.fireEvent('User.Position.Changed', self.user.position);
  }
  ,getLocationError: function(message){
    throw new Error('You Suck');
  }
  
  ,plotStalker: function(stalker){
    var self = this;
    console.log(stalker);
    var latLng = new google.maps.LatLng(stalker.position.coords.latitude, stalker.position.coords.longitude)
    this.markers[stalker.id] = this.markers[stalker.id] || new google.maps.Marker({
      map: self.Map
    });
    this.markers[stalker.id].marker.setPosition(latLng);
  }
});

APP.initialize();
