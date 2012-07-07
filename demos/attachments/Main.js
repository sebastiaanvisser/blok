function start ()
{
  window.g = new Group;

  g.addContainer($("#container"));

  for (var i = 0; i < 9; i++)
    g.makeTarget($("#bg"), $("#fg"))

  g.install();

  g.targets[0].adjust({x :  10, y :  10, r :  210, b : 210 });
  g.targets[1].adjust({x : 210, y :  10, r :  410, b : 210 });
  g.targets[2].adjust({x : 410, y :  10, r :  610, b : 210 });
  g.targets[3].adjust({x :  10, y : 210, r :  210, b : 410 });
  g.targets[4].adjust({x : 810, y : 210, r : 1010, b : 410 });
  g.targets[5].adjust({x : 410, y : 210, r :  610, b : 410 });
  g.targets[6].adjust({x :  10, y : 410, r :  210, b : 610 });
  g.targets[7].adjust({x : 210, y : 410, r :  410, b : 610 });
  g.targets[8].adjust({x : 410, y : 410, r :  610, b : 610 });
}

$(document).ready(start);

