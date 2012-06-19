function Resize (block, pivot)
{
  this.block           = block;
  this.block.resize    = this;
  this.pivot           = $(pivot || block.target);

  this.enabled         = true;
  this.moveToTop       = false;

  this.resizing        = false;
  this.margin          = 8;
  this.direction       = null;
  this.resizeOrigin    = {};
  this.origin          = {};

  this.onResize        = Util.id
  this.onStop          = Util.id

  this.pivot.mousedown       (this.mousedown.scope(this));
  this.pivot.mousemove       (this.hovering.scope(this));
  this.pivot.mouseout        (this.mouseout.scope(this));
  $(document.body).mouseup   (this.mouseup.scope(this));
  $(document.body).mousemove (this.mousemove.scope(this));
}

// ----------------------------------------------------------------------------

Resize.prototype.hovering =
  function hovering (e)
  {
    if (this.resizing) return;
    this.beforeResizing(e.clientX, e.clientY);
  };

Resize.prototype.mouseout =
  function mouseout (e)
  {
    if (this.resizing) return;
    this.resetResizeStyling();
  };

Resize.prototype.mousedown =
  function mousedown (e)
  {
    var r = this.inResizeBorder(e.clientX, e.clientY);
    var inBorder = r.left || r.right || r.top || r.bottom;

    if (inBorder && this.enabled)
    {
      this.startResizing(e.clientX, e.clientY, r);
      if (this.block.drag) this.block.drag.stopDragging();
    }
  };

Resize.prototype.mouseup =
  function mouseup (e)
  {
    if (!this.resizing) return;
    this.stopResizing(e);
  };

Resize.prototype.mousemove =
  function mousemove (e)
  {
    if (!this.resizing) return;
    this.resize(e.clientX, e.clientY);
  };

// ----------------------------------------------------------------------------

Resize.prototype.inResizeBorder =
  function inResizeBorder (x, y)
  {
    var m = this.margin;
    var e = Geom.absoluteEl(this.block.target[0], undefined, true);
    return { left   : Math.abs(e.x - x) <= m
           , right  : Math.abs(e.r - x) <= m
           , top    : Math.abs(e.y - y) <= m
           , bottom : Math.abs(e.b - y) <= m
           };
  };

Resize.prototype.resetResizeStyling =
  function resetResizeStyling ()
  {
    var target = this.block.target;
    target.removeClass("resizable-top");
    target.removeClass("resizable-bottom");
    target.removeClass("resizable-left");
    target.removeClass("resizable-right");
  };

Resize.prototype.beforeResizing =
  function beforeResizing (x, y)
  {
    if (!this.enabled) return;

    var dir    = this.inResizeBorder(x, y);
    var target = this.block.target;

    this.resetResizeStyling();
    if (dir.left  ) target.addClass("resizable-left");
    if (dir.right ) target.addClass("resizable-right");
    if (dir.top   ) target.addClass("resizable-top");
    if (dir.bottom) target.addClass("resizable-bottom");
  };

// ----------------------------------------------------------------------------

Resize.prototype.startResizing =
  function startResizing (x, y, r)
  {
    this.resizing = true;
    this.block.target.addClass("resizing");
    this.block.turnOffTransitions();
    if (this.moveToTop) this.block.target.parent().append(this.block.target);
    this.direction = r;
    this.resizeOrigin = { x : x, y : y };
    this.origin = Geom.relativeEl(this.block.target[0]);
    this.resize(x, y);
  };

Resize.prototype.stopResizing =
  function stopResizing ()
  {
    this.resizing = false;
    this.resetResizeStyling();
    this.block.target.removeClass("resizing");
    this.block.restoreTransitions();

    this.block.geom.d = this.direction;
    this.block.adjust(this.onStop(this.block.geom, this.origin));
  };

Resize.prototype.resize =
  function resize (x, y)
  {
    var d  = this.direction;
    var o  = this.origin;
    var t  = this.block.target;
    var dx = x - this.resizeOrigin.x;
    var dy = y - this.resizeOrigin.y;

    var resizeTo =
      { x : o.x + (d.left   ? dx : 0)
      , y : o.y + (d.top    ? dy : 0)
      , r : o.r + (d.right  ? dx : 0)
      , b : o.b + (d.bottom ? dy : 0)
      , d : d
      };

    this.block.adjust(this.onResize(resizeTo, this.block.geom));
  };

