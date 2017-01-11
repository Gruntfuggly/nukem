var enabled = false;
var elementsNuked = 0;

function getDomPath( el )
{
    var stack = [];
    while ( el.parentNode !== null )
    {
        var sibCount = 0;
        var sibIndex = 0;
        for ( var i = 0; i < el.parentNode.childNodes.length; i++ )
        {
            var sib = el.parentNode.childNodes[ i ];
            if ( sib.nodeName == el.nodeName )
            {
                if ( sib === el )
                {
                    sibIndex = sibCount;
                }
                sibCount++;
            }
        }
        if ( el.hasAttribute( 'id' ) && el.id !== '' )
        {
            stack.unshift( el.nodeName.toLowerCase() + '#' + el.id );
        }
        else if ( sibCount > 1 )
        {
            stack.unshift( el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')' );
        }
        else
        {
            stack.unshift( el.nodeName.toLowerCase() );
        }
        el = el.parentNode;
    }

    return stack.slice( 1 ); // removes the html element
}

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
        elementsNuked = 0;

        $( "body" ).on( "mousemove.nukem", function( e )
        {
            mouseX = e.clientX;
            mouseY = e.clientY;
            target = e.target;
        } );
        $( "body" ).on( "click.nukem", function( e )
        {
            var selector = "#" + $( target ).prop( "id" );

            if ( selector.trim() === "#" )
            {
                selector = getDomPath( target ).join( " > " );
            }

            elementsNuked++;

            chrome.extension.sendRequest(
                {
                    method: "remove",
                    selector: selector,
                    url: window.location.href
                },
                function( response ) {}
            );
            $( selector ).remove();
        } );
    }
    else
    {
        $( "body" ).off( "mousemove.nukem" );
        $( "body" ).off( "click.nukem" );

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
            if ( !enabled && elementsNuked > 0 )
            {
                chrome.extension.sendRequest(
                    {
                        method: "options",
                    },
                    function( response ) {}
                );
            }
            sendResponse(
            {
                enabled: enabled
            } );
        }
    }
);