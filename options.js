var currentSettings = "";

const defaultEntry = chrome.extension.getBackgroundPage().getDefaultEntry();

function setIcon( cell, url )
{
    if( url && url.indexOf( "*" ) !== -1 )
    {
        url = url.match( /^([\w-]+:\/*\[?[\w\.:-]+)\]?(?::\d+)?/ )[ 1 ];
    }
    $( cell ).css( "background-image", "url(\'chrome://favicon/" + url + "\')" );
}

function addRow( entry )
{
    function refreshIcon( field )
    {
        setIcon( $( field ).parent(), field.value );
    }

    function removeRow( button )
    {
        $( button ).closest( "tr" ).remove();
        if( $( "#elementsTable tbody tr" ).length === 0 )
        {
            addRow( defaultEntry );
        }
    }

    $( "#elementsTable tbody" )
        .append( $( "<tr>" )
            .append( $( "<td class='url'>" )
                .append( $( "<input type='text' name='url' value='" + entry.url + "'>" )
                    .on( "blur", function() { refreshIcon( this ); }) ) )
            .append( $( "<td>" )
                .append( $( "<input type='text' name='selector' value='" + entry.selector + "'>" ) ) )
            .append( $( "<td>" )
                .append( $( "<input type='text' name='delay' value='" + entry.delay + "'>" ) ) )
            .append( $( "<td>" )
                .append( $( "<select name='method'>" )
                    .append( $( "<option selected>" ).html( "Hide" ) )
                    .append( $( "<option>" ).html( "Blank" ) ) ) )
            .append( $( "<td class='remove'>" )
                .append( $( "<button>" ).html( "Remove" ).on( "click", function() { removeRow( this ); }) )
            ) );

    $( "#elementsTable tr:last select" ).val( entry.method );

    setIcon( $( "#elementsTable tr:last td:first" ), entry.url );

    if( entry.url === "" )
    {
        $( "#elementsTable tr:last input.url" ).focus();
    }
}

function loadURLs()
{
    $( "#elementsTable" ).remove();

    var heading = $( "<tr>" )
        .appendTo( $( "<thead>" )
            .appendTo( $( "<table id='elementsTable'>" )
                .appendTo( $( "#urls" ) ) ) );

    [ "URL", "Selector", "Delay (ms)", "Method", "" ].map( function( title )
    {
        heading.append( $( "<th>" ).html( title ) );
    });

    heading.find( "th:nth-child(3)" ).prop( "width", "10%" );
    heading.find( "th" ).slice( -2 ).prop( "width", "1%" );

    $( "#elementsTable" ).append( $( "<tbody>" ) );

    chrome.storage.sync.get( "settings", function( stored )
    {
        var settings = stored.settings === undefined ? [] : stored.settings;

        settings.map( function( entry )
        {
            addRow( entry );
        });

        if( $( "#elementsTable tbody tr" ).length === 0 )
        {
            addRow( defaultEntry );
        }

        currentSettings = JSON.stringify( settings, Object.keys( settings ).sort() );
    });
}

function serialize()
{
    var settings = [];

    $( "#elementsTable tbody tr" ).map( function()
    {
        var entry = {};
        $( this ).find( "input[type=text],select" ).map( function()
        {
            entry[ $( this ).prop( "name" ) ] = $( this ).prop( "value" );
        });
        if( entry.url.trim() !== "" )
        {
            settings.push( entry );
        }
    });

    return settings;
}

function settingsChanged()
{
    var serialized = serialize();
    return currentSettings != JSON.stringify( serialized, Object.keys( serialized ).sort() );
}

function save()
{
    function now()
    {
        function twoDigit( number )
        {
            return number < 10 ? "0" + number : number;
        }

        var now = new Date();
        return twoDigit( now.getHours() ) + ":" + twoDigit( now.getMinutes() ) + ":" + twoDigit( now.getSeconds() );
    }

    var settings = serialize();

    chrome.storage.sync.set( { settings: settings }, function()
    {
        if( chrome.runtime.lastError )
        {
            console.log( "Failed to store settings: " + chrome.runtime.lastError );
        }
        else
        {
            currentSettings = JSON.stringify( settings );
            document.getElementById( 'saved' ).innerHTML = "<em><small>Last saved: " + now() + "</small></em>";
        }
    });
}

function cancel()
{
    chrome.tabs.getSelected(
        null,
        function( tab )
        {
            chrome.tabs.remove( tab.id );
        }
    );
}

function exportEntries()
{
    $( "#importexport" ).remove();
    $( "#options" ).append( $( "<textarea id='importexport' rows='5'>" ).html( JSON.stringify( serialize() ) ) );
}

function importEntries()
{
    try
    {
        var settings = JSON.parse( $( "#importexport" ).val().replace( /\n|\r/g, "" ) );

        chrome.storage.sync.set( { settings: settings }, function()
        {
            if( chrome.runtime.lastError )
            {
                console.log( "Failed to store settings: " + chrome.runtime.lastError );
            }
        });
        $( "#importexport" ).remove();
    }
    catch( e )
    {
        alert( "Failed to parse: " + e );
    }
}

function closePage()
{
    return settingsChanged() ? true : null;
}

window.onbeforeunload = closePage;

document.addEventListener( 'DOMContentLoaded', function()
{
    loadURLs();

    document.querySelector( '#add-button' ).addEventListener( 'click', function()
    {
        addRow( defaultEntry );
    });
    document.querySelector( '#save-button' ).addEventListener( 'click', function()
    {
        save();
    });
    document.querySelector( '#close-button' ).addEventListener( 'click', function()
    {
        cancel();
    });
    document.querySelector( '#export-button' ).addEventListener( 'click', function()
    {
        exportEntries();
    });
    document.querySelector( '#import-button' ).addEventListener( 'click', function()
    {
        importEntries();
    });
});

document.addEventListener( 'visibilitychange', function()
{
    loadURLs();
});

chrome.storage.onChanged.addListener( function( changes, namespace )
{
    loadURLs();
});