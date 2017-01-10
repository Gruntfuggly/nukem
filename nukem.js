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
        console.log( JSON.stringify( response.selectors ) );
        response.selectors.map( function( selector )
        {
            remove( selector );
        } );
    }
);