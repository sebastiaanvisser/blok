function start ()
{
  $("h1, h2, p").each
    ( function (_, el)
      {
        var a = new Adjust(el);

        var dragSolver = Dsl.orOrigin
          ( Dsl.dragSolver
            ( [ function () { return Geom.parentEl(el); }
              ]
            , []
            )
          );

        var resizeSolver = Dsl.orOrigin
          ( Dsl.resizeSolver
            ( [ function () { return Geom.parentEl(el); }
              ]
            , []
            )
          );

        a.onDragAlign     = Dsl.margin(24, Dsl.strech(0.5, dragSolver));
        a.stopDragAlign   = Dsl.margin(24, Dsl.compose(Dsl.grid(24, 24), dragSolver));
        a.onResizeAlign   = Dsl.margin(24, Dsl.strech(0.5, resizeSolver));
        a.stopResizeAlign = Dsl.margin(24, Dsl.compose(Dsl.grid(24, 24), resizeSolver));
      }
    );
}

$(document).ready(start);

