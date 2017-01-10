var checked = false;

function setIcon( cell, domain )
{
    cell.setAttribute( 'style', 'background-image: url(\'chrome://favicon/http://' + domain + '/\');' );
}

function addRow( domain, pattern )
{
    var table = document.getElementById( 'urlsTable' );

    var rowCount = table.rows.length;
    var row = table.insertRow( rowCount );

    var domainCell = row.insertCell( 0 );
    domainCell.className = "domain";
    var domainField = document.createElement( "input" );
    domainField.type = "text";
    domainField.value = domain;
    domainField.setAttribute( 'onblur', 'refreshIcon( this )' );
    domainCell.appendChild( domainField );

    var patternCell = row.insertCell( 1 );
    patternCell.className = "pattern";
    var patternField = document.createElement( "input" );
    patternField.type = "text";
    patternField.value = pattern;
    patternCell.appendChild( patternField );

    var delayCell = row.insertCell( 2 );
    delayCell.className = "delay";
    var delayField = document.createElement( "input" );
    delayField.type = "text";
    delayField.value = "0";
    delayCell.appendChild( delayField );

    var removeCell = row.insertCell( 3 );
    var removeButton = document.createElement( "button" );
    removeButton.innerHTML = "Remove";
    removeCell.appendChild( removeButton );

    removeButton.addEventListener( 'click', function()
    {
        deleteRow( this )
    } );

    setIcon( domainCell, domain );

    if ( domain === "" )
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
    row.innerHTML += "<th width='1%'></th>";

    if ( window.localStorage.length === 0 )
    {
        addRow( '', '' );
    }
    else
    {
        for ( var i = 0; i < window.localStorage.length; i++ )
        {
            var value = window.localStorage.key( i );

            if ( value.substr( 0, 1 ) != '-' )
            {
                var pattern = window.localStorage.getItem( value );
                var domain = value;

                // Backwards compatibility with 0.7
                if ( value.substr( -3 ) == '/.+' )
                {
                    domain = value.substr( 0, value.indexOf( '/' ) );
                    pattern = value.substr( value.indexOf( '/' ) );
                }

                addRow( domain, pattern );
            }
        }
    }
}

function checkForChanges()
{
    var table = document.getElementById( 'urlsTable' );
    var rows = table.getElementsByTagName( 'tr' );

    for ( var i = 0; i < window.localStorage.length; i++ )
    {
        var domain = window.localStorage.key( i );

        if ( domain.substr( 0, 1 ) != '-' )
        {
            var pattern = window.localStorage.getItem( domain );

            var found = false;

            for ( var row = 0; row < rows.length; row++ )
            {
                var fields = rows[ row ].getElementsByTagName( 'input' );
                if ( fields.length > 1 && fields[ 0 ].value == domain && fields[ 1 ].value == pattern )
                {
                    found = true;
                }
            }

            if ( found == false )
            {
                return true;
            }
        }
    }

    return false;
}

function twoDigit( number )
{
    return number < 10 ? "0" + number : number;
}

function now()
{
    var now = new Date();

    return twoDigit( now.getHours() ) + ":" + twoDigit( now.getMinutes() ) + ":" + twoDigit( now.getSeconds() );
}

function save()
{
    window.localStorage.clear();

    var urlsTable = document.getElementById( 'urlsTable' );

    for ( var row = 1; row < urlsTable.rows.length; row++ )
    {
        var domain = urlsTable.rows[ row ].cells[ 0 ].getElementsByTagName( 'input' )[ 0 ].value;
        var pattern = urlsTable.rows[ row ].cells[ 1 ].getElementsByTagName( 'input' )[ 0 ].value;

        if ( domain != '' )
        {
            window.localStorage.setItem( domain, pattern );
        }
    }

    document.getElementById( 'saved' ).innerHTML = "<em><small>Last saved: " + now() + "</small></em>";
}

function canClose()
{
    if ( checked === false && checkForChanges() === true )
    {
        return confirm( "Close without saving?" );
    }
    return true;
}

function cancel()
{
    if ( canClose() )
    {
        checked = true;
        chrome.tabs.getSelected(
            null,
            function( tab )
            {
                chrome.tabs.remove( tab.id );
            }
        );
    }
}

function closePage()
{
    if ( checkForChanges() )
    {
        return "You have not saved your changes.";
    }
}

window.onbeforeunload = closePage;

$( document ).ready(
    function()
    {
        $( "#help tr:even" ).css( "background-color", "#eee" );
        $( "#help tr:odd" ).css( "background-color", "#ddd" );
    }
);

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