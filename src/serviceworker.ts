import ListOperations from "./services/restapi.services";
import DexieIndexedDB from "./IndexedDB/dexieindexeddb";
export default function Load(url) {
  var swUrl = url + "/SiteAssets/JS/sw.js";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(swUrl)
      .then(
        (registration) => {
          console.log("worker registration is successfull", registration.scope);
          validateData(url);
        },
        (err) => {
          console.log(err);
        }
      )
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.log("Service worker is not supported");
  }
}
function checkValidServiceWorker(swUrl: string): any {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl)
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        console.log(" No service worker found.");
        return false;
      } else {
        console.log(" Service worker found.");
        return true;
      }
    })
    .catch(() => {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
      return false;
    });
}
async function validateData(url) {
  var listOps = new ListOperations();
  var ops = new DexieIndexedDB();
  Promise.all([
    await ops.getMasterInfo(),
    await listOps.getLastModifiedItemInfo(url),
  ])
    .then((data: any) => {
      console.log(data);
      if (data[0] !== undefined) {
        if (data[1] !== undefined && data[0] !== undefined) {
          if (data[0][0].LastModified !== data[1][0].Modified) {
            listOps
              .getLatestItems(url, data[0][0].LastModified)
              .then((items) => {
                ops.addupdateItems(items);
                ops.addLastModifiedInfo(data[1][0]);
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            console.log("no changes in the list!");
          }
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
