function Group ()
{
  this.containers = [];
  this.obstacles  = [];
  this.targets    = [];
}

Group.prototype.addContainer =
  function addContainer (t)
  {
    var block = new Block(t);
    new Drag(block);
    new Resize(block);
    block.initialGeometry(24);
    this.containers.push(block);
    this.rebuildSolvers();
    return block;
  };

Group.prototype.addObstacle =
  function addObstacle (t)
  {
    var block = new Block(t);
    new Drag(block);
    new Resize(block);
    block.initialGeometry(24);
    this.obstacles.push(block);
    this.rebuildSolvers();
    return block;
  };

Group.prototype.addTarget =
  function addTarget (t)
  {
    var block = new Block(t);
    new Drag(block);
    new Resize(block);
    block.initialGeometry(24);
    this.targets.push(block);
    this.rebuildSolvers();
    return block;
  };

Group.prototype.rebuildSolvers =
  function rebuildSolvers ()
  {
    this.containerSolver();
    this.obstacleSolver();
    this.targetSolver();
  };

Group.prototype.containerSolver =
  function containerSolver ()
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
  };

Group.prototype.obstacleSolver =
  function obstacleSolver ()
  {
    var grid   = Dsl.grid(24, 24);
    var resize = Dsl.strech(0.8, Dsl.bounded(24 * 6, 24 * 4));

    this.obstacles.forEach
      (function (t)
       {
         t.stopDragAlign   = grid;
         t.stopResizeAlign = grid;
         t.onResizeAlign   = resize;
         t.stopResizeAlign = Dsl.compose(grid, resize);
       });
  };

Group.prototype.targetSolver =
  function targetSolver ()
  {
    var grid       = Dsl.grid(24, 24);
    var resize     = Dsl.strech(0.8, Dsl.bounded(24 * 6, 24 * 4));
    var containers = this.containers.map (function (block) { return block.target[0]; });
    var obstacles  = this.obstacles.map  (function (block) { return block.target[0]; });
    var targets    = this.targets.map    (function (block) { return block.target[0]; });

    this.targets.forEach
      (function (t)
       {
         var cf = function () { return Dsl.fromList(containers, null, []); };
         var of = function () { return Dsl.fromList(obstacles.concat(targets),  null, [t.target[0]]); };

         var dragger       = Dsl.margin(Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of))), 24);
         var resizer       = Dsl.margin(Dsl.orOrigin(Dsl.resize( cf, of)), 24);
         var bounded       = Dsl.bounded(24 * 4, 24 * 4);
         var resize        = Dsl.compose(resizer, bounded);

         t.drag.onDrag     = Dsl.strech(0.8, dragger);
         t.drag.onStop     = Dsl.compose(grid, dragger);
         t.resize.onResize = Dsl.strech(0.8, resize);
         t.resize.onStop   = Dsl.compose(grid, resize);
       });
  };

