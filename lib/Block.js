function Block (target)
{
  this.target            = $(target);
  this.target[0].__block = this;
  this.geom              = {};
  this.onRender          = [];

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
    var me = this;
    this.onRender.forEach(function (hook) { hook(me); });
  };

Block.prototype.adjust =
  function adjust (g)
  {
    // If there has already been a render don't render when the geometry is
    // equal to the current one.

    if ( this.rendered
      && g.x == this.geom.x 
      && g.y == this.geom.y 
      && g.r == this.geom.r 
      && g.b == this.geom.b
       ) return;

    // Allow rendering with partial geometry.

    if (g.x !== undefined) this.geom.x = g.x;
    if (g.y !== undefined) this.geom.y = g.y;
    if (g.r !== undefined) this.geom.r = g.r;
    if (g.b !== undefined) this.geom.b = g.b;

    this.render();
  };

Block.prototype.turnOffTransitions =
  function turnOffTransitions ()
  {
    this.transitions = this.target.css("-webkit-transition-property");
    this.target.css("-webkit-transition-property", "none");
    this.target.css("z-index", 100);
  };

Block.prototype.restoreTransitions =
  function restoreTransitions ()
  {
    this.target.css("-webkit-transition-property", this.transitions);
    this.target.css("z-index", 1);
  };

