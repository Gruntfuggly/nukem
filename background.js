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

chrome.browserAction.onClicked.addListener( toggleEnabled );

chrome.extension.onRequest.addListener(
    function( request, sender, sendResponse )
    {
        if ( request.method == "reset" )
        {
            setIcon( false );
        }
        else
        {
            sendResponse(
            {} ); // snub them.
        }
    }
);