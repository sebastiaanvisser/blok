function Scale (block)
{
  this.block      = block;
  this.block.snap = this;
  this.resize     = this.block.resize;
  this.pivot      = $(block.target);

  this.enabled    = true;

  this.pivot.mouseup(this.mouseup.scope(this));
}

Scale.prototype.mouseup =
  function mouseup (e)
  {
    if (!e.metaKey) return;

    if (this.block.resize) this.resize.stopResizing();

    var g = this.block.geom;
    var d = this.resize.inResizeBorder(e.clientX, e.clientY);

    // Scale in one or maybe to two directions.
    if (d.left)   this.resize.adjust(Util.merge(g, { x : -Infinity, d : d }));
    if (d.top)    this.resize.adjust(Util.merge(g, { y : -Infinity, d : d }));
    if (d.right)  this.resize.adjust(Util.merge(g, { r :  Infinity, d : d }));
    if (d.bottom) this.resize.adjust(Util.merge(g, { b :  Infinity, d : d }));

    if (g.left || g.top || g.right || g.bottom) return;
 
    // Scale in all directions.
    this.resize.adjust(Util.merge(g, { x : -Infinity, d : { left   : true } }));
    this.resize.adjust(Util.merge(g, { y : -Infinity, d : { top    : true } }));
    this.resize.adjust(Util.merge(g, { r :  Infinity, d : { right  : true } }));
    this.resize.adjust(Util.merge(g, { b :  Infinity, d : { bottom : true } }));
  };

