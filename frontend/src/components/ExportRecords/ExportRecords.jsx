import React from 'react';
import { Button, Tooltip } from '@mui/material';
import ExcelIcon from '@mui/icons-material/InsertDriveFile'; 
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const ExportRecord = ({ columnDefs = [], rowData = [], position = 'left' }) => {

  const exportToXlsx = () => {
    const ws = XLSX.utils.json_to_sheet(rowData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'table-data.xlsx');
  };

  const positionStyles = {
    left: { justifyContent: 'flex-start' },
    center: { justifyContent: 'center' },
    right: { justifyContent: 'flex-end' }
  };

   const exportToPdf = () => {
    const doc = new jsPDF();
    doc.text('Table Data', 20, 10);
    doc.autoTable({
      head: [columnDefs.map(col => col.headerName)],
      body: rowData.map(row => columnDefs.map(col => row[col.field])),
      startY: 20,
    });
    doc.save('table-data.pdf');
  };
//   const exportToPdf = () => {
//     console.log(columnDefs,'sdfghj');
// console.log(rowData,'wertyu');
//     if ( rowData.length === 0) {
//       console.error("No column definitions or data available to export");
//       return;
//     }else{


//     const doc = new jsPDF();
//     const tableColumn = columnDefs.map(col => col.headerName || col.field);  
//     const tableRows = rowData.map(row => columnDefs.map(col => row[col.field] || ""));  
// console.log(tableColumn,'kkk');
// console.log(tableRows,'ggg');


//     doc.text('Table Data', 14, 15);
//     doc.autoTable({
//       head: [tableColumn],
//       body: tableRows,
//       startY: 20,
//     });
//     doc.save('table-data.pdf');
//   };
//   }
  return (
    <div className="export-buttons-container"
    style={{ display: 'flex', ...positionStyles[position], margin: '10px 0' }}
>
      <Tooltip title="Export Excel">
        <Button className="export-button" onClick={exportToXlsx}>
          <ExcelIcon style={{ color: 'green' }} />
        </Button>
      </Tooltip>
      <Tooltip title="Export PDF">
        <Button className="export-button" onClick={exportToPdf}>
          <PdfIcon style={{ color: 'red' }} />
        </Button>
      </Tooltip>
    </div>
  );
};

export default ExportRecord;








// // ExportButtons.js
// import React from 'react';
// import { Button, Tooltip } from '@mui/material';
// import ExcelIcon from '@mui/icons-material/InsertDriveFile'; 
// import PdfIcon from '@mui/icons-material/PictureAsPdf';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';


// const ExportRecord = ({ columnDefs, rowData }) => {
  
//   const exportToXlsx = () => {
//     const ws = XLSX.utils.json_to_sheet(rowData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//     XLSX.writeFile(wb, 'table-data.xlsx');
//   };

//   const exportToPdf = () => {
//     const doc = new jsPDF();
//     doc.text('Table Data', 20, 10);
//     doc.autoTable({
//       head: [columnDefs.map(col => col.headerName)],
//       body: rowData.map(row => columnDefs.map(col => row[col.field])),
//       startY: 20,
//     });
//     doc.save('table-data.pdf');
//   };

//   return (
//     <div className="export-buttons-container">
//       <Tooltip title="Export Excel">
//         <Button className="export-button" onClick={exportToXlsx}>
//           <ExcelIcon style={{ color: 'green' }} />
//         </Button>
//       </Tooltip>
//       <Tooltip title="Export PDF">
//         <Button className="export-button" onClick={exportToPdf}>
//           <PdfIcon style={{ color: 'red' }} />
//         </Button>
//       </Tooltip>
//     </div>
//   );
// };

// export default ExportRecord;
