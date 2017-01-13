function remove( selector, method )
{
    if( method === "Hide" )
    {
        $( selector ).remove();
    }
    else
    {
        $( selector ).css( "visibility", "hidden" );
    }
    chrome.extension.sendRequest( {
        method: "elementNuked",
    });
}

var url = document.location.href;

chrome.extension.sendRequest( {
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
            }, parseInt( element.delay ) );
        });
    }
);