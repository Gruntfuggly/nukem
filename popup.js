addEventListener( "unload", function( event )
{
    chrome.extension.getBackgroundPage().toggleEnabled();
}, true );

$( document ).ready( function()
{
    $( "#start" ).click( function()
    {
        self.close();
    } );
} );