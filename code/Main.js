function start ()
{
  var c0 = new Drag($("#c0")[0]);
  var t0 = new Drag($("#t0")[0]);
  var o0 = new Drag($("#o0")[0]);

  var solver = Dsl.orOrigin
    ( Dsl.dragSolver
      ( [ function () { return Geom.parent(t0.target[0]); }
        ]
      , [ function () { return Geom.element(o0.target[0]); }
        ]
      )
    );

  t0.onDragAlign   = Dsl.strech(0.5, solver);
  t0.stopDragAlign = Dsl.compose(Dsl.grid(24, 24), solver);
  o0.stopDragAlign = Dsl.grid(24, 24);
}

$(document).ready(start);

