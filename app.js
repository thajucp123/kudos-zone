import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {getDatabase,ref,push,remove,onValue, update, query, orderByChild} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://kudoszone-fcac8-default-rtdb.asia-southeast1.firebasedatabase.app/"
}


const firebaseApp = initializeApp(appSettings);
const database = getDatabase(firebaseApp);
const endorseRef = ref(database,"endorsements"); //our database reference

const endorseDBQuery = query(endorseRef,orderByChild('timestamp')); //we will order the snapshot by timestamp we stored in the objects, orderbyChild will do ascending order by default

//onValue method is called whenever data changes in firebase
onValue(endorseDBQuery,(snapshot)=>{
   endorsementContainer.innerHTML = ""; //clears previous content before appendingh new

    if(!snapshot.exists()){
        //no snapshot
        appendEmptyItemToEndorsementContainer();
    }
    else{
        let endorsementObjects = Object.entries(snapshot.val()); //the key-value pairs of endorsement object, each value is anotehr object
        endorsementObjects.sort((a, b) => b[1].timestamp - a[1].timestamp); //we sort on decending order of timestamp
        for(let i = 0; i<endorsementObjects.length; i++){
            let currentObject = endorsementObjects[i];
            appendItemsToEndorsmentContainer(currentObject);
        }
    }
})

const endorsementForm = document.getElementById("endorsement-form");
const fromData = document.getElementById("from");
const toData = document.getElementById("to");
const endorementText = document.getElementById("endorsement-text");
const endorsementContainer = document.getElementById("endorsements-container");

endorsementForm.addEventListener("submit",(e)=> {
    if(!validateData(fromData,toData,endorementText)) return;
   e.preventDefault(); //prevents deafault submit behaviour
   const endorseObject = new Object();
   endorseObject.from = (fromData.value == null || fromData.value == '') ? "Unknown" : fromData.value;
   endorseObject.to = toData.value;
   endorseObject.endorseText = endorementText.value;
   endorseObject.like = Number(0);
   endorseObject.timestamp = Date.now();

   //generate a random strig as UniqueuserID and store it in db & localstorage (to check if they are owner of a post)
   let randomNum = Math.floor(Math.random()*10000);
   let currdate = new Date().toLocaleTimeString();
   let UniqueuserID = `${randomNum}-${currdate}`;
   endorseObject.userUniqueId = UniqueuserID;

    //getting posting time
    const currentTime = new Date();
    const dateTimeString = currentTime.toLocaleTimeString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    });
    endorseObject.postTime = dateTimeString;

   localStorage.setItem("userUniqueId",JSON.stringify(UniqueuserID));
   
   //push data to firebase
   push(endorseRef,endorseObject);
   clearInputValue();
})


//for clearing input value from input fields
function clearInputValue() {
    fromData.value = ""; 
    toData.value = "";
    endorementText.value = "";
}

//append empty item if no firebase snapshot exists
function appendEmptyItemToEndorsementContainer() {
    endorsementContainer.innerHTML = "No endorsements yet..";
}

//append items to endorsment container
function appendItemsToEndorsmentContainer(currentObject) {
    //the currentObject has a key and an object of values
    let currentEndorsementID = currentObject[0];
    let endorsementObject = currentObject[1];
    let fromVal = endorsementObject.from;
    let toVal = endorsementObject.to;
    let endorseTextval = endorsementObject.endorseText;
    let likes = endorsementObject.like;
    let UniqueuserID = endorsementObject.userUniqueId;
    let postTime = endorsementObject.postTime;

    //create the new div elements
    let endorseItem = document.createElement("div");
   endorseItem.className = "endorse-item";

    let endorseTop = document.createElement("div");
    endorseTop.className = "endorse-single-line endorse-top";

    let endorseTo = document.createElement("span");
    endorseTo.className = "endorseTo";
    endorseTo.textContent = "To: " + toVal;
    endorseTop.appendChild(endorseTo);

    let deleteButton = document.createElement("span");
    deleteButton.className = "deleteButton";
    let delIcon = document.createElement("i");
    delIcon.className = "fa fa-trash";
    deleteButton.appendChild(delIcon);
    endorseTop.appendChild(deleteButton);

    endorseItem.appendChild(endorseTop);

    let endorseBody = document.createElement("p");
    endorseBody.className = "endorse-body";
    endorseBody.textContent = endorseTextval;
    endorseItem.appendChild(endorseBody);

    let endorseBottom = document.createElement("div");
    endorseBottom.className = "endorse-single-line";

    let endorseFrom = document.createElement("span");
    endorseFrom.className = "endorseFrom";
    endorseFrom.textContent = "From: " + fromVal;
    endorseBottom.appendChild(endorseFrom);

    let postTimeSpan = document.createElement("span");
    postTimeSpan.className = "postTime";
    postTimeSpan.textContent = postTime;
    endorseBottom.appendChild(postTimeSpan);

    let likeCount = document.createElement("span");
    likeCount.className = "likeCount";
    let likeIcon = document.createElement("i");
    likeIcon.className = "fa fa-heart";
    likeCount.appendChild(likeIcon);
    let likesText = document.createElement("span");
    likesText.textContent = ' ' + likes;
    likeCount.appendChild(likesText);
    endorseBottom.appendChild(likeCount); 

    endorseItem.appendChild(endorseBottom);

    //now append to parent container
    endorsementContainer.append(endorseItem);

    let locationOfItemInDB = ref(database, `endorsements/${currentEndorsementID}/`); //defining current item location
    
    //implement likes count
    likeCount.addEventListener("click",()=> {

        let likedEndorsementsLocalData = JSON.parse(localStorage.getItem("likedEndorsements")) || []; //retrieves all liked endorsements of user from local storage if exists
        if(likedEndorsementsLocalData.includes(currentEndorsementID)){
            alert("You have already liked this endorsement!");
            return;
        } 
             
        update(locationOfItemInDB, {
            like: likes + 1
          }).then(()=>{
                console.log("data updated successfully");
                likedEndorsementsLocalData.push(currentEndorsementID);
                localStorage.setItem("likedEndorsements",JSON.stringify(likedEndorsementsLocalData)); //adds current endorsemet ID to liked endorsements list
          }).catch(()=>{
                console.log("update failed");
          });
    })

    deleteButton.addEventListener("click",()=>{

        //first checks if the user id in local & db matches
        let currentUserIDinLocal = JSON.parse(localStorage.getItem("userUniqueId")) || "wrong";
        if(currentUserIDinLocal == UniqueuserID){
            if(confirm("Are you sure to delete?")){
                remove(locationOfItemInDB);
            }
            else return;
        }
        else {
            alert("You are not the owner of this endorsement");
        }

    })

    
}

function validateData(fromData, toData, endorementText) {
    if(fromData.value == "" || toData.value == "" || endorementText.value == ""){
        alert("Please fill all the fields");
        return false;
    }
    else return true;
}