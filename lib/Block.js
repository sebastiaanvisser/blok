function Block (target)
{
  this.target            = $(target);
  this.target[0].__block = this;
  this.geom              = {};
  this.onAdjust          = [];

  // Apply custom decorations.
  for (var i = 1; i < arguments.length; i++)
    new arguments[i](this);

  this.initialize();
}

// ----------------------------------------------------------------------------

Block.prototype.initialize =
  function initialize ()
  {
    this.geom = Geom.relativeEl(this.target[0]);
  };

Block.prototype.initialGeometry =
  function initialGeometry (grid)
  {
    var g = this.target.attr("data-geom");

    if (g)
    {
      var g = g.split(/\s+/)
               .filter(function (n) { return !n.match(/^\s*$/); })
               .map(function (n) { return n * grid; });
      this.adjust({ x : g[0], y : g[1], r : g[2], b : g[3] });
    }
    else
      this.adjust(Geom.relativeEl(this.target[0]));
  };

Block.render =
  function render (target, geom)
  {
    if (target.css("position") == "absolute")
    {
      target.css("left",    geom.x           + "px");
      target.css("top",     geom.y           + "px");
      target.css("width",  (geom.r - geom.x) + "px");
      target.css("height", (geom.b - geom.y) + "px");
    }
    else
    {
      target.css("left",       geom.x           + "px");
      target.css("max-width", (geom.r - geom.x) + "px");
    }
  };

Block.prototype.render =
  function render ()
  {
    Block.render(this.target, this.geom);
    this.rendered = true;
  };

Block.prototype.adjust =
  function adjust (g)
  {
    // Allow rendering with partial geometry.

    if (g.x === undefined) g.x = this.geom.x;
    if (g.y === undefined) g.y = this.geom.y;
    if (g.r === undefined) g.r = this.geom.r;
    if (g.b === undefined) g.b = this.geom.b;

    // If there has already been a render don't render when the geometry is
    // equal to the current one.

    var updated = g.x != this.geom.x 
               || g.y != this.geom.y 
               || g.r != this.geom.r 
               || g.b != this.geom.b;

    this.geom = Util.merge(g, {});

    if (updated)
      this.onAdjust.forEach(function (hook) { hook(this); }.scope(this));

    if (!this.rendered || updated) this.render();
  };

Block.prototype.turnOffTransitions =
  function turnOffTransitions ()
  {
    this.transitions = this.target.css("-webkit-transition-property");
    this.target.css("-webkit-transition-property", "none");
  };

Block.prototype.restoreTransitions =
  function restoreTransitions ()
  {
    this.target.css("-webkit-transition-property", this.transitions);
  };

