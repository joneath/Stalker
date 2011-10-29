matchesExactly = function(expected, actual) {
  return JSON.stringify(expected) == JSON.stringify(actual);
};

Element.implement({
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