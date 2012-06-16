function Drag (block, pivot)
{
  this.block           = block;
  this.block.drag      = this;
  this.pivot           = $(pivot || block.target);

  this.enabled         = true;
  this.moveToTop       = false;
  this.dragging        = false;

  this.dragOrigin      = {};
  this.snapshotOrigin  = {};
  this.origin          = {};

  this.onDrag          = Util.id
  this.onStop          = Util.id

  this.init();

  this.pivot.mousedown       (this.mousedown.scope(this));
  $(document.body).mouseup   (this.mouseup.scope(this));
  $(document.body).mousemove (this.mousemove.scope(this));
}

// ----------------------------------------------------------------------------

Drag.prototype.init =
  function init (e)
  {
    this.block.target.addClass("draggable");
  };

Drag.prototype.mousedown =
  function mousedown (e)
  {
    if (!this.enabled) return;
    this.startDragging(e.clientX, e.clientY);
    return false;
  };

Drag.prototype.mouseup =
  function mouseup (e)
  {
    if (!this.dragging) return
    this.stopDragging(e);
    return false;
  };

Drag.prototype.mousemove =
  function mousemove (e)
  {
    if (!this.dragging) return;
    this.drag(e.clientX, e.clientY);
    return false;
  };

// ----------------------------------------------------------------------------

Drag.prototype.touch =
  function touch ()
  {
    this.origin = Geom.relativeEl(this.block.target[0]);
    this.block.adjust(this.onStop(this.block.geom, this.origin));
  };

Drag.prototype.startDragging =
  function startDragging (x, y)
  {
    this.dragging = true;
    this.block.target.addClass("dragging");
    this.block.turnOffTransitions();

    this.dragOrigin     = { x : x, y : y };
    this.origin         = Geom.relativeEl(this.block.target[0]);
    this.snapshotOrigin = Geom.relativeEl(this.block.target[0]);

    this.drag(x, y);
  };

Drag.prototype.stopDragging =
  function stopDragging ()
  {
    this.dragging = false;
    this.block.target.removeClass("dragging");
    this.block.restoreTransitions();

    this.block.adjust(this.onStop(this.block.geom, this.origin));
  };

Drag.prototype.drag =
  function drag (x, y)
  {
    var o  = this.snapshotOrigin,
        dx = x - this.dragOrigin.x,
        dy = y - this.dragOrigin.y;

    var w = Geom.width(this.block.geom),
        h = Geom.height(this.block.geom);

    var dragTo =
      { x : o.x + dx
      , y : o.y + dy
      , r : o.x + dx + w
      , b : o.y + dy + h
      };

    this.block.adjust(this.onDrag(dragTo, this.origin));
  };
