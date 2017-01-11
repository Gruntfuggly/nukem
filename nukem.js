function remove( selector, method )
{
    if ( method === 0 )
    {
        $( selector ).remove();
    }
    else
    {
        $( selector ).css( "visibility", "hidden" );
    }
}

var url = document.location.href;

chrome.extension.sendRequest(
    {
        method: "getElements",
        url: url
    },
    function( response )
    {
        response.elements.map( function( element )
        {
            setTimeout( function()
            {
                remove( element.selector, element.method );
            }, element.delay );
        } );
    }
);