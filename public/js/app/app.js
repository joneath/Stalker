var APP = {};
Object.append(APP, new Events,new Options, {
  user: {
     position:null
    ,latLng: null
  }
  ,initialize: function(options){
    this.setOptions(options);
    this.addFB();
    this.addGoogleMaps();
    this.attachEvents();
    this.getUserLocation();
  }
  ,attachEvents: function(){
    var self = this;
    this.addEvent('User.Position.Changed', function(position){

      self.addEvent('GoogleMaps.Ready',function(){
        var latLng = self.user.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        // Make sure the map is available...
        self.addEvent('Map.Ready', function(){
          if(!self.Map) throw new Error('Map wasn\'t really ready.');
          self.Map.panTo(latLng);
          
          var marker = new google.maps.Marker({
            position: latLng, 
            map: self.Map, 
            title:"You are here!"
          });
        });
      });
    });

    this.addEvent('FB.Initialized', this.checkFBAuth);
    
    this.addEvent('GoogleMaps.Ready', this.getMap);
  }
  ,addFB: function(){
    var self = this;
    // this will add the Facebook sdk to the page.
    fbAsyncInit = function(){
      self.fbInit();
    };
    this.socketConnect();
    var script = new Element('script',{
      src: "//connect.facebook.net/en_US/all.js",
      defer: "defer"
    }).inject(document.head);

    this.addEvent('FB.Ready', function(){
      FB.init({ 
        appId: '166608743433101', 
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
        self.fireEvent('FB.LoggedIn');
      } else {
        // no user session available, someone you dont know
        self.showLoginOverlay();
      }
    });
  }

  ,showLoginOverlay: function(){
    $('login_overlay').show();
  }

  ,loginFBUser: function(){
    FB.login(function(response) {
      if (response.authResponse) {
        self.fireEvent('FB.LoggedIn');
        self.getFBUser();
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, {scope: 'publish_actions'});
  }

  ,getFBUser: function(){
    FB.api('/me', function(response) {
      self.fireEvent('FB.User.Recieved', response);
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
    self.socket = io.connect('http://localhost');
    self.socket.on('news', function (data) {
      console.log(data);
      self.socket.emit('my other event', { my: 'data' });
    });
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
        zoom: 16,
        center: latLng,
        mapTypeControl: false,
        navigationControlOptions: {
          style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      console.log(self.Map);
      
      map.store('initialized', true);
      map.inject($('app-content'));
      self.fireEvent('Map.Ready:latched', self.Map);
    })
  }
  
  // Location Methods
  ,getUserLocation: function(){
    var self = this;
    navigator.geolocation.getCurrentPosition(self.getLocationSuccess.bind(self), self.getLocationError.bind(self));
    setInterval(function(){
      navigator.geolocation.getCurrentPosition(self.getLocationSuccess.bind(self), self.getLocationError.bind(self));
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
});

APP.initialize();
