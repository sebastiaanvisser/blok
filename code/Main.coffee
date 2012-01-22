Module "Main"

Class

  Main: ->
    @group = new Group
    window.g = @group

    $(document).ready =>

      c = new Drag $(".container")[0]
      t = new Drag $(".target")[0]

      t.onDragAlign   = Constraint.dragSolver [], []
      t.stopDragAlign = Constraint.grid 24, 24

      # @group.addContainer t for t in $(".container").get()
      # @group.addObstacle  t for t in $(".obstacle").get()
      # @group.addTarget    t for t in $(".target").get()

      @setupUI()

  setupUI: () ->
    $("#new-container").click () =>
      div = $("<div data-geom='10 10 14 16' class=container></div>")
      $("#containers").append div
      @group.addContainer div[0]

    $("#new-target").click () =>
      div = $("<div data-geom='10 10 14 16' class=target></div>")
      $("#targets").append div
      @group.addTarget div[0]

    $("#new-obstacle").click () =>
      div = $("<div data-geom='10 10 14 16' class=obstacle></div>")
      $("#obstacles").append div
      @group.addObstacle div[0]

Static

  init: ->
    window.main = new Main

