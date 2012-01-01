Module "Main"

Class

  Main: ->
    $(document).ready =>
      @install $("#target0")
      @install $("#target1")

  install: (t) ->

    fd = new Drag t[0], t[0]

    c0 = $("#container0")[0]
    c1 = $("#container1")[0]
    c2 = $("#container2")[0]
    o0 = $("#obstacle0")[0]

    bounds = Drag.or(Drag.withinElem(c0), Drag.or(Drag.withinElem(c1), Drag.withinElem(c2)))
    obst = Drag.and(Drag.outsideElem(o0), bounds)

    fd.dragAlign = Drag.strech 0.4, obst
    fd.stopAlign = Drag.and(obst, Drag.grid(24, 24))

Static

  init: ->
    window.main = new Main

