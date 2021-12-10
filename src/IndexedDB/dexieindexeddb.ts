import empdb from "./empdb";
import masterdb from "./masterinfoservice";

const SPLISTDATASET = "SalesRecords";
const MASTERINFO = "DataInfo";
export default class DexieIndexedDB {
  public addBulkDataToIndexedDB(data) {
    return new Promise((resolve, reject) => {
      if (
        empdb.table(SPLISTDATASET) !== null ||
        empdb.table(SPLISTDATASET) !== undefined
      ) {
        empdb.table(SPLISTDATASET).clear();
        console.log("data clear!");
      }
      empdb
        .table(SPLISTDATASET)
        .bulkAdd(data)
        .then((data) => {
          resolve(data);
          console.log("data added!");
          console.log("after: ", new Date());
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
  public sortByColumn(offset, limit, column, order) {
    return new Promise(async (resolve, reject) => {
      console.log(offset, limit);
      console.log(column, order);
      if (order === "desc") {
        empdb
          .table(SPLISTDATASET)
          .orderBy(column)
          .reverse()
          .offset(offset)
          .limit(limit)
          .toArray()
          .then((results) => {
            resolve(results);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      } else {
        empdb
          .table(SPLISTDATASET)
          .orderBy(column)
          .offset(offset)
          .limit(limit)
          .toArray()
          .then((results) => {
            resolve(results);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      }
    });
  }

  public getFilteredListDataByColumn(offset, limit, filterText, filterColumn) {
    return new Promise(async (resolve, reject) => {
      if (filterColumn == "ID") {
        empdb
          .table(SPLISTDATASET)
          .where(filterColumn)
          .equals(Number(filterText))
          .toArray()
          .then((results) => {
            const paginate = results.slice(
              (offset - 1) * limit,
              offset * limit
            );
            resolve(paginate);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      } else {
        empdb
          .table(SPLISTDATASET)
          .where(filterColumn)
          .equalsIgnoreCase(filterText)
          .toArray()
          .then((results) => {
            const paginate = results.slice(
              (offset - 1) * limit,
              offset * limit
            );
            resolve(paginate);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      }
    });
  }
  public getItemByID(itemID: number) {
    return new Promise(async (resolve, reject) => {
      empdb
        .table(SPLISTDATASET)
        .where("ID")
        .equals(itemID)
        .toArray()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  public getFilterData(columns: {}, offset, limit) {
    return new Promise((resolve, reject) => {
      empdb
        .table(SPLISTDATASET)
        .where(columns)
        .toArray()
        .then((result) => {
          const paginate = result.slice((offset - 1) * limit, offset * limit);
          resolve(paginate);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }
  public addListItem(id, salesdata) {
    return new Promise(async (resolve, reject) => {
      empdb
        .table(SPLISTDATASET)
        .add({
          ID: id,
          Title: salesdata.Title,
          field_1: salesdata.field_1,
          field_2: salesdata.field_2,
          field_3: salesdata.field_3,
        })
        .then((updated) => {
          if (updated) resolve(updated);
          else reject("error");
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  public udpdatesListItem(id, salesdata) {
    return new Promise(async (resolve, reject) => {
      empdb
        .table(SPLISTDATASET)
        .update(id, {
          Title: salesdata.Title,
          field_1: salesdata.field_1,
          field_2: salesdata.field_2,
          field_3: salesdata.field_3,
        })
        .then((updated) => {
          if (updated) {
            resolve(updated);
          } else {
            console.log("error");
            reject("error");
          }
        })
        .catch((error) => {
          console.error("error : " + error);
        });
    });
  }

  public deleteListItem(id) {
    return new Promise(async (resolve, reject) => {
      empdb
        .table(SPLISTDATASET)
        .where("ID")
        .equals(id)
        .delete()
        .then((deleteCount) => {
          resolve(deleteCount);
        })
        .catch((error) => {
          console.error("Error: " + error);
          reject(error);
        });
    });
  }

  public getMasterInfo() {
    return new Promise((resolve, reject) => {
      masterdb
        .table(MASTERINFO)
        .orderBy("ID")
        .toArray()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }
  public addLastModifiedInfo(item) {
    return new Promise((resolve, reject) => {
      if (
        masterdb.table(MASTERINFO) !== null ||
        masterdb.table(MASTERINFO) !== undefined
      ) {
        masterdb.table(MASTERINFO).clear();
      }
      masterdb
        .table(MASTERINFO)
        .add({
          ID: item.ID,
          LastModified: item.Modified,
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public addupdateItems(items) {
    items.map(async (item) => {
      var itemExists: any = await this.getItemByID(item.ID);
      if (itemExists.length > 0) {
        this.udpdatesListItem(item.ID, item);
      } else {
        this.addListItem(item.ID, item);
      }
    });
  }
}
