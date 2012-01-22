function Mode ()
{
  this.adjusting = false;
  $(document.body).keypress(this.keypress.scope(this));
}

Mode.prototype.keypress =
  function keypress (e)
  {
    if (e.keyCode == 101 && e.metaKey)
    {
      this.adjusting = !this.adjusting;
      $(document.body).toggleClass("adjusting");
    }
  };

// ----------------------------------------------------------------------------

function Adjust (target, pivot, mode)
{
  this.target          = $(target);
  this.pivot           = $(pivot || target);
  this.mode            = mode;

  this.target[0].__adjust = this;

  this.origin          = {};
  this.geom            = {};
  this.initialize();

  this.allowSelecting  = true;
  this.selected        = false;

  this.allowDragging   = true;
  this.dragging        = false;
  this.dragOrigin      = {};
  this.moveToTop       = false;
  this.onDragAlign     = Util.id
  this.stopDragAlign   = Util.id

  this.allowResizing   = true;
  this.resizeMargin    = 8;
  this.resizeDir       = null;
  this.resizing        = false;
  this.resizeOrigin    = {};
  this.onResizeAlign   = Util.id
  this.stopResizeAlign = Util.id

  this.pivot.mousedown       (this.whenAdjusting(this.mousedown.scope(this)));
  this.pivot.mousemove       (this.whenAdjusting(this.hovering.scope(this)));
  this.pivot.mouseout        (this.whenAdjusting(this.mouseout.scope(this)));
  this.pivot.click           (this.whenAdjusting(this.click.scope(this)));
  $(document.body).mouseup   (this.whenAdjusting(this.mouseup.scope(this)));
  $(document.body).mousemove (this.whenAdjusting(this.mousemove.scope(this)));
  $(document.body).click     (this.whenAdjusting(this.bodyClick.scope(this)));

  this.beforeDragging();
}

// ----------------------------------------------------------------------------

Adjust.prototype.whenAdjusting =
  function whenAdjusting (f)
  {
    return function whenAdjusting (e)
    {
      if (this.mode.adjusting)
        return f.call(this, e);
    }.scope(this);
  };

Adjust.prototype.hovering =
  function hovering (e)
  {
    if (this.dragging || this.resizing) return;
    this.beforeResizing(e.clientX, e.clientY);
  };

Adjust.prototype.mouseout =
  function mouseout (e)
  {
    if (!this.resizing) this.resetResizeStyling();
    return false;
  };

Adjust.prototype.mousedown =
  function mousedown (e)
  {
    var r = this.inResizeBorder(e.clientX, e.clientY);
    var i = r.left || r.right || r.top || r.bottom;
    if (this.moveToTop) this.target.parent().append(this.target);
    if ( i && this.allowResizing) this.startResizing(e.clientX, e.clientY, r);
    if (!i && this.allowDragging) this.startDragging(e.clientX, e.clientY);
    return false;
  };

Adjust.prototype.click =
  function click (e)
  {
    if (this.allowSelecting) this.startSelecting();
  };

Adjust.prototype.bodyClick =
  function bodyClick (e)
  {
    if (e.target == this.target[0]) return;
    if (this.allowSelecting) this.stopSelecting();
  };

Adjust.prototype.mouseup =
  function mouseup (e)
  {
    if (this.dragging) this.stopDragging(e);
    if (this.resizing) this.stopResizing(e);
    return false;
  };

Adjust.prototype.mousemove =
  function mousemove (e)
  {
    if (this.dragging) this.drag(e.clientX, e.clientY);
    if (this.resizing) this.resize(e.clientX, e.clientY);
    return false;
  };

// ----------------------------------------------------------------------------

Adjust.prototype.initialize =
  function initialize ()
  {
    var g = this.target.attr("data-geom");

    if (g)
    {
      var g = g.split(/\s+/)
               .filter(function (n) { return !n.match(/^\s*$/); })
               .map(function (n) { return n * 24; });
      this.geom = { x : g[0], y : g[1], r : g[2], b : g[3] };
      this.render();
    }
    else
      this.geom = Geom.relativeEl(this.target[0]);
  };

Adjust.prototype.render =
  function render ()
  {
    if (this.target.css("position") == "absolute")
    {
      this.target.css("left",    this.geom.x                + "px");
      this.target.css("top",     this.geom.y                + "px");
      this.target.css("width",  (this.geom.r - this.geom.x) + "px");
      this.target.css("height", (this.geom.b - this.geom.y) + "px");
    }
    else
    {
      this.target.css("left",       this.geom.x                + "px");
      this.target.css("max-width", (this.geom.r - this.geom.x) + "px");
    }
  };

Adjust.prototype.turnOffTransitions =
  function turnOffTransitions ()
  {
    this.transitions = this.target.css("-webkit-transition-property");
    this.target.css("-webkit-transition-property", "none");
  };

Adjust.prototype.restoreTransitions =
  function restoreTransitions ()
  {
    this.target.css("-webkit-transition-property", this.transitions);
  };

// ----------------------------------------------------------------------------
// SELECTING
// ----------------------------------------------------------------------------

Adjust.prototype.startSelecting =
  function startSelecting ()
  {
    this.selected = true;
    this.target.addClass("selected");
  };

Adjust.prototype.stopSelecting =
  function stopSelecting ()
  {
    this.selected = false;
    this.target.removeClass("selected");
  };

// ----------------------------------------------------------------------------
// DRAGGING
// ----------------------------------------------------------------------------

Adjust.prototype.beforeDragging =
  function beforeDragging ()
  {
    if (!this.allowDragging) return;
    this.target.addClass("draggable");
  };

Adjust.prototype.startDragging =
  function startDragging (x, y)
  {
    this.dragging = true;
    this.target.addClass("dragging");
    this.turnOffTransitions();
    this.dragOrigin = { x : x, y : y };
    this.origin = Geom.relativeEl(this.target[0]);
    this.drag(x, y);
  };

Adjust.prototype.stopDragging =
  function stopDragging ()
  {
    this.dragging = false;
    this.target.removeClass("dragging");
    this.restoreTransitions();
    this.geom = this.stopDragAlign(this.geom, this.origin);
    this.render();
  };

Adjust.prototype.drag =
  function drag (x, y)
  {
    var t  = this.target,
        o  = this.origin,
        dx = x - this.dragOrigin.x,
        dy = y - this.dragOrigin.y;

    var g =
      { x : o.x + dx
      , y : o.y + dy
      , r : o.r + dx
      , b : o.b + dy
      };

    this.geom = this.onDragAlign(g, o);
    this.render();
  };

Adjust.prototype.touch =
  function touch ()
  {
    this.origin = Geom.relativeEl(this.target[0]);
    this.geom = this.stopDragAlign(this.geom, this.origin);
    this.render();
  };

// ----------------------------------------------------------------------------
// RESIZING
// ----------------------------------------------------------------------------

Adjust.prototype.inResizeBorder =
  function inResizeBorder (x, y)
  {
    var m = this.resizeMargin;
    var e = Geom.absoluteEl(this.target[0]);
    return { left   : Math.abs(e.x - x) <= m
           , right  : Math.abs(e.r - x) <= m
           , top    : Math.abs(e.y - y) <= m
           , bottom : Math.abs(e.b - y) <= m
           };
  };

Adjust.prototype.resetResizeStyling =
  function resetResizeStyling ()
  {
    this.target.removeClass("resizable-top");
    this.target.removeClass("resizable-bottom");
    this.target.removeClass("resizable-left");
    this.target.removeClass("resizable-right");
  };

Adjust.prototype.beforeResizing =
  function beforeResizing (x, y)
  {
    var resizeDir = this.inResizeBorder(x, y);
    this.resetResizeStyling();
    if (resizeDir.left  ) this.target.addClass("resizable-left");
    if (resizeDir.right ) this.target.addClass("resizable-right");
    if (resizeDir.top   ) this.target.addClass("resizable-top");
    if (resizeDir.bottom) this.target.addClass("resizable-bottom");
  };

Adjust.prototype.startResizing =
  function startResizing (x, y, r)
  {
    this.resizing = true;
    this.target.addClass("resizing");
    this.turnOffTransitions();
    this.resizeDir = r;
    this.resizeOrigin = { x : x, y : y };
    this.origin = Geom.relativeEl(this.target[0]);
    this.resize(x, y);
  };

Adjust.prototype.stopResizing =
  function stopResizing ()
  {
    this.resizing = false;
    this.resetResizeStyling();
    this.target.removeClass("resizing");
    this.restoreTransitions();
    this.geom = this.stopResizeAlign(this.geom, this.origin);
    this.render();
  };

Adjust.prototype.resize =
  function resize (x, y)
  {
    var d  = this.resizeDir;
    var t  = this.target;
    var dx = x - this.resizeOrigin.x;
    var dy = y - this.resizeOrigin.y;

    var g =
      { x : this.origin.x + (d.left   ? dx : 0)
      , y : this.origin.y + (d.top    ? dy : 0)
      , r : this.origin.r + (d.right  ? dx : 0)
      , b : this.origin.b + (d.bottom ? dy : 0)
      , d : d
      };

    this.geom = this.onResizeAlign(g, this.geom);
    this.render();
  };

