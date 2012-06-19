function start ()
{
  window.g = new Group;

  g.addContainer($("#container"));

  for (var i = 0; i < 10; i++)
    g.makeTarget($("#bg"), $("#fg"))

  g.install();
}

$(document).ready(start);

