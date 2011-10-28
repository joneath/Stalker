var APP = {};
Object.append(APP, new Events,new Options, {
  initialize: function(options){
    this.setOptions(options);
    this.addFB();
  },
  addFB: function(){
    var self = this;
    var script = new Element('script',{
      src: "//connect.facebook.net/en_US/all.js",
      defer:"defer",
    }).inject(document.head);
    fbAsyncInit = function(){
      self.fireEvent('FB.Ready:latched');
    };
    
    this.addEvent('FB.Ready', function(){
      console.log('Facebook is ready');
    })
  }
});

APP.initialize();


