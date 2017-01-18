var checked = false;

const defaultRow = {
    url: "",
    selector: "",
    delay: 0,
    method: "Hide"
};

function setIcon( cell, url )
{
    if( url && url.indexOf( "*" ) !== -1 )
    {
        url = url.match( /^([\w-]+:\/*\[?[\w\.:-]+)\]?(?::\d+)?/ )[ 1 ];
    }
    $( cell ).css( "background-image", "url(\'chrome://favicon/" + url + "\')" );
}

function serializeEntry( row )
{
    var entry = {};
    $( this ).find( "input,select" ).map( function()
    {
        entry[ $( this ).prop( "name" ) ] = $( this ).prop( "value" );
    });
    return entry;
}

function serialize()
{
    var settings = [];

    $( "#elementsTable tbody tr" ).map( function()
    {
        settings.push( serializeEntry( this ) );
    });

    return JSON.stringify( settings );
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
            addRow( defaultRow );
        }
    }

    function reduceScope( button )
    {
        var selectorField = $( button ).closest( "tr" ).find( "input[name='selector']" );
        var selectorElements = selectorField.val().split( " > " );
        selectorElements.pop();
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
                .append( $( "<button>" ).html( "Reduce" ).on( "click", function() { reduceScope( this ); }) ) )
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
    checked = false;

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

    var settingsData = window.localStorage.getItem( "settings" );
    var settings = settingsData ? JSON.parse( settingsData ) : [];

    if( settings.length === 0 )
    {
        addRow( defaultRow );
    }
    else
    {
        settings.map( function( entry )
        {
            addRow( entry );
        });
    }
}

function settingsChanged()
{
    return window.localStorage.getItem( "settings" ) !== serialize();
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

    window.localStorage.clear();
    window.localStorage.setItem( "settings", serialize() );

    document.getElementById( 'saved' ).innerHTML = "<em><small>Last saved: " + now() + "</small></em>";
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

function closePage()
{
    return settingsChanged() ? true : null;
}

window.onbeforeunload = closePage;

document.addEventListener( 'DOMContentLoaded', function()
{
    loadURLs();

    document.querySelector( 'button#add-button' ).addEventListener( 'click', function()
    {
        addRow( defaultRow );
    });
    document.querySelector( 'button#save-button' ).addEventListener( 'click', function()
    {
        save();
    });
    document.querySelector( 'button#close-button' ).addEventListener( 'click', function()
    {
        cancel();
    });
});

document.addEventListener( 'visibilitychange', function()
{
    loadURLs();
});