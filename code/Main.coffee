Module "Main"

Class

  Main: ->
    $(document).ready =>
      @install $("#target0")[0]
      @install $("#target1")[0]

  install: (t) ->

    fd = new Drag t, t

    c0 = $("#container0")[0]
    c1 = $("#container1")[0]
    c2 = $("#container2")[0]
    o0 = $("#obstacle0")[0]
    o1 = $("#obstacle1")[0]
    o2 = $("#obstacle2")[0]

    containers = Drag.or(Drag.withinElem(c0), Drag.or(Drag.withinElem(c1), Drag.withinElem(c2)))
    obstacles  = Drag.and(Drag.outsideElem(o0), Drag.and(Drag.outsideElem(o1), Drag.outsideElem(o2)))

    both = Drag.and(containers, obstacles)

    fd.dragAlign = Drag.strech 0.4, both
    fd.stopAlign = Drag.and(both, Drag.grid(24, 24))

Static

  init: ->
    window.main = new Main

