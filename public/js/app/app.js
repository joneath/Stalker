var APP = {};
Object.append(APP, new Events,new Options, {
  initialize: function(options){
    this.setOptions(options);
    this.addFB();
    this.addGoogleMaps();
  },
  addFB: function(){
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
        appId: '166608743433101', 
        status: true, 
        cookie: true,
        xfbml: true,
        oauth: true
      });
      self.fireEvent('FB.Initialized:latched');
    });
  },
  
  fbInit: function(){
    this.fireEvent('FB.Ready:latched');
  },
  
  addGoogleMaps: function(){
    var self = this;
    googleMapsAsyncInit = function(){
      self.googleMapsInit();
    };
    // this will add the Facebook sdk to the page
    var script = new Element('script',{
      src: "//maps.googleapis.com/maps/api/js?sensor=false&callback=googleMapsAsyncInit",
      defer:"defer"
    }).inject(document.head);
    
  },
  googleMapsInit: function(){
    this.fireEvent('GoogleMaps.Ready:latched');
  }
});

APP.initialize();
