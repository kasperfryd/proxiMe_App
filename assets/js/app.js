/*#################################################################################
 # Applet - 'ProxiMe'                                                        
 #                                                                        
 #  Purpose:                                                                     
 #   - to help people find out what is happening around them, wherever they are     
 #                                                                          
 #  How: By getting geolocation data and then try to                                  
 #   - fetch nearby wiki articles as well as the local name of the area you are in  
 #                                                                                                        
 #################################################################################*/


//If serviceworker is available in the browser
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}

// Set variables needed
var mainContainer = document.getElementById('main-container');
var rangeOut = document.getElementById('rangeBtn');
var rangeIn = document.getElementById('range')
var topTitle = document.getElementById('top-title');
var elArr = [];
var savedData;
var lat;
var long;
var range = 10;
var options = {
  enableHighAccuracy: true,
  timeout: 50000,
  maximumAge: 0
};

// Runs once the geolocation quary returns as a 'success' callback method
// Get coordinates and do a fetch for nearby wiki articles and city name / location
function success(pos) {
  let url;
  let crd = pos.coords;
  let lat = crd.latitude;
  let long = crd.longitude;

  if (!range == "" || !range == undefined || !range == 0){
    range = range*1000;
    //console.log(range);
    url = `https://en.wikipedia.org/w/api.php?&format=json&origin=*&action=query&generator=geosearch&prop=coordinates|pageimages&piprop=thumbnail&pithumbsize=400&ggscoord=${lat}|${long}&ggsradius=${range}&ggslimit=50`;
  }

  let geoURL = `https://geocode.xyz/${lat},${long}?json=1'`;

  // Fetch wiki articles
  fetch(url,
    {
      method: "GET"
    })
    .then((response) => {
      let data = response.json();
      return data;
    })
    .then((res) => {
      console.log("FETCH COMPLETED")
     // console.log(res);
      displayResults(res.query);
    });

    // Fetch city
    fetch(geoURL)
    .then((res) => {
      let data = res.json();
      return data;
    })
    .then((resp) =>{
      console.log(resp);
      saveCity(resp);
    })

}

// Save the city name and display it
function saveCity(resp){
  city_name = resp.osmtags.name;
  topTitle.innerHTML = `<h1>in<br> ${city_name}<br> you can find: </h1>`;

}

// Convert object to array, then create new wiki objects according to data, 
// then push those to array, then run pushItems on all of the objects.
function displayResults(res) {
  savedData = res.pages;
  let dataArr = Object.values(savedData);

  for (x = 0; x < dataArr.length; x++) {
    if (!dataArr[x].thumbnail == "") {
      let newEL = new wikiArticle(dataArr[x].pageid, dataArr[x].title, dataArr[x].thumbnail.source, dataArr[x].thumbnail.width, dataArr[x].thumbnail.height);
      elArr.push(newEL);
    }
  }

  for (y = 0; y < elArr.length; y++) {
    pushItem(elArr[y]);
  }
}

// Error checking for navigator
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

// Function to push wiki data to the main container
function pushItem(item) {
  let a = document.createElement('figure');
  a.setAttribute('id', `${item.pageid}`);
  a.setAttribute('onclick', 'openMore(this.id)');
  a.classList.add('card');
  a.innerHTML = `<h2 class="title">${item.title}</h2><img alt="wikiArticle#${item.pageid}" src="${item.src}" class="img">`
  mainContainer.append(a);
}

// Function to grab ID and open wiki article when user clicks on image
function openMore(id) {
  window.location = `http://en.m.wikipedia.org/?curid=${id}`
 // console.log(id);
}

// Runs once user clicks the update button, clears all previous content and restarts in another geo fetch
function update(){
  elArr.length = 0;
  mainContainer.innerHTML = "";
  range = document.getElementById('range').value;
  navigator.geolocation.getCurrentPosition(success, error, options);
}

// Display the current slider value
rangeIn.innerHTML = range;

// Update the current slider value on every input
rangeIn.oninput = function() {
  rangeOut.innerHTML ="Search within " + this.value + " km";
}

// Start geolocater on load
window.onload = () => {
  navigator.geolocation.getCurrentPosition(success, error, options);
}

// Object constructor to create wiki articles
function wikiArticle(pageid, title, src, width, height) {
  this.pageid = pageid,
    this.title = title,
    this.src = src,
    this.width = width,
    this.height = height
}