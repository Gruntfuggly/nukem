var checked = false;

function setIcon( cell, url )
{
    if( url.indexOf( "*" ) !== -1 )
    {
        url = url.match( /^([\w-]+:\/*\[?[\w\.:-]+)\]?(?::\d+)?/ )[ 1 ] + "/";
    }
    $( cell ).css( "background-image", "url(\'chrome://favicon/" + url + "\')" );
}

function addRow( entry )
{
    $( "#elementsTable" )
        .append( $( "<tr>" )
            .append( $( "<td class='url'>" )
                .append( $( "<input type='text' class='url' value='" + entry.url + "'>" )
                    .on( "blur", function() { refreshIcon( this ); }) ) )
            .append( $( "<td>" )
                .append( $( "<input type='text' class='selector' value='" + entry.selector + "'>" ) ) )
            .append( $( "<td>" )
                .append( $( "<input type='text' class='delay' value='" + entry.delay + "'>" ) ) )
            .append( $( "<td>" )
                .append( $( "<select class='method'>" )
                    .append( $( "<option selected>" ).html( "Hide" ) )
                    .append( $( "<option>" ).html( "Blank" ) ) ) )
            .append( $( "<td class='remove'>" )
                .append( $( "<button>" ).html( "Remove" ).on( "click", function() { deleteRow( this ); }) )
            ) );

    $( "#elementsTable tr:last select" ).val( entry.method );

    setIcon( $( "#elementsTable tr:last td:first" ), entry.url );

    if( entry.url === "" )
    {
        $( "#elementsTable tr:last input.url" ).focus();
    }
}

function deleteRow( button )
{
    var cell = button.parentNode;
    var row = cell.parentNode;
    var table = row.parentNode;
    table.removeChild( row );
}

function refreshIcon( field )
{
    setIcon( $( field ).parent(), field.value );
}

function loadURLs()
{
    checked = false;

    var table = document.createElement( 'table' );
    table.id = 'elementsTable';

    document.getElementById( 'urls' ).appendChild( table );

    var row = table.insertRow( 0 );
    row.innerHTML += "<th>URL</th>";
    row.innerHTML += "<th>Selector</th>";
    row.innerHTML += "<th width='10%'>Delay (ms)</th>";
    row.innerHTML += "<th width='1%'>Method</th>";
    row.innerHTML += "<th width='1%'></th>";

    var settingsData = window.localStorage.getItem( "settings" );
    var settings = settingsData ? JSON.parse( settingsData ) : [];

    if( settings.length === 0 )
    {
        addRow( { url: "", selector: "", delay: 0, method: "Hide" });
    }
    else
    {
        settings.map( function( entry )
        {
            addRow( entry );
        });
    }
}

function serialize()
{
    var settings = [];

    $( "#elementsTable tbody tr" ).map( function()
    {
        var entry = {};
        $( this ).find( "input[type=text],select" ).map( function()
        {
            entry[ $( this ).prop( "class" ) ] = $( this ).prop( "value" );
        });
        settings.push( entry );
    });

    return JSON.stringify( settings );
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
        addRow( {
            url: "",
            selector: "",
            delay: 0,
            method: "Hide"
        });
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