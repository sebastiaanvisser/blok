function start ()
{
  var group = window.g = new Group;

  Solver.debugging = false;
  Geom.debugging   = false;

  group.containerSolver =
    function containerSolver ()
    {
      this.containers.forEach
        (function (t)
         {
           t.allowDragging = false;
           t.allowResizing = false;
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

        adj.geom.x = ev.target.__adjust.geom.x;
        adj.geom.y = ev.target.__adjust.geom.y;
        adj.geom.r = ev.target.__adjust.geom.r;
        adj.geom.b = ev.target.__adjust.geom.b;
        adj.touch();
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

