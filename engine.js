var enabled = false;

var box = $( "<div class='outer' />" ).css(
{
    display: "none",
    position: "absolute",
    zIndex: 65000,
    background: "rgba(255, 0, 0, .3)"
} ).appendTo( "body" );

var mouseX, mouseY, target, lastTarget;

window.requestAnimationFrame( function frame()
{
    window.requestAnimationFrame( frame );

    if ( target === undefined )
    {
        box.hide();
        return;
    }

    if ( target && target.className === "outer" )
    {
        box.hide();
        target = document.elementFromPoint( mouseX, mouseY );
    }

    box.show();

    if ( target === lastTarget ) return;

    lastTarget = target;
    var $target = $( target );
    var offset = $target.offset();
    box.css(
    {
        width: $target.outerWidth() - 1,
        height: $target.outerHeight() - 1,
        left: offset.left,
        top: offset.top
    } );
} );

function toggleEnabled()
{
    enabled = !enabled;

    if ( enabled )
    {
        $( "body" ).on( "mousemove.nukem", function( e )
        {
            mouseX = e.clientX;
            mouseY = e.clientY;
            target = e.target;
        } );
    }
    else
    {
        $( "body" ).off( "mousemove.nukem" );
        target = undefined;
    }
}

chrome.extension.sendRequest(
    {
        method: "reset"
    },
    function( response ) {}
);

chrome.extension.onRequest.addListener(
    function( request, sender, sendResponse )
    {
        if ( request.method == "toggle-enabled" )
        {
            toggleEnabled();
            sendResponse(
            {
                enabled: enabled
            } );
        }
    }
);