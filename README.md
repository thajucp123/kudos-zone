# KudosZone
**KudosZone : Javascript & Firebase Project** <br/>
 - Just a simple javascript app that will add, delete data using firebase realtime database. <br/>
 - This app is for employees of a company to gve endorsement(or Kudos) to their collegues to appreciate their work and effort.
 - Used vanilla Javascript and regular CSS.
 - Deployed on Vercel

**Live Demo:** [kudos-zone.vercel.app/](https://kudos-zone.vercel.app/)
<br/>

## Usage:
Users can enter endorsements and click the Publish button, it will get added to firebase and will be shown in the below section.<br/>
When clicking on the like button Kudos item, the like count will be updated on firebase and will be shown in the app. A user can only like an item once.<br/>
When clicking the delete button, the particular item will be deleted in firebase and removed in the app. A user can only delete their own endorsements.

### User system:
As this is a simple app, there is no proper user system. Instead, whenever a user adds new endorsement, a random ID will be added to both the firebase and localstorage (a random number + current timestring).<br/>
This ID is later used to identify the ownership of the endorsement of items<br/>
The only downfall is that this unique ID will be lost when browser history cleared. Such items will forever be ownerless.

## Screenshots:

<img src="assets/screenshots/Screenshot 1.png" height="400"/> <img src="assets/screenshots/Screenshot 2.png" height="400"/>

## Code overview:
**Firebase:** <br/>
importing firebase methods
```
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update, query, orderByChild } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
```
<br/>
initializing app and defining database reference
<br/>

```
const firebaseApp = initializeApp(appSettings);
const database = getDatabase(firebaseApp);
const endorseRef = ref(database,"endorsements"); //our database reference

const endorseDBQuery = query(endorseRef,orderByChild('timestamp')); //we will order the snapshot by timestamp we stored in the objects, orderbyChild will do ascending order by default

```
<br/>
Use the onValue method to do something whenever data changes in firebase database
<br/>

```
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
```
