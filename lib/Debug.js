function Debug () {}

Debug.clear =
  function clear ()
  {
    $("#debug").html("");
  };

Debug.elem =
  function elem (v, i)
  {
    return function (g, j)
    {
      var e = $("<div class='debug elem " + v + "'>" + i +"," + j + "</div>");
      $("#debug").append(e);
      $(e).css("left",   g.x + "px");
      $(e).css("top",    g.y + "px");
      $(e).css("width",  (g.r - g.x) + "px");
      $(e).css("height", (g.b - g.y) + "px");
    };
  };

Debug.point =
  function elem (v)
  {
    return function (pt)
    {
      var e = $("<div class='debug point " + v + "'></div>");
      $("#debug").append(e);
      $(e).css("left",   (pt.x - 5) + "px");
      $(e).css("top",    (pt.y - 5) + "px");
      $(e).css("width",  10 + "px");
      $(e).css("height", 10 + "px");
    };
  };

