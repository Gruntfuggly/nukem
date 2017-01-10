function remove( elementPath )
{
    $( elementPath ).remove();
}

var url = document.location.href;

chrome.extension.sendRequest(
    {
        method: "getElements",
        url: url
    },
    function( response )
    {
        response.paths.map( function( path )
        {
            remove( path );
        } );
    }
);
