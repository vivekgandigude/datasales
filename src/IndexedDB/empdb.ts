import Dexie from "dexie";

const empdb = new Dexie("EmpDBList");
empdb.version(3).stores({ SalesRecords: "ID,Title,field_1,field_2,field_3" });

export default empdb;
