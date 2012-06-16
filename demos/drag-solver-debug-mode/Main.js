function start ()
{
  Geom.debugging   = true;
  Solver.debugging = true;

  var group = window.g = new Group;
  group.targetSolver =
    function targetSolver ()
    {
      var containers = this.containers.map (function (adj) { return adj.target[0]; });
      var obstacles  = this.obstacles.map  (function (adj) { return adj.target[0]; });
      var targets    = this.targets.map    (function (adj) { return adj.target[0]; });
      this.targets.forEach
        (function (t)
         {
           var cf = function () { return Dsl.fromList(containers, null, []); };
           var of = function () { return Dsl.fromList(obstacles.concat(targets),  null, [t.target[0]]); };
           var dragger = Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of)));
           t.drag.onDrag = t.drag.onStop = dragger;
         });
    };

  $( ".container" ).each(function (_, t) { group.addContainer (t) });
  $( ".obstacle"  ).each(function (_, t) { group.addObstacle  (t) });
  $( ".target"    ).each(function (_, t) { group.addTarget    (t) });

  $(".target").click
    ( function (ev)
      {
        if (!ev.shiftKey) return;

        var div = $("<div data-geom='0 0 1 1' class=target></div>");
        $("#targets").append(div);
        var adj = group.addTarget(div[0]);

        adj.geom.x = ev.target.__block.geom.x;
        adj.geom.y = ev.target.__block.geom.y;
        adj.geom.r = ev.target.__block.geom.r;
        adj.geom.b = ev.target.__block.geom.b;
        adj.drag.touch();
      }
    );

  // Trick to allow optional debugging code to kick in.
  $(document).keypress(function (ev) { if (ev.keyCode == 32) window.debugging = true; });

}

function toggleDebugging ()
{
  Geom.debugging   = !Geom.debugging;
  Solver.debugging = !Solver.debugging;
  $("#debug").html("");
}

$(document).ready(start);

