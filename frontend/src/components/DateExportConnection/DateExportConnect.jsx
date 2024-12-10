// ExportButtons.js
import { Button, Tooltip } from "@mui/material";
import ExcelIcon from '@mui/icons-material/InsertDriveFile';
import PdfIcon from '@mui/icons-material/PictureAsPdf';

const ExportButtons = ({ onExportExcel, onExportPdf }) => {
  return (
    <div className="record-exports">
      <Tooltip title="Export Excel">
        <Button className="export-button" onClick={onExportExcel}>
          <ExcelIcon style={{ color: 'green' }} />
        </Button>
      </Tooltip>
      <Tooltip title="Export PDF">
        <Button className="export-button" onClick={onExportPdf}>
          <PdfIcon style={{ color: 'red' }} />
        </Button>
      </Tooltip>
    </div>
  );
};

export default ExportButtons;
