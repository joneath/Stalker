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
      //http://www.google.com/maps?q=san+francisco&hl=en&sll=37.0625,-95.677068&sspn=30.048013,52.558594&vpsrc=0&hnear=San+Francisco,+California&t=v&z=11
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
      map.inject($('app-content'));
      self.fireEvent('Map.Ready:latched', self.Map);
    })
  }
  
  // Location Methods
  ,getUserLocation: function(){
    navigator.geolocation.getCurrentPosition(this.getLocationSuccess.bind(this), this.getLocationError.bind(this));
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
    throw new Error('You Suck')
  }
});

APP.initialize();
