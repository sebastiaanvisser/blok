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
        var block = group.addTarget(div[0]);

        block.geom.x = ev.target.__block.geom.x;
        block.geom.y = ev.target.__block.geom.y;
        block.geom.r = ev.target.__block.geom.r;
        block.geom.b = ev.target.__block.geom.b;
        block.touch();
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

