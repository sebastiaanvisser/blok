function Drag (target, pivot)
{
  this.target          = target;
  this.pivot           = pivot || target;

  this.origin          = {};
  this.geom            = {};

  this.allowDragging   = true;
  this.dragging        = false;
  this.dragOrigin      = {};

  this.allowResizing   = true;
  this.resizeMargin    = 6;
  this.resizeDir       = null;
  this.resizing        = false;
  this.resizeOrigin    = {};

  this.onDragAlign     = function (g) { return g; }
  this.stopDragAlign   = function (g) { return g; }
  this.onResizeAlign   = function (g) { return g; }
  this.stopResizeAlign = function (g) { return g; }

  $(this.pivot).mousedown    (this.mousedown.scope(this));
  $(this.pivot).mousemove    (this.hovering.scope(this));
  $(this.pivot).mouseout     (this.mouseout.scope(this));
  $(document.body).mouseup   (this.mouseup.scope(this));
  $(document.body).mousemove (this.mousemove.scope(this));
}

// ----------------------------------------------------------------------------

Drag.prototype.render =
  function render ()
  {
    this.target.style.left   = this.geom.x + "px";
    this.target.style.top    = this.geom.y + "px";
    this.target.style.width  = this.geom.w + "px";
    this.target.style.height = this.geom.h + "px";
  };

Drag.prototype.hovering =
  function hovering (e)
  {
    if (this.dragging || this.resizing) return;

    var resizeDir = this.inResizeBorder(e.clientX, e.clientY);
    this.resetResizeStyling();
    if (resizeDir.left  ) $(this.target).addClass("left");
    if (resizeDir.right ) $(this.target).addClass("right");
    if (resizeDir.top   ) $(this.target).addClass("top");
    if (resizeDir.bottom) $(this.target).addClass("bottom");
  };

Drag.prototype.mouseout =
  function mousedown (e)
  {
    if (!this.resizing) this.resetResizeStyling();
    return false;
  };

Drag.prototype.mousedown =
  function mousedown (e)
  {
    var r = this.inResizeBorder(e.clientX, e.clientY);
    var i = r.left || r.right || r.top || r.bottom;
    if ( i && this.allowResizing) this.startResizing(e.clientX, e.clientY, r);
    if (!i && this.allowDragging) this.startDragging(e.clientX, e.clientY);
    return false;
  };

Drag.prototype.mouseup =
  function mouseup (e)
  {
    if (this.dragging) this.stopDragging(e);
    if (this.resizing) this.stopResizing(e);
    return false;
  };

Drag.prototype.mousemove =
  function mousemove (e)
  {
    if (this.dragging) this.drag(e.clientX, e.clientY);
    if (this.resizing) this.resize(e.clientX, e.clientY);
    return false;
  };

// ----------------------------------------------------------------------------

Drag.prototype.turnOffTransitions =
  function turnOffTransitions ()
  {
    this.transitions = this.target.style["-webkit-transition-property"];
    this.target.style["-webkit-transition-property"] = "none";
  };

Drag.prototype.restoreTransitions =
  function restoreTransitions ()
  {
    this.target.style["-webkit-transition-property"] = this.transitions;
  };

// ----------------------------------------------------------------------------
// DRAGGING
// ----------------------------------------------------------------------------

Drag.prototype.startDragging =
  function startDragging (x, y)
  {
    $(this.target).parent().append(this.target);
    this.dragging = true;
    $(this.target).addClass("dragging");
    this.turnOffTransitions();

    this.dragOrigin = { x : x, y : y };
    this.origin =
      { x : this.target.offsetLeft
      , y : this.target.offsetTop
      , w : this.target.offsetWidth
      , h : this.target.offsetHeight
      };

    this.drag(x, y);
  };

Drag.prototype.stopDragging =
  function stopDragging ()
  {
    this.dragging = false;
    $(this.target).removeClass("dragging");
    this.restoreTransitions();

    this.geom = this.stopDragAlign(this.geom);
    this.render();
  };

Drag.prototype.drag =
  function drag (x, y)
  {
    var t  = this.target,
        dx = x - this.dragOrigin.x,
        dy = y - this.dragOrigin.y;

    this.geom =
      { x : this.origin.x + dx
      , y : this.origin.y + dy
      , w : this.origin.w
      , h : this.origin.h
      };

    this.geom = this.onDragAlign(this.geom);

    this.render();
  };

// ----------------------------------------------------------------------------
// RESIZING
// ----------------------------------------------------------------------------

Drag.prototype.inResizeBorder =
  function inResizeBorder (x, y)
  {
    var m = this.resizeMargin;
    var t = this.target;
    return { left   : -t.offsetLeft                 + x <= m
           , right  :  t.offsetLeft + t.offsetWidth - x <= m
           , top    : -t.offsetTop                  + y <= m
           , bottom :  t.offsetTop + t.offsetHeight - y <= m
           };
  };

Drag.prototype.resetResizeStyling =
  function resetResizeStyling ()
  {
    $(this.target).removeClass("top");
    $(this.target).removeClass("bottom");
    $(this.target).removeClass("left");
    $(this.target).removeClass("right");
  };

Drag.prototype.startResizing =
  function startResizing (x, y, r)
  {
    $(this.target).parent().append(this.target);
    this.resizing = true;
    $(this.target).addClass("resizing");
    this.turnOffTransitions();

    this.resizeDir = r;
    this.resizeOrigin = { x : x, y : y };
    this.origin       =
      { x : this.target.offsetLeft
      , y : this.target.offsetTop
      , w : this.target.offsetWidth
      , h : this.target.offsetHeight
      };

    this.resize(x, y);
  };

Drag.prototype.stopResizing =
  function stopResizing ()
  {
    this.resizing = false;
    $(this.target).removeClass("resizing");
    this.restoreTransitions();

    this.geom = this.stopResizeAlign(this.geom);
    this.render();
    this.resetResizeStyling();
  };

Drag.prototype.resize =
  function resize (x, y)
  {
    var r  = this.resizeDir;
    var t  = this.target;
    var dx = x - this.resizeOrigin.x;
    var dy = y - this.resizeOrigin.y;

    this.geom =
      { x : this.origin.x +                       (r.left ? Math.min(this.origin.w, dx) : 0)
      , y : this.origin.y +                       (r.top  ? Math.min(this.origin.h, dy) : 0)
      , w : Math.max(0, this.origin.w + (r.right  ? dx : 0) - (r.left ? dx : 0))
      , h : Math.max(0, this.origin.h + (r.bottom ? dy : 0) - (r.top  ? dy : 0))
      };

    this.geom = this.onResizeAlign(this.geom);
    this.render();
  };

