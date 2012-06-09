function start ()
{
  var vp = new Viewport("body", "#content > *", "body");

  vp.hook.push 
    ( function ()
      {
        $( this.middle     ).css("opacity", "1.0");
        $( this.top        ).css("opacity", "0.0");
        $( this.bottom     ).css("opacity", "0.0");
        $( this.topEdge    ).css("opacity", "0.2");
        $( this.bottomEdge ).css("opacity", "0.2");

        $( this.middle     ).css("outline", "none");
        $( this.center     ).css("outline", "dashed 2px #fa0");
      }
    );

  vp.compute();
}

$(document).ready(start);

