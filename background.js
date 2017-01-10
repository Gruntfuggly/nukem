// if( ! localStorage['firstRun'] )
// {
//     chrome.tabs.create( { url : "http://zaonce.com/projects/nukem.shtml" } );
//     localStorage['firstRun'] = 'true';
// }

function setIcon( enabled )
{
    chrome.browserAction.setIcon(
    {
        path: "icons/nukem-" + ( enabled % 2 != 0 ? "19" : "19-disabled" ) + ".png"
    } );
    chrome.browserAction.setTitle(
    {
        title: ( enabled % 2 != 0 ? "Disable" : "Enable" ) + " Nukem"
    } );
}

function toggleEnabled()
{
    chrome.tabs.getSelected(
        null,
        function( tab )
        {
            chrome.tabs.sendRequest(
                tab.id,
                {
                    method: "toggle-enabled"
                },
                function( response )
                {
                    setIcon( response.enabled );
                }
            );
        }
    );
}

function openOptions()
{
    chrome.tabs.create(
    {
        'url': chrome.extension.getURL( 'options.html' )
    }, function( tab )
    {
        // Tab opened.
    } );
}

function addSite( domain, elementPath )
{
    window.localStorage.setItem( domain, elementPath );
}

function getElements( url )
{
    var paths = [];

    for ( var i = 0; i < window.localStorage.length; i++ )
    {
        if ( url === window.localStorage.key( i ) )
        {
            paths.push( window.localStorage.getItem( window.localStorage.key( i ) ) );
        }
    }

    return paths;
}

chrome.browserAction.onClicked.addListener( toggleEnabled );

chrome.extension.onRequest.addListener(
    function( request, sender, sendResponse )
    {
        if ( request.method === "reset" )
        {
            setIcon( false );
        }
        else if ( request.method === "remove" )
        {
            addSite( request.url, request.path );
        }
        else if ( request.method === "options" )
        {
            openOptions();
        }
        else if ( request.method === "getElements" )
        {
            sendResponse(
            {
                paths: getElements( request.url )
            } );
        }
        else
        {
            sendResponse(
            {} ); // snub them.
        }
    }
);