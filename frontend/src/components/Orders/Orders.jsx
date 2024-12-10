import React, { useState } from "react";
import Table from "../Table/Table";
import DateRangeFilter from "../DatePicker/DatePicker";
import ExportButtons from "../ExportRecords/ExportRecords";
import "./orders.css";

const Orders = () => {
  const rowData = [
    {
      duration: 111.71143,
      end_time: "05-09-2024 09:16:22",
      green_count: 35,
      id: 268,
      last_updated: "05-09-2024 09:16:42",
      orange_count: 0,
      pink_count: 0,
      start_time: "05-09-2024 09:14:30",
      total_count: 35,
      yellow_count: 0,
    },
    {
      duration: 111.382583,
      end_time: "05-09-2024 09:18:33",
      green_count: 35,
      id: 269,
      last_updated: "05-09-2024 09:18:53",
      orange_count: 0,
      pink_count: 0,
      start_time: "05-09-2024 09:16:42",
      total_count: 35,
      yellow_count: 0,
    },
    {
      duration: 110.148153,
      end_time: "05-09-2024 09:20:43",
      green_count: 35,
      id: 270,
      last_updated: "05-09-2024 09:21:03",
      orange_count: 0,
      pink_count: 0,
      start_time: "05-09-2024 09:18:53",
      total_count: 35,
      yellow_count: 0,
      blue_count: 2,
    },
    {
      duration: 109.177897,
      end_time: "05-09-2024 09:22:53",
      green_count: 35,
      id: 271,
      last_updated: "05-09-2024 09:23:13",
      orange_count: 0,
      pink_count: 0,
      start_time: "05-09-2024 09:21:04",
      total_count: 35,
      yellow_count: 0,
    },
  ];

  const [filteredData, setFilteredData] = useState(rowData);

  const handleDateFilter = (filteredRows) => {
    setFilteredData(filteredRows);
  };

  return (
    <div className="orderpage">
      <div className="  ">
        <div className="order-export">
          <ExportButtons rowData={filteredData} />
        </div>
      </div>
      <div>
        <Table rowData={filteredData} />
      </div>
    </div>
  );
};

export default Orders;
