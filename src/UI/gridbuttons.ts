import {
  DefaultButton,
  PrimaryButton,
} from "office-ui-fabric-react/lib/Button";
import "./grid.css";
const actionCellRenderer = (params) => {
  let eGui = document.createElement("div");

  let editingCells = params.api.getEditingCells();
  // checks if the rowIndex matches in at least one of the editing cells
  let isCurrentRowEditing = editingCells.some((cell) => {
    return cell.rowIndex === params.node.rowIndex;
  });

  if (isCurrentRowEditing) {
    eGui.innerHTML = `
        <button  class="btn btn-success"  data-action="update"> UPDATE  </button>
        <button  class="btn btn-info"  data-action="cancel" > CANCEL </button>
        `;
  } else {
    eGui.innerHTML = `
        <button class="btn btn-primary"  data-action="edit" > EDIT  </button>  
        <button class="btn btn-warning deleteAnchor" data-action="delete"> DELETE  </button>  
        `;
  }

  return eGui;
};

export default actionCellRenderer;
