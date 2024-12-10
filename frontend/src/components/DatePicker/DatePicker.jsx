import React, { useState } from 'react';
import { DateRangePicker } from "@nextui-org/react";
import { Button, Tooltip } from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import { parseAbsoluteToLocal } from "@internationalized/date";
import './datepicker.css';

const getCurrentISTDate = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; 
  const istDate = new Date(now.getTime() + istOffset);

  return istDate;
};

// Helper function to parse "DD-MM-YYYY HH:mm:ss" date string from backend
const parseDateString = (dateString) => {
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('-');
  const [hours, minutes, seconds] = timePart.split(':');
  return new Date(year, month - 1, day, hours, minutes, seconds);
};

const DatePickerRange = ({ onFilter, rowData }) => {
  const [dateRange, setDateRange] = useState({
    start: parseAbsoluteToLocal(getCurrentISTDate().toISOString()),
    end: parseAbsoluteToLocal(getCurrentISTDate().toISOString()),
  });

  const handleDateChange = (newDateRange) => {
    const { start, end } = newDateRange;

    // Convert start and end to Date objects
    const startDate = new Date(start.year, start.month - 1, start.day, start.hour, start.minute, start.second);
    const endDate = new Date(end.year, end.month - 1, end.day, end.hour, end.minute, end.second);

    console.log(startDate, 'Selected start date');
    console.log(endDate, 'Selected end date');

    // Filter the data based on date range
    const filteredRows = rowData.filter(row => {
      const rowStart = parseDateString(row.start_time);
      const rowEnd = parseDateString(row.end_time);

      console.log(rowStart, 'Parsed row start');
      console.log(rowEnd, 'Parsed row end');

      // Filter rows that fall within the selected date range
      return rowStart >= startDate && rowEnd <= endDate;
    });

    setDateRange(newDateRange);
    onFilter(filteredRows);
    console.log(filteredRows, 'Filtered Rows');
  };

  const handleReset = () => {
    setDateRange(null);
    onFilter(rowData);  // Reset to original data
  };

  return (
    <div className="date-range-container">
      <DateRangePicker
        className="daterang-picker-style"
        description="Please enter your range"
        hideTimeZone
        visibleMonths={2}
        value={dateRange}
        format="MM/DD/YYYY, HH:mm A"
        onChange={handleDateChange}
      />
      <Tooltip title="Reset">
        <Button className="reset-button" color="secondary" onClick={handleReset}>
          <CachedIcon />
        </Button>
      </Tooltip>
    </div>
  );
};

export default DatePickerRange;



// // DateRangeFilter.js
// import React, { useState } from 'react';
// import { DateRangePicker } from "@nextui-org/react";
// import { Button, Tooltip } from '@mui/material';
// import CachedIcon from '@mui/icons-material/Cached';
// import { parseAbsoluteToLocal } from "@internationalized/date";
// import './datepicker.css'
// import dayjs from "dayjs";


// const getCurrentISTDate = () => {
//   const now = new Date();
//   const istOffset = 5.5 * 60 * 60 * 1000; 
//   const istDate = new Date(now.getTime() + istOffset);

//   return istDate;
// };

// const DatePickerRange = ({ onFilter, rowData }) => {
//   const [dateRange, setDateRange] = useState({
//     start: parseAbsoluteToLocal(getCurrentISTDate().toISOString()),
//     end: parseAbsoluteToLocal(getCurrentISTDate().toISOString()),
//   });

//   const handleDateChange = (newDateRange) => {
//     const { start, end } = newDateRange;
// console.log(start,'pppp');
// console.log(end,'qqqq');
// console.log(newDateRange.start,'ffffff');



//     const filteredRows = rowData.filter(row => {
      
//       const rowStart = dayjs(row.start_time);
//       const rowEnd = dayjs(row.end_time);
//       console.log(rowStart,'oooooo');
//       console.log(rowEnd,'tttttt');
//       return (
//         rowStart.isAfter(dayjs(start)) &&
//         rowEnd.isBefore(dayjs(end))
//       );
//       // return rowStart >= start.toDate() && rowEndDate <= end.toDate();
//     });
    

//     setDateRange(newDateRange);
//     onFilter(filteredRows);
//     console.log(filteredRows,'uuuuuuu');
    
//   };

//   const handleReset = () => {
//    setDateRange(null);
//     onFilter(rowData);  // Reset to original data
//   };

//   return (
//     <div className="date-range-container">
//       <DateRangePicker
//         className="daterang-picker-style"
//         description="Please enter your range"
//         hideTimeZone
//         visibleMonths={2}
//         value={dateRange}
//         format="MM/DD/YYYY, HH:mm A"
//         onChange={handleDateChange}
//       />
//       <Tooltip title="Reset">
//         <Button className="reset-button" color="secondary" onClick={handleReset}>
//           <CachedIcon />
//         </Button>
//       </Tooltip>
//     </div>
//   );
// };

// export default DatePickerRange;
// ///////// //



// // DateRangeFilter.js
// import React, { useState } from 'react';
// import { DateRangePicker } from "@nextui-org/react";
// import { Button, Tooltip } from '@mui/material';
// import CachedIcon from '@mui/icons-material/Cached';
// import { parseAbsoluteToLocal } from "@internationalized/date";


// const getCurrentISTDate = () => {
//   const now = new Date();
//   const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
//   const istDate = new Date(now.getTime() + istOffset);

//   const year = istDate.getFullYear();
//   const month = String(istDate.getMonth() + 1).padStart(2, '0');
//   const day = String(istDate.getDate()).padStart(2, '0');
//   const hours = String(istDate.getHours()).padStart(2, '0');
//   const minutes = String(istDate.getMinutes()).padStart(2, '0');
//   const seconds = String(istDate.getSeconds()).padStart(2, '0');

//   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
// };

// const DatePickerRange = ({ onFilter }) => {
//   const [dateRange, setDateRange] = useState({
//     start: parseAbsoluteToLocal(getCurrentISTDate()),
//     end: parseAbsoluteToLocal(getCurrentISTDate()),
//   });

//   const handleDateChange = (newDateRange) => {
//     setDateRange(newDateRange);
//     onFilter(newDateRange);
//   };

//   const handleReset = () => {
//     setDateRange({
//       start: parseAbsoluteToLocal(getCurrentISTDate()),
//       end: parseAbsoluteToLocal(getCurrentISTDate()),
//     });
//     onFilter(null);
//   };

//   return (
//     <div className="date-range-container">
//       <DateRangePicker
//         className="daterang-picker-style"
//         description="Please enter your range"
//         hideTimeZone
//         visibleMonths={2}
//         value={dateRange}
//         format="MM/DD/YYYY, HH:mm A"
//         onChange={handleDateChange}
//       />
//       <Tooltip title="Refresh">
//         <Button className="reset-button" color="secondary" onClick={handleReset}>
//           <CachedIcon />
//         </Button>
//       </Tooltip>
//     </div>
//   );
// };

// export default DatePickerRange;
