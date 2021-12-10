import Dexie from "dexie";

const masterdb = new Dexie("MasterInfo");
masterdb.version(1).stores({ DataInfo: "ID,LastModified" });

export default masterdb;