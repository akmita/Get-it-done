const icons = [ "fa-calculator", "fa-atom", "fa-dna", "fa-biking", "fa-book", "fa-briefcase", "fa-car-side", "fa-crosshairs", "fa-dice-five", 
                            "fa-fighter-jet", "fa-futbol", "fa-gamepad", "fa-pen", "fa-square", "fa-dumbbell", "fa-compass", "fa-thumbtack", "fa-hiking", "fa-camera" ];

// global object assists in editing 
var currElementForEdit = {
    iconNum: -1
}


function validateGoal(goal) {
    var requiredProp = ["name", "startDate", "type", "duration", "completed", "past"];
    for (var i = 0; i < requiredProp.length; i++) {
        if (!goal.hasOwnProperty(requiredProp[i]))  {
            console.error("goal validation failed at propery: " + requiredProp[i]);
            return false;
        }
    }
    return true;
}

function getIDs(id) {
    return {
        ID: `${id}`,
        goalID: `goal_${id}`,
        dropDownID: `drop_${id}`,
        containerID: `container_${id}`,
        nameID: `name_${id}`,
        editID: `edit_${id}`
    }
}

// starts process for adding new goal
function addNewGoal() {
    console.log("starting process for adding new goal");
    // set up the same elemnet used for editing    

    if (document.querySelector(".elementForEdit") == null) {                            // if editing is NOT in progress, toggle editing
        var editElement = $.parseHTML(getParentEditTemplate("", "", "purple"));
        editElement[0].childNodes[3].placeholder = "goal name";                         // sets goal placeholder text
        editElement[0].childNodes[5].placeholder = "just give me a reason";             // sets reason placeholder text
        editElement[0].childNodes[7].addEventListener("click", ()=>{                    // when submit button is clicked
            fetch("/api/addGoal", {
                    headers: {
                        "Content-Type": "Application/json"
                    },               
                    method: "POST",
                    body: JSON.stringify({
                        color: "grey",
                        name: editElement[0].childNodes[3].value,
                        reason: editElement[0].childNodes[5].value,
                        
                    })
            }).then((res) => res.json())
            .then((data) => {
                    if (data.ok) console.log("successfully added goal");
                    else { console.log("error adding goal"); }
            });
            $(".elementForEdit").remove();              
        })
        editElement[0].childNodes[9].addEventListener("click", ()=>{
            $(".elementForEdit").remove();   
        })        
    $(".goalsContainer").append(editElement);
    }
    else { 
        console.log("Editing in progress already"); 
    }
}


// toggles dropdown of children of a larger goal
function toggleChildren(containerID, numTasks) {       
    
    let childElements = document.getElementById(containerID.id).childNodes;
    childElements = Array.from(childElements);
    childElements = childElements.filter((node) => {
        return (node.nodeType == Node.ELEMENT_NODE);
    });

    console.log("length of childNodes: " + childElements.length);

    if (numTasks == 0) {                                        1// test if empty
        console.log("%cNo elements found to drop down","color: orange;");
    }
    else if (childElements[1].style.display == "grid") {        // if displaying
        console.log("Hiding elements");
        for (var i = 1; i < childElements.length; i++) {        // hide child elements                        
            console.log("   hiding element with id: " + childElements[i].id);
            childElements[i].style.display = "none";
                                   
        }
    }     
    else {                                                      // if hidden                   
        console.log("Revealing elements");
        for (var i = 1; i < childElements.length; i++) {        // reveal child elements
            console.log("   revealing element with id: " + childElements[i].id);
            childElements[i].style.display = "grid";
        }
    }                        
}

// starts editing process
function toggleEditing(event, ids, name, reason, goalObj /*, icon id number, duration, numMilestones, color */ ) {
    console.log("starting edit of goal: " + name);        
    var name = document.getElementById(ids.nameID).innerHTML;
    var nameField = document.getElementById(ids.nameID);
    var goal = document.getElementById(ids.goalID);
    var editElement;            // current element we're inputting data into to edit
    console.table(goalObj);

    event.stopPropagation();                                                            // prevents dropdown from toggling
       console.log(document.querySelector(".elementForEdit"));                          
    if (document.querySelector(".elementForEdit") == null) {                            // if editing is NOT in progress, toggle editing
        editElement = $(getParentEditTemplate(name, reason ,"red"));          
        editElement.insertAfter(`#${ids.goalID}`);                                      // append editing element
        goal.style.display = "none";
    }
    else { console.log("Editing in progress already"); }
    
    document.querySelector(".iconContainer").addEventListener("click", ()=>{
        console.log("clicked icon to start editing");
        initIconTable(ids);                                                             // inits icon table listeners
    });
    
    document.getElementById("submitButton").addEventListener("click", ()=> {            // set listener for checkmark icon 
        var chosenIcon = currElementForEdit.iconNum;
        var newIconNum = chosenIcon;                                       // TODO fix in case user doesn't input anything 
        var newGoalName = document.querySelector(".goalTextBox").value;
        var newReason = document.querySelector(".reasonTextBox").value;

        // TODO update more than just iconNum
        fetch(`/api/${ids.ID}`, {
            method: "PUT",
            headers: {
                "Content-Type" : "Application/json"
            },
            body: JSON.stringify({ 
                iconNum : newIconNum,
                name : newGoalName,
                reason : newReason
            })   
        }).then((res)=> {
            res.json();
        }).then((data)=> {
            console.log(data);
        });
        // now we've updated the Todo in database

        // took the easy way, reload whole screen when we update.. it's easier. will need to consider perfomance issues later  TODO
        document.querySelector(".goalsContainer").innerHTML = "";
        getGoals();
    }) 
    document.getElementById("cancelButton").addEventListener("click", ()=> {            // set listener for cancel icon          
        document.querySelector(".elementForEdit").remove();         // remove editing element
        goal.style.display = "grid";                                // visibilize element
    }) 
    
}


// ---------------------------------------- ICON FUNCTIONS -------------------------------------------------
// adds icontable to html, loads up its event listeners
function initIconTable(ids) {    
    console.log(" in initIconTable: ");   
    removeDropdowns();                                                          // gets rid of menus before creating icon menu

    if (document.getElementById(ids.containerID).contains(document.querySelector(".dropdown"))) {      // if already there, remove it instead
        console.log(" NOPE not creating a new one");
        //// WHAT DO WE DO HERE 
    }
    else {                                                                      // if not there, create icon table 
        console.log(" creating new icon table");
        document.querySelector(".elementForEdit").appendChild(getIconTableNode());
        for (var iconNum = 0; iconNum < icons.length; iconNum++) {                  // loops through each icon
            setIcon(iconNum, ids);                                              // calls listeners on each icon                              
        }
    }
}

// returns an icon selection HTML element   - DEPRACATED
function getIconTable() {
    var iconTableHTML = `<div class="iconSelectContainer dropdown">`;              
    for (var i = 0; i < icons.length; i++) {
        iconTableHTML += `<i id="i${i}" class="icon fas ${icons[i]} dropBtn"></i>`;
    }
    iconTableHTML += `</div>`;

    return iconTableHTML;       
}

// returns an icon selection HTML node
function getIconTableNode() {
    // var iconTableHTML = `<div class="iconSelectContainer dropdown">`;  
    var iconTableHTML = document.createElement("div");
    iconTableHTML.setAttribute("class", "iconSelectContainer dropdown");
    
    for (var i = 0; i < icons.length; i++) {
        // iconTableHTML += `<i id="i${i}" class="icon fas ${icons[i]} dropBtn"></i>`;
        var currIcon = document.createElement("i");
        currIcon.setAttribute("id", `i${i}`);
        currIcon.setAttribute("class", `icon fas ${icons[i]} dropBtn`);
        iconTableHTML.appendChild(currIcon);
    }

    return iconTableHTML;       
}
            
//
// sets event listener on each icon, when clicked, updates it in database
// 
const setIcon = (iconNum, ids)=> {                                                     
    console.log("setIcon(): setting event listener for icon: " + iconNum + " with todo: " + ids.goalID);
    const iconBtn = document.querySelector(`#i${iconNum}`);

    iconBtn.addEventListener("click", ()=> {

        console.log("setting icon #" + iconNum + " in element with id: " + ids.listItemID);    
        var element = document.querySelector(".iconContainer");
        element.innerHTML = `<i class="fas ${icons[iconNum]} dropBtn">`;    // updates icon clientside
        removeDropdowns();
        currElementForEdit.iconNum = iconNum;                               // flags global object so we know what icon to update in  database
    });                
}
        
// sets up listener for icon within each list item
function editIcon(ids) {
    $(`#${ids.iconID}`).click(()=> {
        initIconTable(ids);             // creates new icontable bound to the clicked element
    })
}

// removes all dropdown/selection menus
function removeDropdowns() {
    var dropdowns = document.getElementsByClassName("dropdown");

    for (var i = 0; i < dropdowns.length; i++) {
        console.log("  removing: ");
        console.log(dropdowns[i]);
        dropdowns[i].remove();
    }
}
// -------------------------------- END ICON FUNCTIONS --------------------------------------

function getGoalParent(name, duration, reason, iconID, ids, numMilestones, color) {
    var boldStyle = "font-weight: 800; font-size: 10px; padding-top: 3px; opacity: 1;";
    var style = Array(4).fill("");

    switch (duration) {
        case "yearly":      style[0] = boldStyle;   break;
        case "monthly":     style[1] = boldStyle;   break;
        case "weekly":      style[2] = boldStyle;   break;
        case "daily":       style[3] = boldStyle;   break;
    }

    return `<div class="goalParentContainer" id="${ids.containerID}">
        <div class="goal-1" id="${ids.goalID}" onClick="toggleChildren(${ids.containerID}, ${numMilestones})" style="background:${color};">
            <div class="goalIcon"><i class="icons fas ${icons[iconID]}"></i></div>
            <p class="dropDownIcon" id="${ids.dropDownID}"><i class="fas fa-caret-down"></i></p>
            <div class="goalText" id="${ids.nameID}">${name}</div>
            <div class="duration">           
                <p class="durationText" style="${style[0]}">Yearly</p>
                <p class="durationText" style="${style[1]}">Monthly</p>
                <p class="durationText" style="${style[2]}">Weekly</p>
                <p class="durationText" style="${style[3]}">Daily</p>
            </div>
            <div class="editIcon" id="${ids.editID}" ><i class="fas fa-edit"></i></div>
        </div>      
    </div>`;
}

// 

// first level of depth from original goal
function getGoalChild_1(name, ids, numTasks, color) {
    return `<div class="milestoneParentContainer" id="${ids.containerID}">
        <div class="goal-1 goal-inner-1" id="${ids.goalID}" onClick="toggleChildren(${ids.containerID}, ${numTasks})" style="background:${color}; opacity: 0.85;">
            <p class="dropDownIconSmall"><i class="fas fa-caret-down"></i></p>
            <div class="goalText" id="${ids.nameID}">${name}</div>
        </div>
    </div>`;
}

// last level of depth from original goal
function getDailyGoal(task, ids, color) {
    return `<div class="goal-1 goal-inner-final" id="${ids.goalID}" style="background:${color}; opacity: 0.70;">
        <div class="goalTextFull" id="${ids.nameID}">${task.name}</div>
    </div>`;
}

function getParentEditTemplate(name, reason, color) {
    return `<div class="goal-1 elementForEdit" style="background:${color};">
            <div class="iconContainer"> <i class="fas fa-adjust"></i> </div>               
            <input type="text" class="goalTextBox" value="${name}" style="background: LightCoral;" id="001">
            <input type="text" class="reasonTextBox" value="${reason}" style="background: LightCoral;" id="002">
            <button id="submitButton" style="background: ${color}"><i class="fas fa-check fa-2x"></i></button>
            <button id="cancelButton" style="background: ${color}">Cancel</button> 
        </div>
    </div>`;
    // return `<div class="goal-1 goal-inner-final" id="000" style="background:${color}; opacity: 0.70;">
    //     <input type="text" class="goalTextFull" placeholder="${name}" id="001"></div>
    // </div>`;
}


function getChildEditTemplate(name, reason, color) {
    `<div class="goal-1 elementForEdit" style="background:${color};">
            <div class="iconContainer"> <i class="fas fa-adjust"></i> </div>               
            <input type="text" class="goalTextBox" value="${name}" style="background: LightCoral;" id="001">
            <button id="submitButton" style="background: ${color}"><i class="fas fa-check fa-2x"></i></button>
            <button id="cancelButton" style="background: ${color}">Cancel</button> 
        </div>
    </div>`;
}



const renderGoal = (goal, ids) => {
   
    document.querySelector(".goalsContainer").innerHTML += getGoalParent(goal.name, goal.duration, goal.reason, goal.iconNum, ids, goal.milestones.length, goal.color);        // render main goal tab
                    
    setTimeout(()=>{
        document.getElementById(ids.editID).addEventListener("click", (e)=>{
            toggleEditing(e, ids, goal.name, goal.reason, goal);
        })                        
    }, 0);

    goal.milestones.forEach((milestone)=>{                                                                          // loop through milestones
        let milestone_ids = getIDs(milestone.id);                                                                   // ids for milestones       
        console.log("Rendering milestone: " + milestone.name);         
        console.log(goal.weeklyTasks);                           
        document.getElementById(ids.containerID).innerHTML += getGoalChild_1(milestone.name, milestone_ids, goal.weeklyTasks.length, goal.color);    // render milestone                                                                   
        
        goal.weeklyTasks.forEach((task)=>{                                                                          // loop through daily goals
            console.log("Rendering task: " + task.name);
            let task_ids = getIDs(task.id);                                                                         // get ids for daily tasks
            document.getElementById(milestone_ids.containerID).innerHTML += getDailyGoal(task, task_ids, goal.color);    // render each daily task
        })                                   
    }); 
}

const matchGoalType = (data) => {

    if (data.length > 0) {
        data.forEach(goal => {                                      // loops through each goal
            console.log(`Getting goal: ${goal.name}`);                        
            if (!validateGoal(goal)) return;                        // check for invalid objects (put this above switch statement)
            console.log("%cValidated goal", "color: green;");

            switch (goal.duration) {                                    
                case "yearly":                       
                case "monthly":
                    let ids = getIDs(goal._id);                             // ids for goals 

                    // --- don't need this here! -- //
                    var today = new Date();                                 // get today's date
                    var startDate = today.getMonth() + "-" + today.getDay() + "-" + today.getFullYear();
                    // ---------------------------- //                                
 
                    renderGoal(goal, ids);                           // changed this function 

                    break;
                case "weekly":
                    // feature not yet implemented
                    break;
                case "daily":
                    // feature not yet implemented
                    break;
                default:
                    console.error("invalid goal duration");
            }
        });
    }
    else {
        console.log("No goals located in database");
        document.getElementById("goalsNotFound").style.display = "inline-block";
    }
}

// ??????    should I make separate fetch functions for different parts of the goal, or just grab the ENTIRE database all at once? ????????   NO!!
// fetch goals from database
const getGoals = () => {
    fetch("/getGoals", {method : "get"}).then((response)=>{
        return response.json();
    }).then((data)=> {
        matchGoalType(data);
    });
}


// global function calls
getGoals();           



