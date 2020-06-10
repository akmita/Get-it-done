----------------------------
APP TESTED ON NODE v10.16.0 
----------------------------


This is an app I made with the help of a youtube tutorial.
Uses promises inside the HTML file to update data clientside
Uses routes in the app.js file to update the database

creates new HTML elements with Jquery (eww), 
    each element has an option to edit and delete
    clicking that option calls the appropriate route (EDIT or DELETE) in app.js
    app.js updates database, sends response back to clientside
    client updates the display appropriately


CHANGELOG
    added another ID to the buildIDS function for the text box
    the plan is to replace the list item text with a textbox that appears in it's place
    5/15/2020
    got rid of the bug that wouldn't let me edit a list element 
    update the item clientside as soon as it is updated in the database,
    fixed bug where edit event listener isn't created until page is refreshed 
        -- NEXT UP --
        use icons like in my blueprint
        https://fontawesome.com/kits/3c022a63df/use?welcome=yes
        -- DONE --

        -- NEXT UP --
        event listener on each icon to change icons clientside, then database
        maybe only bind one set of icons
        make sure two icon Tables can't be open at the same time
       

   