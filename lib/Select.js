function Select (block, pivot)
{
  this.block        = block;
  this.block.select = this;
  this.pivot        = $(pivot || block.target);

  this.enabled    = true;
  this.selected   = false;

  this.pivot.click       (this.click.scope(this));
  $(document.body).click (this.bodyClick.scope(this));
}

// ----------------------------------------------------------------------------

Select.prototype.click =
  function click (e)
  {
    if (this.enabled) this.startSelecting();
  };

Select.prototype.bodyClick =
  function bodyClick (e)
  {
    if (e.target == this.block.target[0]) return;
    if (this.enabled) this.stopSelecting();
  };

// ----------------------------------------------------------------------------

Select.prototype.startSelecting =
  function startSelecting ()
  {
    this.selected = true;
    this.block.target.addClass("selected");
  };

Select.prototype.stopSelecting =
  function stopSelecting ()
  {
    this.selected = false;
    this.block.target.removeClass("selected");
  };

