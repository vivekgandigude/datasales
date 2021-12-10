import * as React from "react";
import styles from "./Listdata.module.scss";
import { IListdataProps } from "./IListdataProps";
import { escape } from "@microsoft/sp-lodash-subset";
import {
  AgGridReact as AgGridReactAdvanced,
  AgGridColumn as AgGridColumnAdvanced,
} from "ag-grid-react";
import actionCellRenderer from "../../../UI/gridbuttons";
import DexieIndexedDB from "../../../IndexedDB/dexieindexeddb";
import ListOperations from "../../../services/restapi.services";
import { Web } from "@pnp/sp/presets/all";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { IStates } from "./IStates";
import gridColumns from "../../../UI/gridcolumns";
import {
  DefaultButton,
  PrimaryButton,
} from "office-ui-fabric-react/lib/Button";

export default class Listdata extends React.Component<IListdataProps, IStates> {
 private SALESRECORDS = "SalesRecords";

 private  listOps = new ListOperations();
 private column = "ID";
 private  order = "asc";
 
  constructor(props) {
    super(props);
    this.state = {
      Items: [],
      ID: "",
      HTML: [],
      Title: "",
      field_1: "",
      field_2: "",
      field_3: "",
      gridApi: [],
      gridColumnApi: [],
      PAGE: 1,
      showSalesDiv: false,
      columns: gridColumns,
    };
    this.onGridReady = this.onGridReady.bind(this);
    this.onCellClicked = this.onCellClicked.bind(this);
    this.onRowEditingStarted = this.onRowEditingStarted.bind(this);
    this.onRowEditingStopped = this.onRowEditingStopped.bind(this);
    this.onAddNewSales = this.onAddNewSales.bind(this);
    this.AddNewSaleData = this.AddNewSaleData.bind(this);
    this.HideSalesData = this.HideSalesData.bind(this);
  }
  private onCellClicked = async (params) => {
    let action;
    try {
      if (
        params.column.colId === "action" &&
        params.event.target.dataset.action
      ) {
        action = params.event.target.dataset.action;

        if (action === "edit") {
          params.api.startEditingCell({
            rowIndex: params.node.rowIndex,
            // gets the first columnKey
            colKey: params.columnApi.getDisplayedCenterColumns()[0].colId,
          });
        }
        if (action === "delete") {
          this.listOps.DeleteData(this.props.webURL, params.data.ID);
          window.location.reload();
        }
        if (action === "update") {
          params.api.stopEditing(false);

          this.setState({
            ID: params.data.ID,
            Title: params.data.Title,
            field_1: params.data.field_1,
            field_2: params.data.field_2,
            field_3: params.data.field_3,
          });
          const item = {
            ID: params.data.ID,
            Title: params.data.Title,
            field_1: params.data.field_1,
            field_2: params.data.field_2,
            field_3: params.data.field_3,
          };
          this.listOps.UpdateData(this.props.webURL, item);
        }

        if (action === "cancel") {
          params.api.stopEditing(true);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  private onRowEditingStarted = (params) => {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true,
    });
  }
  private onRowEditingStopped = (params) => {
    params.api.refreshCells({
      columns: ["action"],
      rowNodes: [params.node],
      force: true,
    });
  }
  private onAddNewSales() {
    this.setState({ Title: "", field_1: "", field_2: "", field_3: "" });

    this.setState({ showSalesDiv: true });
  }
  private AddNewSaleData() {
    if (
      this.state.Title !== "" &&
      this.state.field_1 !== "" &&
      this.state.field_2 !== "" &&
      this.state.field_3 !== ""
    ) {
      this.setState({
        showSalesDiv: false,
      });
      const item = {
        ID: this.state.ID,
        Title: this.state.Title,
        field_1: this.state.field_1,
        field_2: this.state.field_2,
        field_3: this.state.field_3,
      };
      this.listOps.SaveData(this.props.webURL, item);
      this.setState({ Title: "", field_1: "", field_2: "", field_3: "" });
    } else {
      alert("All input fields are mandatory!");
    }
  }
  private onGridReady(params) {
    this.setState({ gridApi: params.api, gridColumnApi: params.columnApi });
    var pageNo = this.state.PAGE;
    let web = Web(this.props.webURL);
    var offset;
    let lastRow;
    var sortColumn = this.column;
    var sortOrder = this.order;
    var sortSetting;
    var filterColumn;
    var filterText = "";
    var filterModel;
    var propertyNames;
    var propertyValues;
    var dOps = new DexieIndexedDB();
    var filterParams: [];
    try {
      const datasource = {
        getRows(params) {
          if (params.startRow === 0 && params.sortModel.length > 0) {
            var colState = params.sortModel;
            sortSetting = colState.filter((s) => {
              return s.sort != null;
            });
            pageNo = 1;
            sortColumn = sortSetting[0].colId;
            sortOrder = sortSetting[0].sort;
          }

          filterModel = params.filterModel;
          propertyNames = Object.keys(filterModel);
          propertyValues = Object.values(filterModel);
          const properties = [];
          if (propertyNames.length > 1) {
            propertyNames.map((item: any, index) => {
              if (item == "ID") {
                properties.push({
                  column: [item],
                  value: Number(propertyValues[index].filter),
                });
              } else {
                properties.push({
                  column: [item],
                  value: propertyValues[index].filter,
                });
              }
            });

            filterParams = properties.reduce(
              (obj, item) => Object.assign(obj, { [item.column]: item.value }),
              {}
            );
            console.log(filterParams);
          }

          if (propertyNames.length > 0) {
            switch (propertyNames[propertyNames.length - 1]) {
              case "Title":
                filterColumn = "Title";
                filterText = filterModel.Title.filter;
                break;
              case "ID":
                filterColumn = "ID";
                filterText = filterModel.ID.filter;
                break;
              case "field_1":
                filterColumn = "field_1";
                filterText = filterModel.field_1.filter;
                break;
              case "field_2":
                filterColumn = "field_2";
                filterText = filterModel.field_2.filter;
                break;
              case "field_3":
                filterColumn = "field_3";
                filterText = filterModel.field_3.filter;
                break;
              default:
                break;
            }
            if (params.startRow == 0) pageNo = 1;
          } else {
            filterColumn = "";
            filterText = "";
            if (params.startRow == 0) pageNo = 1;
          }

          if (pageNo === 1 && sortSetting === undefined && filterText === "") {
            web.lists
              .getByTitle("SalesRecords")
              .items.select("*", "Title")
              .get()
              .then((items) => {
                pageNo++;
                params.successCallback(items, lastRow);
              });
          }
          if (pageNo === 1 && sortSetting !== undefined && filterText === "") {
            offset = (pageNo - 1) * 100;

            dOps
              .sortByColumn(offset, 100, sortColumn, sortOrder)
              .then((items) => {
                params.successCallback(items, lastRow);
                pageNo++;
              });
          }
          if (
            pageNo > 1 &&
            (propertyNames === undefined || propertyNames.length === 0)
          ) {
            offset = (pageNo - 1) * 100;

            dOps
              .sortByColumn(offset, 100, sortColumn, sortOrder)
              .then((items) => {
                params.successCallback(items, lastRow);
                pageNo++;
              });
          }
          if (filterText !== "") {
            if (propertyNames.length == 1) {
              dOps
                .getFilteredListDataByColumn(
                  pageNo,
                  100,
                  filterText,
                  filterColumn
                )
                .then((data: []) => {
                  if (data !== undefined && data.length > 0) {
                    pageNo++;
                    var lastrow;
                    if (data.length < 100) lastrow = data.length;
                    else lastrow = undefined;
                    params.successCallback(data, lastrow);
                  } else {
                    params.successCallback(null, 0);
                  }
                })
                .catch((error) => {
                  console.error(error);
                  params.failCallback();
                });
            } else {
              dOps
                .getFilterData(filterParams, pageNo, 100)
                .then((data: []) => {
                  if (data !== undefined && data.length > 0) {
                    pageNo++;
                    var lastrow;
                    if (data.length < 100) lastrow = data.length;
                    else lastrow = undefined;
                    params.successCallback(data, lastrow);
                  } else {
                    params.successCallback(null, 0);
                  }
                })
                .catch((error) => {
                  console.error(error);
                  params.failCallback();
                });
            }
          }
        },
      };
      params.api.setDatasource(datasource);
    } catch (err) {
      console.log(err);
    }
  }

  private HideSalesData() {
    this.setState({
      showSalesDiv: false,
    });

    this.setState({ Title: "", field_1: "", field_2: "", field_3: "" });
  }
  public render(): React.ReactElement<IListdataProps> {
    return (
      <div>
        {this.props.listName}
        <br />
        <div>
          {!this.state.showSalesDiv && (
            // <button type="button" onClick={this.onAddNewSales}>
            //   + Add Sales Record
            // </button>
            <DefaultButton
              text="+ADD SALES RECORD"
              onClick={this.onAddNewSales}
            />
          )}
        </div>
        <br />
        {this.state.showSalesDiv && (
          <div>
            <div>
              <input
                placeholder="Title"
                value={this.state.Title}
                name="title"
                required={true}
                className={styles.rightMargin}
                onChange={(e) => this.setState({ Title: e.target.value })}
              />
              <input
                placeholder="Country"
                value={this.state.field_1}
                name="country"
                onChange={(e) => this.setState({ field_1: e.target.value })}
              />
              <br />
            </div>
            <div>
              <input
                placeholder="Item Type"
                value={this.state.field_2}
                name="itemType"
                className={styles.rightMargin}
                onChange={(e) => this.setState({ field_2: e.target.value })}
              />
              <input
                placeholder="Sales Channel"
                value={this.state.field_3}
                name="salesChannel"
                onChange={(e) => this.setState({ field_3: e.target.value })}
              />
            </div>
            <br />
            <br />

            <PrimaryButton
              className={styles.rightMargin}
              text="Submit"
              onClick={this.AddNewSaleData}
            />

            <DefaultButton text="Cancel" onClick={this.HideSalesData} />
          </div>
        )}
        <div className="ag-theme-alpine" style={{ height: 400, width: 800 }}>
          <AgGridReactAdvanced
            rowModelType={"infinite"}
            defaultColDef={{
              flex: 1,
              minWidth: 30,
              resizable: true,
            }}
            editType="fullRow"
            sortingOrder={["asc", "desc"]}
            onCellClicked={this.onCellClicked}
            onRowEditingStopped={this.onRowEditingStopped}
            onRowEditingStarted={this.onRowEditingStarted}
            suppressDragLeaveHidesColumns={true}
            suppressMakeColumnVisibleAfterUnGroup={true}
            components={{
              loadingRenderer: (params) => {
                if (params.value !== undefined) {
                  return params.value;
                } else {
                  return '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/images/loading.gif">';
                }
              },
            }}
            rowBuffer={0}
            onGridReady={this.onGridReady}
          >
            {this.state.columns.map((column, index) => {
              return (
                <AgGridColumnAdvanced
                  key={index}
                  field={column.field}
                  sortable={column.sortable}
                  filter={column.filter}
                  headerName={column.headerName}
                  floatingFilter={true}
                  editable={column.editable}
                  suppressMenu={true}
                  cellRenderer={
                    column.cellRenderer ? column.cellRenderer : null
                  }
                />
              );
            })}
            <AgGridColumnAdvanced
              headerName="Action"
              editable={false}
              cellRenderer={actionCellRenderer}
              colId="action"
              suppressMenu={true}
              sortable={false}
              filter={false}
            ></AgGridColumnAdvanced>
          </AgGridReactAdvanced>
        </div>
      </div>
    );
  }
}
