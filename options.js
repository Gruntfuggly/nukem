var storedSettings = [];

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

    function reduceScope( button )
    {
        var selectorField = $( button ).closest( "tr" ).find( "input[name='selector']" );
        var selectorElements = selectorField.val().split( " > " );
        if( selectorElements.length > 1 )
        {
            selectorElements.pop();
        }
        selectorField.val( selectorElements.join( " > " ) );
    }

    $( "#elementsTable tbody" )
        .append( $( "<tr>" )
            .append( $( "<td class='url'>" )
                .append( $( "<input type='text' name='url' value='" + entry.url + "'>" )
                    .on( "blur", function() { refreshIcon( this ); }) ) )
            .append( $( "<td>" )
                .append( $( "<input type='text' name='selector' value='" + entry.selector + "'>" ) ) )
            .append( $( "<td>" )
                .append( $( "<button class='reduceScope'>" ).html( "&#9669;" ).on( "click", function() { reduceScope( this ); }) ) )
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
        $( "#elementsTable tr:last input[name='url']" ).focus();
    }
}

function loadURLs()
{
    $( "#elementsTable" ).remove();

    var heading = $( "<tr>" )
        .appendTo( $( "<thead>" )
            .appendTo( $( "<table id='elementsTable'>" )
                .appendTo( $( "#urls" ) ) ) );

    [ "URL", "Selector", "Scope", "Delay (ms)", "Method", "" ].map( function( title )
    {
        heading.append( $( "<th>" ).html( title ) );
    });

    heading.find( "th" ).slice( -4 ).prop( "width", "1%" );
    heading.find( "th:nth-child(4)" ).prop( "width", "10%" );

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

        storedSettings = settings;
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
            storedSettings = settings;
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
    function settingsChanged()
    {
        var settings = serialize();
        var changed = storedSettings.length !== settings.length;
        if( !changed )
        {
            changed = storedSettings.some( function( entry, index )
            {
                return JSON.stringify( entry, Object.keys( entry ).sort() ) !== JSON.stringify( settings[ index ], Object.keys( settings[ index ] ).sort() );
            });
        }
        return changed;
    }
    return settingsChanged() ? true : null;
}

window.onbeforeunload = closePage;

document.addEventListener( 'DOMContentLoaded', function()
{
    loadURLs();

    document.querySelector( '#add-button' ).addEventListener( 'click', function()
    {
        addRow( defaultEntry );
        $( ".options" ).scrollTop( $( ".options" )[ 0 ].scrollHeight );
    });
    document.querySelector( '#save-button' ).addEventListener( 'click', function()
    {
        save();
    });
    document.querySelector( '#close-button' ).addEventListener( 'click', function()
    {
        cancel();
    });
    // document.querySelector( '#export-button' ).addEventListener( 'click', function()
    // {
    //     exportEntries();
    // });
    // document.querySelector( '#import-button' ).addEventListener( 'click', function()
    // {
    //     importEntries();
    // });
});

document.addEventListener( 'visibilitychange', function()
{
    loadURLs();
});

chrome.storage.onChanged.addListener( function( changes, namespace )
{
    loadURLs();
});