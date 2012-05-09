function Viewport (container, targets, offset)
{
  this.container = $(container || "body");
  this.targets   = $(targets   || "body > *");
  this.offset    = $(offset    || "body");
  this.offsetY   = null;

  this.top        = [];
  this.topEdge    = [];
  this.middle     = [];
  this.center     = null;
  this.bottomEdge = [];
  this.bottom     = [];

  $(document).scroll(this.compute.scope(this));
  $(window).resize(this.compute.scope(this));

  this.compute();
}

Viewport.prototype.compute =
  function compute ()
  {
    this.top        = [];
    this.topEdge    = [];
    this.middle     = [];
    this.center     = null;
    this.bottomEdge = [];
    this.bottom     = [];
    this.offsetY    = Geom.absoluteEl(this.offset[0]).y;
    $(this.targets).each(this.compute1.scope(this));
    this.computeCenter();
  };

Viewport.prototype.compute1 =
  function compute1 (_, n)
  {
    var t =     this.container[0].scrollTop - this.offsetY;
    var b = t + this.container[0].offsetHeight;

    if (n.offsetTop + n.offsetHeight < t)
      this.top.push(n);
    else if (n.offsetTop > b)
      this.bottom.push(n);
    else
    {
      if (n.offsetTop < t)
        this.topEdge.push(n);
      if (n.offsetTop + n.offsetHeight > b)
        this.bottomEdge.push(n);
      this.middle.push(n);
    }

  };

Viewport.prototype.computeCenter =
  function computeCenter ()
  {
    var c = this.container[0].scrollTop + this.container[0].offsetHeight/2 - this.offsetY;
    function distance (e) { return Math.min( Math.abs(e.offsetTop - c) , Math.abs(e.offsetTop + e.offsetHeight - c)); }
    this.center = this.middle.sort(function (a, b) { return distance(a) - distance(b); })[0];
  };

