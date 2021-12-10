import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "ListdataWebPartStrings";
import Listdata from "./components/Listdata";
import { IListdataProps } from "./components/IListdataProps";
import Load from "../../serviceworker";

export interface IListdataWebPartProps {
  description: string;
}

export default class ListdataWebPart extends BaseClientSideWebPart<IListdataWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IListdataProps> = React.createElement(
      Listdata,
      {
        description: this.properties.description,
        webURL: this.context.pageContext.web.absoluteUrl,
        context: this.context,
      }
    );
    Load(this.context.pageContext.web.absoluteUrl);
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
