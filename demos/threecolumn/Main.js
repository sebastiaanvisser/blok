function Group ()
{
  this.containers  = [];
  this.targets     = [];
  this.border      = 10;
}

Group.prototype.addContainer =
  function addContainer (t)
  {
    this.containers.push(new Block(t));
  };

Group.prototype.makeTarget =
  function makeTarget ()
  {
    var f = $("<div>");
    $("#fg").append(f);
    var t = new Block(f, Drag, Resize, Scale);
    this.targets.push(t);
  };

Group.prototype.install =
  function install ()
  {
    var containers = this.containers.map (function (block) { return block.target[0]; });
    var targets    = this.targets.map    (function (block) { return block.target[0]; });

    var that = this;

    var gap = 40;
    var w   = 260;
    var h   = 100;

    this.targets.forEach
      (function (t)
       {
         var cf = function () { return Dsl.fromList(containers, []); };
         var of = function () { return Dsl.fromList(targets, [t.target[0]]); };

         t.drag.moveToTop =
         t.resize.moveToTop = true;

         var grid          = Dsl.gridGap(w, h, gap, gap);
         var bounds        = Dsl.bounded(w, h);
         var drag          = Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of)));
         var resize        = Dsl.compose(Dsl.orOrigin(Dsl.resize(cf, of)), bounds);

         t.drag.onDrag     = Dsl.strech(0.9, Dsl.compose(grid, drag));
         t.drag.onStop     = Dsl.compose(grid, drag);
         t.resize.onResize = Dsl.strech(0.9, Dsl.compose(grid, resize));
         t.resize.onStop   = Dsl.compose(grid, resize);
       });

    this.targets.forEach(function (x) { x.drag.touch(); });
  };

function start ()
{
  window.g = new Group;

  g.addContainer($("#container"));

  for (var i = 0; i < 4; i++) g.makeTarget();

  g.targets[0].target.addClass("image").html("orange");
  g.targets[1].target.addClass("widget").html("blue");
  g.targets[2].target.addClass("text").html("black");
  g.targets[3].target.addClass("data").html("purple");

  function pos (g, x, y, r, b)
  {
    g.adjust({ x: 40 + x * (260 + 40)
             , y: 40 + y * (100 + 40)
             , r:      r * (260 + 40)
             , b:      b * (100 + 40)
             });
  }

  pos(g.targets[0], 0, 0, 2, 2)
  pos(g.targets[1], 1, 2, 3, 4)
  pos(g.targets[2], 2, 0, 3, 2)
  pos(g.targets[3], 0, 2, 1, 4)

  g.install();
}

$(document).ready(start);

