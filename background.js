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
        title: ( enabled % 2 != 0 ? "Stop" : "Start" ) + " nukin'..."
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

    chrome.browserAction.setPopup(
    {
        popup: ""
    } );
}

function addSite( url, selector )
{
    var settingsData = window.localStorage.getItem( "settings" );
    var settings = settingsData ? JSON.parse( settingsData ) : [];

    settings.push(
    {
        url: url,
        selector: selector,
        delay: 0,
        method: 0
    } );
    window.localStorage.setItem( "settings", JSON.stringify( settings ) );
}

function pageMatches( url, value )
{
    var pattern = "^" + value;
    pattern = pattern.replace( /\//g, "\\/" );
    pattern = pattern.replace( /\?/g, "\\?" );
    pattern = pattern.replace( /\./g, "\\." );
    pattern = pattern.replace( /\*/g, ".+" );
    var regex = new RegExp( pattern );
    var matched = url.search( regex ) != -1;

    return matched;
}

function getElements( url )
{
    var selectors = [];

    var settingsData = window.localStorage.getItem( "settings" );
    var settings = settingsData ? JSON.parse( settingsData ) : [];

    settings.map( function( entry )
    {
        if ( pageMatches( url, entry.url ) )
        {
            selectors.push( entry );
        }
    } );

    return selectors;
}

chrome.browserAction.onClicked.addListener( toggleEnabled );

chrome.extension.onRequest.addListener(
    function( request, sender, sendResponse )
    {
        if ( request.method === "reset" )
        {
            setIcon( false );
            chrome.browserAction.setBadgeText(
            {
                text: ""
            } );
        }
        else if ( request.method === "remove" )
        {
            addSite( request.url, request.selector );
        }
        else if ( request.method === "options" )
        {
            chrome.runtime.openOptionsPage( function() {} );
        }
        else if ( request.method === "getElements" )
        {
            sendResponse(
            {
                elements: getElements( request.url )
            } );
        }
        else if ( request.method === "updateBadge" )
        {
            chrome.browserAction.setBadgeText(
            {
                text: request.elementsNuked.toString()
            } );
        }
        else
        {
            sendResponse(
            {} ); // snub them.
        }
    }
);