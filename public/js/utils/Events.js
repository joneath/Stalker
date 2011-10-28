var Events = new Class({
  Extends: Events,
  _latched: {},
  REGEX : /:(latch(ed$)?)/i,
  removeLatch: function(type){
    if(type.indexOf(':')){
      if(this.REGEX.test(type)){
        type = type.replace(this.REGEX,'');
        this._latched[type] = 1
      }
    }
    return type;
  },
  addEvent: function(type, fn, internal){
    if(this._latched[type]){
      fn(); 
      return this;
    } else {
      return this.parent(type,fn,internal);
    }
  },
  
  fireEvent: function(type){
    var type = this.removeLatch(type);
    var args = Array.prototype.slice.call(arguments,0);
    args[0] = type;
    this.parent.apply(this,args);
  }
});