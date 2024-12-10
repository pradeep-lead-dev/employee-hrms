import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';

const SupervisorPerformanceTable = ({ data, setExportTableData }) => {
  const [tableData, setTableData] = useState([]);

  // Populate table data from the provided data
  useEffect(() => {
    if (data && data.length > 0) {
      const supervisorData = data.reduce((acc, curr) => {
        if (curr.assignedTo) {
          if (!acc[curr.assignedTo]) {
            acc[curr.assignedTo] = {
              supervisorName: curr.assignedTo,
              totalPackages: 0,
              onTime: 0,
              delayedLoads: 0,
              totalScore: 0,
              count: 0,
            };
          }
          acc[curr.assignedTo].totalPackages += curr.achievedCount || 0;
          acc[curr.assignedTo].onTime += curr.slaMet ? 1 : 0;
          acc[curr.assignedTo].delayedLoads += !curr.slaMet ? 1 : 0;
          acc[curr.assignedTo].totalScore += curr.achievedScore || 0;
          acc[curr.assignedTo].count += 1;
        }
        return acc;
      }, {});

      // Prepare the data for the table
      const formattedData = Object.values(supervisorData).map((item) => ({
        key: item.supervisorName,
        supervisorName: item.supervisorName,
        totalPackages: item.totalPackages,
        onTime: item.onTime,
        delayedLoads: item.delayedLoads,
        performanceScore: item.count > 0 ? item.totalScore / item.count : 0,
      }));

      setTableData(formattedData);
    }
  }, [data]);

  useEffect(()=>{
    setExportTableData(tableData)
  },[tableData])

  // Columns definition for the Antd table
  const columns = [
    {
      title: 'Supervisor Name',
      dataIndex: 'supervisorName',
      key: 'supervisorName',
      filters: tableData.map((item) => ({
        text: item.supervisorName,
        value: item.supervisorName,
      })),
      onFilter: (value, record) => record.supervisorName.includes(value),
      sorter: (a, b) => a.supervisorName.localeCompare(b.supervisorName),
    },
    {
      title: 'Total Packages',
      dataIndex: 'totalPackages',
      key: 'totalPackages',
      sorter: (a, b) => a.totalPackages - b.totalPackages,
    },
    {
      title: 'On Time',
      dataIndex: 'onTime',
      key: 'onTime',
      sorter: (a, b) => a.onTime - b.onTime,
    },
    {
      title: 'Delayed Loads',
      dataIndex: 'delayedLoads',
      key: 'delayedLoads',
      sorter: (a, b) => a.delayedLoads - b.delayedLoads,
    },
    {
      title: 'Performance Score',
      dataIndex: 'performanceScore',
      key: 'performanceScore',
      sorter: (a, b) => a.performanceScore - b.performanceScore,
      render: (score) => {
        let color = 'default';
        if (score <= 70) {
          color = 'red';
        } else if (score > 70 && score < 90) {
          color = 'orange';
        } else if (score >= 90) {
          color = 'green';
        }
        return <Tag color={color}>{score.toFixed(2)}%</Tag>;
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{ pageSize: 5 }}
        rowKey="supervisorName"
      />
    </div>
  );
};

export default SupervisorPerformanceTable;
