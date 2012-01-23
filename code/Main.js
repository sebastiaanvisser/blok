function start ()
{
  var mode = new Mode;

  $("h1, h2, p").each
    ( function (_, el)
      {
        var a = new Adjust(el, el, mode);

        var dragSolver = Dsl.orOrigin
          ( Dsl.dragSolver
            ( function () { return [Geom.parentEl(el)]; }
            , function () { return []; }
            )
          );

        var resizeSolver = Dsl.orOrigin
          ( Dsl.resizeSolver
            ( function () { return [Geom.parentEl(el)]; }
            , function () { return []; }
            )
          );

        a.onDragAlign     = Dsl.strech(1.0, dragSolver);
        a.stopDragAlign   = Dsl.compose(Dsl.grid(24, 24), dragSolver);
        a.onResizeAlign   = Dsl.strech(1.0, resizeSolver);
        a.stopResizeAlign = Dsl.compose(Dsl.grid(24, 24), resizeSolver);
      }
    );

  $(".target").each
    ( function (_, el)
      {
        var a = new Adjust(el, el, mode);

        var dragSolver = Dsl.orOrigin
          ( Dsl.dragSolver
            ( function () { return [Geom.parentEl(el)]; }
            , function () { return Dsl.selector("h1, h2, p, .target", el.parentNode, [el]); }
            )
          );

        var resizeSolver = Dsl.orOrigin
          ( Dsl.resizeSolver
            ( function () { return [Geom.parentEl(el)]; }
            , function () { return Dsl.selector("h1, h2, p, .target", el.parentNode, [el]); }
            )
          );

        a.onDragAlign     = Dsl.margin(24, Dsl.strech(1.0, dragSolver));
        a.stopDragAlign   = Dsl.margin(24, Dsl.compose(Dsl.grid(24, 24), dragSolver));
        a.onResizeAlign   = Dsl.margin(24, Dsl.strech(1.0, resizeSolver));
        a.stopResizeAlign = Dsl.margin(24, Dsl.compose(Dsl.grid(24, 24), resizeSolver));
      }
    );
}

$(document).ready(start);

