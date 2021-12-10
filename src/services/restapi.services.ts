import { Web } from "@pnp/sp/presets/all";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import DexieIndexedDB from "../IndexedDB/dexieindexeddb";
import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions,
} from "@microsoft/sp-http";
import { IChangeQuery } from "@pnp/sp";
export default class ListOperations {
  private changeQuery: IChangeQuery = {
    Item: true,
    Add: true,
    Update: true,

    ChangeTokenStart: {
      StringValue:
        "1;3;9d0f96f1-262f-44ed-9bb1-be301cfde7eb;637741187092000000;406949016", //"1;3;feab8fcd-8702-4944-acbc-4c80fb35480e;637740480524700000;884959713",
    },
  };

  private SALESRECORDS = "SalesRecords";
  private dexieOps = new DexieIndexedDB();
  public async getListemCount(url) {
    var web = Web(url);
    await web.lists
      .getByTitle(this.SALESRECORDS)
      .get()
      .then((result) => {
        console.log(result.ItemCount);
      });
  }
  public async getLastModifiedItemInfo(url) {
    var web = Web(url);
    return new Promise((resolve, reject) => {
      web.lists
        .getByTitle(this.SALESRECORDS)
        .items.top(1)
        .orderBy("Modified", false)
        .get()
        .then((items: any[]) => {
          resolve(items);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
  public async getAllListItems(url) {
    var web = Web(url);
    console.log("before: ", new Date());
    await web.lists
      .getByTitle(this.SALESRECORDS)
      .items.getAll()
      .then((allItems) => {
        console.log(allItems.length);
        this.dexieOps.addBulkDataToIndexedDB(allItems);
      });
  }
  public async UpdateData(url, item) {
    let web = Web(url);
    await web.lists
      .getByTitle(this.SALESRECORDS)
      .items.getById(item.ID)
      .update({
        Title: item.Title,
        field_1: item.field_1,
        field_2: item.field_2,
        field_3: item.field_3,
      })
      .then((i) => {
        if (i) {
          this.dexieOps.udpdatesListItem(item.ID, item).then((result) => {
            console.log(result);
          });
        }
      });
    alert("Updated Successfully");
  }

  public async DeleteData(url, ID) {
    let web = Web(url);
    await web.lists
      .getByTitle(this.SALESRECORDS)
      .items.getById(ID)
      .delete()
      .then((i: any) => {
        if (i) {
          this.dexieOps.deleteListItem(ID);
        }
      });
    alert("Deleted Successfully");
  }

  public async SaveData(url, item) {
    let web = Web(url);
    await web.lists
      .getByTitle(this.SALESRECORDS)
      .items.add({
        Title: item.Title,
        field_1: item.field_1,
        field_2: item.field_2,
        field_3: item.field_3,
      })
      .then((i) => {
        if (i) {
          this.dexieOps.addListItem(i.data.ID, item).then((result) => {
            console.log(result);
          });
        }
      });
    alert("Created Successfully");
  }

  public getListChangeToken(url) {
    let web = Web(url);

    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(this.SALESRECORDS)
        .getListItemChangesSinceToken({
          RowLimit: "1",
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public getRecentListChanges(url: string, changeToken: any) {
    let web = Web(url);
    return new Promise(async (resolve, reject) => {
      const list = await web.lists.getByTitle(this.SALESRECORDS);
      const items = await list
        .getChanges({
          Item: true,
          Add: true,
          Update: true,
          ChangeTokenStart: changeToken,
        })
        .catch((error) => {
          reject(error);
        });
      resolve(items);
    });
  }
  public getLatestChangeToken(url: string) {
    let web = Web(url);
    debugger;
    return new Promise(async (resolve, reject) => {
      let changeToken;
      let run = true;
      while (run) {
        const items = await web.lists.getByTitle(this.SALESRECORDS).getChanges({
          Item: true,
          Add: true,
          Update: true,
          ...(changeToken ? { ChangeTokenStart: changeToken } : {}),
        });
        run = items.length > 0;
        if (run) changeToken = items[items.length - 1].ChangeToken;
      }

      console.log(changeToken);
      resolve(changeToken);
    }).catch((error) => {
      console.log(error);
    });
  }
  public getListChanges(url, context) {
    let requestUrl =
      url +
      "/_api/web/Lists/GetByTitle('" +
      this.SALESRECORDS +
      "')/GetListItemChangesSinceToken";

    context.spHttpClient
      .get(requestUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          response
            .json()
            .then((responseJSON) => {
              if (responseJSON != null && responseJSON.value != null) {
                let data = responseJSON;
                console.log(data);
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.log(response.json());
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  public getLatestItems(url, dateValue) {
    let web = Web(url);
    return new Promise(async (resolve, reject) => {
      await web.lists
        .getByTitle(this.SALESRECORDS)
        .items.filter("Modified ge datetime" + "'" + dateValue + "'")
        .getAll()
        .then((result) => {
          resolve(result);
          console.log(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
