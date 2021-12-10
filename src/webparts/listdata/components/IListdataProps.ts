import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IListdataProps {
  description: string;
  context: WebPartContext;
  webURL: string;
  listName: string;
}
