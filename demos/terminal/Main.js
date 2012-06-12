function start ()
{
  var group = window.g = new Group;
  $( "#container" ).each(function (_, t) { group.addContainer (t) });
  $( ".target"    ).each(function (_, t) { group.addTarget    (t) });
  g.touch();
}

$(document).ready(start);

