var checked = false;

function setIcon( cell, url )
{
    if ( url.indexOf( "*" ) !== -1 )
    {
        url = url.match( /^([\w-]+:\/*\[?[\w\.:-]+)\]?(?::\d+)?/ )[ 1 ] + "/";
    }
    console.log( url );
    cell.setAttribute( 'style', 'background-image: url(\'chrome://favicon/' + url + '\');' );
}

function addRow( url, selector )
{
    var table = document.getElementById( 'urlsTable' );

    var rowCount = table.rows.length;
    var row = table.insertRow( rowCount );

    var urlCell = row.insertCell( 0 );
    urlCell.className = "domain";
    var domainField = document.createElement( "input" );
    domainField.type = "text";
    domainField.value = url;
    domainField.setAttribute( 'onblur', 'refreshIcon( this )' );
    urlCell.appendChild( domainField );

    var selectorCell = row.insertCell( 1 );
    selectorCell.className = "pattern";
    var selectorField = document.createElement( "input" );
    selectorField.type = "text";
    selectorField.value = selector;
    selectorCell.appendChild( selectorField );

    var delayCell = row.insertCell( 2 );
    delayCell.className = "delay";
    var delayField = document.createElement( "input" );
    delayField.type = "text";
    delayField.value = "0";
    delayCell.appendChild( delayField );

    var methodCell = row.insertCell( 3 );
    $( methodCell ).append( $( "<select><option>Hide</option><option>Blank</option></select>" ) );

    var removeCell = row.insertCell( 4 );
    $( removeCell ).prop( "align", "right" );
    var removeButton = document.createElement( "button" );
    removeButton.innerHTML = "Cancel";
    removeCell.appendChild( removeButton );

    removeButton.addEventListener( 'click', function()
    {
        deleteRow( this )
    } );

    setIcon( urlCell, url );

    if ( url === "" )
    {
        domainField.focus();
    }
}

function deleteRow( button )
{
    var cell = button.parentNode;
    var row = cell.parentNode;
    var table = row.parentNode;
    table.removeChild( row );
}

function refreshIcon( domainField )
{
    var domain = domainField.value;
    var cell = domainField.parentNode;
    setIcon( cell, domain );
}

function loadURLs()
{
    checked = false;

    var table = document.createElement( 'table' );
    table.id = 'urlsTable';

    document.getElementById( 'urls' ).appendChild( table );

    var row = table.insertRow( 0 );
    row.innerHTML += "<th>Domain</th>";
    row.innerHTML += "<th>Element</th>";
    row.innerHTML += "<th width='10%'>Delay (ms)</th>";
    row.innerHTML += "<th width='1%'>Method</th>";
    row.innerHTML += "<th width='1%'></th>";

    var settingsData = window.localStorage.getItem( "settings" );
    var settings = settingsData ? JSON.parse( settingsData ) : [];

    if ( settings.length === 0 )
    {
        addRow( '', '' );
    }
    else
    {
        settings.map( function( entry )
        {
            addRow( entry.url, entry.selector );
        } );
    }
}

function serialize()
{
    var urlsTable = document.getElementById( 'urlsTable' );

    var settings = [];

    for ( var row = 1; row < urlsTable.rows.length; row++ )
    {
        var url = urlsTable.rows[ row ].cells[ 0 ].getElementsByTagName( 'input' )[ 0 ].value;
        var selector = urlsTable.rows[ row ].cells[ 1 ].getElementsByTagName( 'input' )[ 0 ].value;
        var delay = urlsTable.rows[ row ].cells[ 2 ].getElementsByTagName( 'input' )[ 0 ].value;
        var method = parseInt( $( urlsTable.rows[ row ].cells[ 3 ].getElementsByTagName( 'select' ) ).find( "option:selected" ) );
        if ( url.trim() !== '' )
        {
            settings.push(
            {
                url: url,
                selector: selector,
                delay: parseInt( delay ),
                method: method
            } );
        }
    }
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
        addRow( '', '' );
    } );
    document.querySelector( 'button#save-button' ).addEventListener( 'click', function()
    {
        save();
    } );
    document.querySelector( 'button#close-button' ).addEventListener( 'click', function()
    {
        cancel();
    } );
} );