/*********************************
* ## SERVICE WORKERS ##
* With thanks to: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
* Install - caches all resources
* Activate - does nothing atm.
* Fetch - returns a clone of the requested object if it is cached
*********************'************/

// triggers when the service worker is first started
// starts an install script that caches all resources
self.addEventListener('install', (event) => {
  console.log('Inside the install handler:', event);
  // Extend the life of install event until it has passed a promise
  event.waitUntil(
    //Caches all resources first time
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/offline.html',
        '/index.html',
        '/assets/js/app.js',
        '/assets/icons/favicon.ico',
        '/assets/icons/proxime-icon.png',
        '/assets/icons/proxime-icon-white.png',
        '/assets/css/main.css',
      ]);
    })
  );
});

// triggers once the on-install is completed
// activate is usually used to clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Inside the activate handler:', event);
});

// gets called every time user 'updates' page - refresh or interact
// respondWith 'hijacks' the request and responds accordingly
self.addEventListener('fetch', function(event) {
  event.respondWith(
    // open the cache called v1
    caches.open('v1').then(function(cache) {
      // if the cache matches the request then return that
      return cache.match(event.request).then(function (response) {
        // return the response or if no match then fetch the request and
        // put a clone of the response into our cache, then return the original
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          console.log('Inside the fetch handler:', event);
          return response;
        });
        // if there is no network and no cached files, serve the offline.html page
      })
    }).catch(() =>{
      return caches.match('/offline.html');
    })
  );
});