matchesExactly = function(expected, actual) {
  var a1, a2,
    l, i,
    key
  
  var getKeys = function(o) {
    var a = [];
    for(key in o) {
      if(o.hasOwnProperty(key)) {
        a.push(key);
      }
    }
    return a;
  }
  a1 = getKeys(actual);
  a2 = getKeys(expected);
  
  l = a1.length;
  if(l !== a2.length) {
    return false;
  }
  for(i = 0; i < l; i++) {
    key = a1[i];
    if (key != a2[i]) return false;
    if (actual[key] != expected[key]) return false;
    // expect(key).toEqual(a2[i]);
    // expect(actual[key]).toEqual(expected[key]);
  }
  
  return true;
};

Element.implement({
  hide: function(){
    isDisplayed: function(){
      return this.getStyle('display') != 'none';
    },

    isVisible: function(){
      var w = this.offsetWidth,
        h = this.offsetHeight;
      return (w == 0 && h == 0) ? false : (w > 0 && h > 0) ? true : this.style.display != 'none';
    },

    toggle: function(){
      return this[this.isDisplayed() ? 'hide' : 'show']();
    },

    hide: function(){
      var d;
      try {
        //IE fails here if the element is not in the dom
        d = this.getStyle('display');
      } catch(e){}
      if (d == 'none') return this;
      return this.store('element:_originalDisplay', d || '').setStyle('display', 'none');
    },

    show: function(display){
      if (!display && this.isDisplayed()) return this;
      display = display || this.retrieve('element:_originalDisplay') || 'block';
      return this.setStyle('display', (display == 'none') ? 'block' : display);
    },

    swapClass: function(remove, add){
      return this.removeClass(remove).addClass(add);
    }
});