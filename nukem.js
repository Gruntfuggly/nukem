function remove( selector )
{
    $( selector ).remove();
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
                remove( element.selector );
            }, element.delay );
        } );
    }
);