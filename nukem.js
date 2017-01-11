var elementsNuked = 0;

function remove( selector, method )
{
    elementsNuked++;
    if ( method === 0 )
    {
        $( selector ).remove();
    }
    else
    {
        $( selector ).css( "visibility", "hidden" );
    }
    chrome.extension.sendRequest(
    {
        method: "updateBadge",
        elementsNuked: elementsNuked
    } );
}

var url = document.location.href;

chrome.extension.sendRequest(
    {
        method: "getElements",
        url: url
    },
    function( response )
    {
        var elementsNuked = 0;
        response.elements.map( function( element )
        {
            setTimeout( function()
            {
                remove( element.selector, element.method );
            }, element.delay );
        } );
    }
);