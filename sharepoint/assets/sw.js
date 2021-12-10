var CACHE_NAME = 'RASPFXWebpart';


var urlCache = [       
               'sitefav.png',
]
/// install service worker 
this.addEventListener('install',(event)=>{
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache)=>{
            return cache.add(urlCache)
        })
    )
})

// fetch cache data

this.addEventListener('fetch',(event)=>{
    if(!navigator.onLine){
        console.log("offline")
       
        event.respondWith(
            caches.match(event.request)
            .then((response)=>{
                if(response){
                    return response
                }              
                let fUrl = event.request.clone()
                fetch(fUrl)
            })
        )
    }
})
