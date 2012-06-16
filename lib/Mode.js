function Mode ()
{
  this.adjusting = false;
  $(document.body).keypress(this.keypress.scope(this));
}

Mode.prototype.toggle =
  function toggle ()
  {
    this.adjusting = !this.adjusting;
    $(document.body).toggleClass("adjusting");
  };

Mode.prototype.keypress =
  function keypress (e)
  {
    if (e.keyCode == 101 && e.metaKey) this.toggle();
  };


