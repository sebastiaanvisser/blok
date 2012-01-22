function start ()
{
  var c0 = new Adjust($("#c0")[0]);
  var t0 = new Adjust($("#t0")[0]);
  var o0 = new Adjust($("#o0")[0]);
  var o1 = new Adjust($("#o1")[0]);

  var dragSolver = Dsl.orOrigin
    ( Dsl.dragSolver
      ( [ function () { return Geom.parentEl(t0.target[0]); }
        ]
      , [ function () { return Geom.relativeEl(o0.target[0]); }
        , function () { return Geom.relativeEl(o1.target[0]); }
        ]
      )
    );

  var resizeSolver = Dsl.orOrigin
    ( Dsl.resizeSolver
      ( [ function () { return Geom.parentEl(t0.target[0]); }
        ]
      , [ function () { return Geom.relativeEl(o0.target[0]); }
        , function () { return Geom.relativeEl(o1.target[0]); }
        ]
      )
    );

  t0.onDragAlign     = Dsl.margin(24, Dsl.strech(0.5, dragSolver));
  t0.stopDragAlign   = Dsl.margin(24, Dsl.compose(Dsl.grid(24, 24), dragSolver));
  t0.onResizeAlign   = Dsl.margin(24, Dsl.strech(0.5, resizeSolver));
  t0.stopResizeAlign = Dsl.margin(24, Dsl.compose(Dsl.grid(24, 24), resizeSolver));

  o0.stopDragAlign   = Dsl.grid(24, 24);
  o0.stopResizeAlign = Dsl.grid(24, 24);
  o1.stopDragAlign   = Dsl.grid(24, 24);
  o1.stopResizeAlign = Dsl.grid(24, 24);
}

$(document).ready(start);

