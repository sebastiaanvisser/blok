function Group ()
{
  this.containers = [];
  this.obstacles  = [];
  this.targets    = [];
}

Group.prototype.addContainer =
  function addContainer (t)
  {
    var adj = new Adjust(t);
    this.containers.push(adj);
    this.rebuildSolvers();
    return adj;
  };

Group.prototype.addObstacle =
  function addObstacle (t)
  {
    var adj = new Adjust(t);
    this.obstacles.push(adj);
    this.rebuildSolvers();
    return adj;
  };

Group.prototype.addTarget =
  function addTarget (t)
  {
    var adj = new Adjust(t);
    this.targets.push(adj);
    this.rebuildSolvers();
    return adj;
  };

Group.prototype.rebuildSolvers =
  function rebuildSolvers ()
  {
    var grid   = Dsl.grid(24, 24);
    var resize = Dsl.strech(0.8, Dsl.bounded(24 * 6, 24 * 4));

    this.containers.forEach
      (function (t)
       {
         t.stopDragAlign   = grid;
         t.stopResizeAlign = grid;
         t.onResizeAlign   = resize;
         t.stopResizeAlign = Dsl.compose(grid, resize);
       });

    this.obstacles.forEach
      (function (t)
       {
         t.stopDragAlign   = grid;
         t.stopResizeAlign = grid;
         t.onResizeAlign   = resize;
         t.stopResizeAlign = Dsl.compose(grid, resize);
       });

    var containers = this.containers.map (function (adj) { return adj.target[0]; });
    var obstacles  = this.obstacles.map  (function (adj) { return adj.target[0]; });
    var targets    = this.targets.map    (function (adj) { return adj.target[0]; });

    this.targets.forEach
      (function (t)
       {
         var cf = function () { return Dsl.fromList(containers, null, []); };
         var of = function () { return Dsl.fromList(obstacles.concat(targets),  null, [t.target[0]]); };

         var dragger       = Dsl.margin(24, Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of))));
         var resizer       = Dsl.margin(24, Dsl.orOrigin(Dsl.resize( cf, of)));
         var bounded       = Dsl.bounded(24 * 4, 24 * 4);
         var resize        = Dsl.compose(resizer, bounded);

         t.onDragAlign     = Dsl.strech(0.8, dragger);
         t.stopDragAlign   = Dsl.compose(grid, dragger);
         t.onResizeAlign   = Dsl.strech(0.8, resize);
         t.stopResizeAlign = Dsl.compose(grid, resize);
       });
  };

