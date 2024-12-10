import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import axios from "axios";
import { Grid, Card, CardContent, Typography, useMediaQuery } from '@mui/material';
import Chart from "react-apexcharts";
import { DatePicker } from 'antd'; // Ant Design Date Range Picker
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { AuthContext } from "../../context/AuthContext";
import week from "./week.png";
import today from "./today.png";
import month from "./month.png";
import year from "./year.png";
import back1 from "./border.svg";
import { Select } from 'antd';
const { Option } = Select;
import Header from "../../components/Header/Header";
import './Dashboard.css';  // Import your custom CSS file
import { Avatar, Flex, Segmented } from 'antd';
import { Table, Tag, Spin } from "antd";


// Importing icons
import { TfiPackage } from "react-icons/tfi";
import { GrUserWorker } from "react-icons/gr";
import { AgGridReact } from "@ag-grid-community/react";
import Export from "../../components/Export/Export";
import FunnelChart from "../../components/FunnelChart/FunnelChart";
import PieChart from "../../components/Dashboard/PieChart";
import HorizontalBarChart from "../../components/Dashboard/HorizontalBarChart";
import DonutChart from "../../components/Dashboard/DonutChart";
import PerformanceTable from "../../components/Dashboard/PerformanceTable";

const { RangePicker } = DatePicker;

dayjs.extend(isBetween);

// Utility function to capitalize first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Utility function to convert snake case to title case
const formatLabel = (label) => {
  return label
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const Dashboard = () => {
  const [selectedSegment, setSelectedSegment] = useState('Load Statistics');
  const [data, setData] = useState([]);
  const [objectData, setObjectData] = useState([]); // Store objectData in state
  const { token, defaultToken, user } = useContext(AuthContext);
  const [chartData, setChartData] = useState({
    lineChartData: Array(24).fill(0),
    barChartData: { weeklyCategories: [], weeklyCounts: [], monthlyCategories: [], monthlyCounts: [] },
    donutLabels: [],
    donutChartData: [],
  });
  const [selectedLabelIndex, setSelectedLabelIndex] = useState(null);
  const chartRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [filteredLineData, setFilteredLineData] = useState(chartData.lineChartData);
  const [filteredBarData, setFilteredBarData] = useState(chartData.barChartData);
  const [filteredDonutData, setFilteredDonutData] = useState({ donutLabels: [], donutChartData: [] });
  const [employeePerformanceData, setEmployeePerformanceData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Add selectedEmployee state


  const [employeeData, setEmployeeData] = useState(
    // [
    //   {
    //     _id: "727080",
    //     refId: "66563",
    //     startTime: "2024-10-14T07:50:00",
    //     endTime: "2024-10-14T08:13:00",
    //     taskName: "weighbridgeIn",
    //     duration: 23.0,
    //     assignedTo: "Maheshwari",
    //     achievedCount: 165,
    //     slaMet: true,
    //     achievedScore: 92.5,
    //   },
    //   {
    //     _id: "200601",
    //     refId: "91127",
    //     startTime: "2024-10-12T11:37:00",
    //     endTime: "2024-10-12T12:02:00",
    //     taskName: "weighbridgeIn",
    //     duration: 25.0,
    //     assignedTo: "Sudhakar",
    //     achievedCount: 98,
    //     slaMet: true,
    //     achievedScore: 87.0,
    //   },
    //   {
    //     _id: "206242",
    //     refId: "04288",
    //     startTime: "2024-10-11T08:43:00",
    //     endTime: "2024-10-11T09:38:00",
    //     taskName: "loading",
    //     duration: 55.0,
    //     assignedTo: "Prabhu Shankar",
    //     achievedCount: 117,
    //     slaMet: true,
    //     achievedScore: 95.3,
    //   },
    //   {
    //     _id: "252373",
    //     refId: "22077",
    //     startTime: "2024-10-16T13:47:00",
    //     endTime: "2024-10-16T14:46:00",
    //     taskName: "loading",
    //     duration: 59.0,
    //     assignedTo: "Surasu",
    //     achievedCount: 193,
    //     slaMet: true,
    //     achievedScore: 88.4,
    //   },
    //   {
    //     _id: "493634",
    //     refId: "41468",
    //     startTime: "2024-10-16T01:32:00",
    //     endTime: "2024-10-16T02:07:00",
    //     taskName: "unloading",
    //     duration: 35.0,
    //     assignedTo: "Kala",
    //     achievedCount: 123,
    //     slaMet: false,
    //     achievedScore: 67.8,
    //   },
    //   {
    //     _id: "170725",
    //     refId: "52937",
    //     startTime: "2024-10-16T11:34:00",
    //     endTime: "2024-10-16T12:34:00",
    //     taskName: "unloading",
    //     duration: 60.0,
    //     assignedTo: "Kala",
    //     achievedCount: 198,
    //     slaMet: false,
    //     achievedScore: 72.4,
    //   },
    //   {
    //     _id: "795266",
    //     refId: "99074",
    //     startTime: "2024-10-16T10:01:00",
    //     endTime: "2024-10-16T10:07:00",
    //     taskName: "unloading",
    //     duration: 16.0,
    //     assignedTo: "Thenmozhi",
    //     achievedCount: 95,
    //     slaMet: false,
    //     achievedScore: 65.5,
    //   },
    //   {
    //     _id: "532517",
    //     refId: "87175",
    //     startTime: "2024-10-16T16:12:00",
    //     endTime: "2024-10-16T17:08:00",
    //     taskName: "loading",
    //     duration: 56.0,
    //     assignedTo: "Surasu",
    //     achievedCount: 154,
    //     slaMet: false,
    //     achievedScore: 78.9,
    //   },
    //   {
    //     _id: "056608",
    //     refId: "12469",
    //     startTime: "2024-10-16T11:49:00",
    //     endTime: "2024-10-16T12:31:00",
    //     taskName: "awaitingLoading",
    //     duration: 42.0,
    //     assignedTo: "Siva",
    //     achievedCount: 188,
    //     slaMet: true,
    //     achievedScore: 91.0,
    //   },
    //   {
    //     _id: "254179",
    //     refId: "17456",
    //     startTime: "2024-10-16T08:32:00",
    //     endTime: "2024-10-16T09:21:00",
    //     taskName: "loading",
    //     duration: 49.0,
    //     assignedTo: "Rajesh",
    //     achievedCount: 192,
    //     slaMet: true,
    //     achievedScore: 93.6,
    //   },
    //   {
    //     _id: "123480",
    //     refId: "46924",
    //     startTime: "2024-10-16T01:58:00",
    //     endTime: "2024-10-16T02:37:00",
    //     taskName: "unloading",
    //     duration: 39.0,
    //     assignedTo: "Uma",
    //     achievedCount: 108,
    //     slaMet: false,
    //     achievedScore: 74.3,
    //   },
    //   {
    //     _id: "679591",
    //     refId: "03521",
    //     startTime: "2024-10-16T03:32:00",
    //     endTime: "2024-10-16T04:43:00",
    //     taskName: "weighbridgeIn",
    //     duration: 38.0,
    //     assignedTo: "Kavitha",
    //     achievedCount: 80,
    //     slaMet: true,
    //     achievedScore: 89.5,
    //   },
    //   {
    //     _id: "9675012",
    //     refId: "91238",
    //     startTime: "2024-10-16T10:22:00",
    //     endTime: "2024-10-16T10:42:00",
    //     taskName: "awaitingLoading",
    //     duration: 20.0,
    //     assignedTo: "Manikandan",
    //     achievedCount: 111,
    //     slaMet: false,
    //     achievedScore: 69.8,
    //   },
    //   {
    //     _id: "8054513",
    //     refId: "71388",
    //     startTime: "2024-10-16T13:08:00",
    //     endTime: "2024-10-16T14:04:00",
    //     taskName: "loading",
    //     duration: 56.0,
    //     assignedTo: "Tamilselvi",
    //     achievedCount: 169,
    //     slaMet: false,
    //     achievedScore: 83.2,
    //   },
    //   {
    //     _id: "1297314",
    //     refId: "00759",
    //     startTime: "2024-10-16T06:33:00",
    //     endTime: "2024-10-16T07:07:00",
    //     taskName: "weighbridgeIn",
    //     duration: 34.0,
    //     assignedTo: "Karthik",
    //     achievedCount: 159,
    //     slaMet: false,
    //     achievedScore: 66.4,
    //   },
    //   {
    //     _id: "4507315",
    //     refId: "62488",
    //     startTime: "2024-10-16T14:26:00",
    //     endTime: "2024-10-16T14:45:00",
    //     taskName: "weighbridgeIn",
    //     duration: 19.0,
    //     assignedTo: "Uma",
    //     achievedCount: 181,
    //     slaMet: false,
    //     achievedScore: 77.3,
    //   },
    //   {
    //     _id: "4271916",
    //     refId: "70045",
    //     startTime: "2024-10-16T05:26:00",
    //     endTime: "2024-10-16T06:19:00",
    //     taskName: "unloading",
    //     duration: 53.0,
    //     assignedTo: "Tamilselvi",
    //     achievedCount: 102,
    //     slaMet: true,
    //     achievedScore: 88.1,
    //   },
    //   {
    //     _id: "4573117",
    //     refId: "48473",
    //     startTime: "2024-10-16T07:07:00",
    //     endTime: "2024-10-16T07:18:00",
    //     taskName: "weighbridgeIn",
    //     duration: 11.0,
    //     assignedTo: "Surasu",
    //     achievedCount: 184,
    //     slaMet: true,
    //     achievedScore: 90.2,
    //   },
    //   {
    //     _id: "0079118",
    //     refId: "35076",
    //     startTime: "2024-10-16T00:28:00",
    //     endTime: "2024-10-16T00:46:00",
    //     taskName: "awaitingLoading",
    //     duration: 18.0,
    //     assignedTo: "Sanmugam",
    //     achievedCount: 149,
    //     slaMet: false,
    //     achievedScore: 68.9,
    //   }]
    []
  )

  const [filteredEmployeeData, setFilteredEmployeeData] = useState(employeeData)
  const [showChart, setShowChart] = useState(true)
  const [exportTableData, setExportTableData] = useState([])

  useEffect(() => {
    setFilteredEmployeeData(employeeData)
  }, [employeeData])


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/history`, {
          headers: {
            Authorization: `Bearer ${defaultToken}`,
          },
        });

        const fetchedData = (response.data.data).filter(data => {
          return (data.taskName == 'loading')
        })
        setEmployeeData(fetchedData)
      }
      catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      }
    }

    fetchData()
  }, [])




  // Eror handling state
  const [error, setError] = useState(null);
  const paginationPageSizeSelector = useMemo(() => {
    return [10, 20, 50, 100];
  }, []);

  const gridLevelData = [
    {
      SupervisorName: "Supervisor 1",
      TotalLoads: 32445,
      OnTime: 1,
      DelayedTime: 2,
      PerformanceScore: 86.67
    },
    {
      SupervisorName: "Supervisor 2",
      TotalLoads: 22058,
      OnTime: 1,
      DelayedTime: 1,
      PerformanceScore: 75.00
    },
    {
      SupervisorName: "Supervisor 3",
      TotalLoads: 12056,
      OnTime: 0,
      DelayedTime: 1,
      PerformanceScore: 100.00
    },
    {
      SupervisorName: "Supervisor 4",
      TotalLoads: 22030,
      OnTime: 0,
      DelayedTime: 1,
      PerformanceScore: 80.00
    },
    {
      SupervisorName: "Supervisor 5",
      TotalLoads: 31079,
      OnTime: 1,
      DelayedTime: 0,
      PerformanceScore: 70.00
    }
  ];
  const gridLevelColumns = [
    {
      title: "Supervisor Name",
      dataIndex: "SupervisorName",
      key: "SupervisorName",
      filters: [
        { text: "Supervisor 1", value: "Supervisor 1" },
        { text: "Supervisor 2", value: "Supervisor 2" },
        { text: "Supervisor 3", value: "Supervisor 3" },
        { text: "Supervisor 4", value: "Supervisor 4" },
        { text: "Supervisor 5", value: "Supervisor 5" },
      ],
      onFilter: (value, record) => record.SupervisorName.includes(value),
      sorter: (a, b) => a.SupervisorName.localeCompare(b.SupervisorName),
    },
    {
      title: "Total Packages",
      dataIndex: "TotalLoads",
      key: "TotalLoads",
      sorter: (a, b) => a.TotalLoads - b.TotalLoads,
    },
    {
      title: "On Time",
      dataIndex: "OnTime",
      key: "OnTime",
      sorter: (a, b) => a.OnTime - b.OnTime,
    },
    {
      title: "Delayed Time",
      dataIndex: "DelayedTime",
      key: "DelayedTime",
      sorter: (a, b) => a.DelayedTime - b.DelayedTime,
    },
    {
      title: "Performance Score",
      key: "PerformanceScore",
      dataIndex: "PerformanceScore",
      sorter: (a, b) => a.PerformanceScore - b.PerformanceScore,
      render: (score) => {
        let color = "default";
        if (score <= 70) {
          color = "red";
        } else if (score > 70 && score < 90) {
          color = "orange";
        } else if (score >= 90) {
          color = "green";
        }
        return <Tag color={color}>{score.toFixed(2)}%</Tag>;
      },
      filters: [
        { text: "Below 70", value: "below70" },
        { text: "Between 70 and 90", value: "70to90" },
        { text: "Above 90", value: "above90" },
      ],
      onFilter: (value, record) => {
        if (value === "below70") return record.PerformanceScore < 70;
        if (value === "70to90") return record.PerformanceScore >= 70 && record.PerformanceScore <= 90;
        if (value === "above90") return record.PerformanceScore > 90;
        return false;
      },
    },
  ];

  // Fetch data from the server
  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/master`, {
        headers: {
          Authorization: `Bearer ${defaultToken}`,
        },
      });

      const fetchedData = response.data.data;

      // Check if the fetched data is valid
      if (!fetchedData || !Array.isArray(fetchedData)) {
        throw new Error("Invalid data format from the API");
      }

      // Calculate hourly data for the line chart (today's data by default)
      const hourlyDataForToday = Array(24).fill(0);
      const today = dayjs().format("YYYY-MM-DD");  // Get today’s date
      const currentHour = dayjs().hour(); // Get current hour

      fetchedData.forEach((item) => {
        const itemDate = dayjs(item.departureTime).format("YYYY-MM-DD");
        const departureHour = dayjs(item.departureTime).hour();

        // Ensure that only past hours (including current) data is considered
        if (itemDate === today && departureHour <= currentHour) {
          hourlyDataForToday[departureHour] += item.totalCount || 0;  // Add total count for the hour
        }
      });

      // Weekly data (current week)
      const startOfWeek = dayjs().startOf("week").add(0, "day");
      const currentWeekDates = Array.from({ length: 7 }, (_, i) =>
        startOfWeek.add(i, "day").format("YYYY-MM-DD")
      );
      const past7DaysData = {};
      currentWeekDates.forEach((date) => {
        past7DaysData[date] = 0;
      });
      fetchedData.forEach((item) => {
        const dateKey = dayjs(item.departureTime).format("YYYY-MM-DD");
        if (dateKey in past7DaysData) {
          past7DaysData[dateKey] += item.totalCount || 0;
        }
      });
      const weeklyCategories = Object.keys(past7DaysData);
      const weeklyCounts = Object.values(past7DaysData);

      // Monthly data (current year)
      const currentYearMonths = Array.from({ length: 12 }, (_, i) =>
        dayjs().startOf("year").add(i, "month").format("MMMM")
      );
      const monthlyData = {};
      currentYearMonths.forEach((month) => {
        monthlyData[month] = 0;
      });
      fetchedData.forEach((item) => {
        const monthKey = dayjs(item.departureTime).format("MMMM");
        if (monthKey in monthlyData) {
          monthlyData[monthKey] += item.totalCount || 0;
        }
      });
      const monthlyCategories = Object.keys(monthlyData);
      const monthlyCounts = Object.values(monthlyData);

      // Fetch object data for the donut chart
      const objectResponse = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/objects`, {
        headers: { Authorization: `Bearer ${defaultToken}` },
      });

      let objectsFetched = objectResponse.data;

      if (!Array.isArray(objectsFetched)) {
        objectsFetched = objectsFetched.objects || [];
      }
      setObjectData(objectsFetched); // Save object data in state for later use

      const donutLabels = [];
      const donutValues = [];
      const variantSet = new Set();
      fetchedData.forEach((item) => {
        if (item.packageData && Array.isArray(item.packageData)) {
          item.packageData.forEach((pkg) => {
            const matchingObject = objectsFetched.find((obj) => obj.name === pkg.variant);
            if (matchingObject && pkg.actualCount > 0 && matchingObject.name !== "total") {
              if (!variantSet.has(matchingObject.displayName)) {
                donutLabels.push(formatLabel(matchingObject.displayName));
                donutValues.push(pkg.actualCount);
                variantSet.add(matchingObject.displayName);
              }
            } else if (pkg.actualCount > 0 && pkg.variant !== "total") {
              if (!variantSet.has(pkg.variant)) {
                donutLabels.push(formatLabel(pkg.variant));
                donutValues.push(pkg.actualCount);
                variantSet.add(pkg.variant);
              }
            }
          });
        }
      });

      setChartData({
        lineChartData: hourlyDataForToday,  // Default to today's data for the line chart
        barChartData: {
          weeklyCategories: weeklyCategories,
          weeklyCounts: weeklyCounts,
          monthlyCategories: monthlyCategories,
          monthlyCounts: monthlyCounts,
        },
        donutLabels: donutLabels,
        donutChartData: donutValues,
      });

      setData(fetchedData);
      setFilteredLineData(hourlyDataForToday);  // Set default line chart data to today’s hourly data
      setFilteredBarData({ weeklyCategories, weeklyCounts, monthlyCategories, monthlyCounts });
      setFilteredDonutData({ donutLabels, donutChartData: donutValues });

      // Fetch Employee Performance Data
      fetchEmployeePerformanceData();
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again later.");
    }
  };

  // Fetch Employee Performance Data with optional date filtering
  const fetchEmployeePerformanceData = (startDate, endDate) => {
    const sampleData = [
      {
        taskName: "Loading",
        startTime: "2024-10-14T09:00:00",
        endTime: "2024-10-14T10:30:00",
        duration: "1h 30m",
        dueTime: "2024-10-13T11:00:00",
        slaStatus: 1,
        assignedTo: "Supervisor 1",
        performanceScore: 80,
        achievedPackageCount: 200,
      },
      {
        taskName: "Loading",
        startTime: "2024-10-13T09:00:00",
        endTime: "2024-10-09T10:30:00",
        duration: "1h 30m",
        dueTime: "2024-10-13T11:00:00",
        slaStatus: 1,
        assignedTo: "Supervisor 2",
        performanceScore: 70,
        achievedPackageCount: 150,
      },

      {
        taskName: "Loading",
        startTime: "2024-10-13T09:00:00",
        endTime: "2024-10-14T10:30:00",
        duration: "1h 30m",
        dueTime: "2024-10-13T11:00:00",
        slaStatus: 0,
        assignedTo: "Supervisor 3",
        performanceScore: 100,
        achievedPackageCount: 300,
      },

      {
        taskName: "Loading",
        startTime: "2024-10-13T09:00:00",
        endTime: "2024-10-14T10:30:00",
        duration: "1h 30m",
        dueTime: "2024-10-13T11:00:00",
        slaStatus: 1,
        assignedTo: "Supervisor 2",
        performanceScore: 80,
        achievedPackageCount: 250,
      },
      {
        taskName: "Loading",
        startTime: "2024-10-13T09:00:00",
        endTime: "2024-10-14T10:30:00",
        duration: "1h 30m",
        dueTime: "2024-10-13T11:00:00",
        slaStatus: 0,
        assignedTo: "Supervisor 4",
        performanceScore: 80,
        achievedPackageCount: 250,
      },
      {
        taskName: "Loading",
        startTime: "2024-10-13T09:00:00",
        endTime: "2024-10-14T10:30:00",
        duration: "1h 30m",
        dueTime: "2024-10-13T11:00:00",
        slaStatus: 1,
        assignedTo: "Supervisor 1",
        performanceScore: 80,
        achievedPackageCount: 250,
      },
      {
        taskName: "loading",
        startTime: "2024-10-13T10:45:00",
        endTime: "2024-10-13T12:00:00",
        duration: "1h 15m",
        dueTime: "2024-10-13T12:30:00",
        slaStatus: 1,
        assignedTo: "Supervisor 5",
        performanceScore: 70,
        achievedPackageCount: 150,
      }, {
        taskName: "loading",
        startTime: "2024-10-13T10:45:00",
        endTime: "2024-10-10T12:00:00",
        duration: "1h 15m",
        dueTime: "2024-10-13T12:30:00",
        slaStatus: 0,
        assignedTo: "Supervisor 1",
        performanceScore: 100,
        achievedPackageCount: 800,
      },
    ];

    // Filter data based on the selected date range if provided
    const filteredData = sampleData.filter((data) => {
      const taskStartTime = dayjs(data.startTime);
      if (startDate && endDate) {
        return taskStartTime.isBetween(dayjs(startDate), dayjs(endDate), 'day', '[]');
      }
      return true;
    });

    setEmployeePerformanceData(filteredData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLabelClick = (index) => {
    setSelectedLabelIndex(index);
    if (chartRef.current && chartRef.current.chart) {
      chartRef.current.chart.toggleDataPointSelection(index);
    }
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value);
  };

  const getTaskCountsBySLA = (employeeData) => {
    const taskCountByEmployee = {};

    employeeData.forEach((data) => {
      const employeeName = data.assignedTo;
      if (!taskCountByEmployee[employeeName]) {
        taskCountByEmployee[employeeName] = { onTime: 0, delayed: 0 };
      }

      if (data.slaStatus === 1) {
        taskCountByEmployee[employeeName].onTime += 1;
      } else if (data.slaStatus === 0) {
        taskCountByEmployee[employeeName].delayed += 1;
      }
    });

    return taskCountByEmployee;
  };

  const taskCountByEmployee = getTaskCountsBySLA(employeePerformanceData);

  // Now prepare the series with the aggregated data
  const stackedColumnSeries = [
    {
      name: "On-Time Tasks (SLA: 1)",
      data: Object.values(taskCountByEmployee).map((counts) => counts.onTime),
    },
    {
      name: "Delayed Tasks (SLA: 0)",
      data: Object.values(taskCountByEmployee).map((counts) => counts.delayed),
    },
  ];

  const stackedColumnChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
    },
    xaxis: {
      categories: Object.keys(taskCountByEmployee), // Employee names
      title: {
        text: "Employee",
      },
      labels: {
        show: true,
        rotate: 0,
      },
    },
    yaxis: {
      title: {
        text: "Task Count",
      },
    },
    legend: {
      position: "bottom", // Changed legend position to bottom
    },
    fill: {
      opacity: 1,
    },
  };

  // Donut Chart for SLA Scores, filtered by selected employee if any
  const filteredEmployeePerformanceData = selectedEmployee
    ? employeePerformanceData.filter(data => data.assignedTo === selectedEmployee)
    : employeePerformanceData;

  const slaDonutSeries = [
    filteredEmployeePerformanceData.filter(data => data.slaStatus === 1).length,
    filteredEmployeePerformanceData.filter(data => data.slaStatus === 0).length,

  ];

  const slaDonutChartOptions = {
    labels: ["On time", "Delayed"],
    chart: {
      type: "donut",
      toolbar: {
        show: true,
        tools: { download: true },
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "45%",
        },
      },
    },
    tooltip: {
      enabled: true,
    },
    legend: {
      position: "bottom", // Legend position set to bottom
    },
  };


  const timeSeriesChartOptions = {
    chart: {
      type: "line",
    },
    xaxis: {
      categories: employeePerformanceData.map((data) => dayjs(data.startTime).format("YYYY-MM-DD")), // Task dates
      title: {
        text: "Date",
      },
      labels: {
        show: true,
        rotate: 0,
      },
    },
    yaxis: {
      title: {
        text: "Metrics",
      },
    },
    legend: {
      position: "bottom", // Changed legend position to bottom
    },
  };

  const timeSeries = [
    {
      name: "Performance Score",
      data: employeePerformanceData.map((data) => data.performanceScore),
    },
    {
      name: "Achieved Package Count",
      data: employeePerformanceData.map((data) => data.achievedPackageCount),
    },
  ];


  const filterTimelyEmployeeData = (employeeData, dateStrings) => {

    if (!dateStrings[0] || !dateStrings[1]) {
      return employeeData; // Return all data if no date range is selected
    }

    const [startDate, endDate] = dateStrings.map(date => new Date(date));



    return employeeData.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  const handleDateRangeChange = (dates, dateStrings) => {
    setShowChart(false)
    setFilteredEmployeeData(filterTimelyEmployeeData(employeeData, dateStrings))
    if (!dateStrings[0] && !dateStrings[1]) {
      const today = dayjs().format("YYYY-MM-DD");
      const hourlyDataForToday = Array(24).fill(0);
      data.forEach((item) => {
        const itemDate = dayjs(item.departureTime).format("YYYY-MM-DD");
        const departureHour = dayjs(item.departureTime).hour();
        if (itemDate === today) {
          hourlyDataForToday[departureHour] += item.totalCount || 0;
        }
      });
      setFilteredLineData(hourlyDataForToday); // Default to current day for the line chart

      const startOfWeek = dayjs().startOf("week").add(1, "day");
      const currentWeekDates = Array.from({ length: 7 }, (_, i) =>
        startOfWeek.add(i, "day").format("YYYY-MM-DD")
      );
      const weeklyDataForDefault = {};
      currentWeekDates.forEach((date) => {
        weeklyDataForDefault[date] = 0;
      });
      data.forEach((item) => {
        const dateKey = dayjs(item.departureTime).format("YYYY-MM-DD");
        if (dateKey in weeklyDataForDefault) {
          weeklyDataForDefault[dateKey] += item.totalCount || 0;
        }
      });
      setFilteredBarData({
        weeklyCategories: Object.keys(weeklyDataForDefault),
        weeklyCounts: Object.values(weeklyDataForDefault),
      }); // Default to current week for bar chart

      setFilteredDonutData({
        donutLabels: chartData.donutLabels,
        donutChartData: chartData.donutChartData,
      }); // Default to overall data for donut chart

      // Reset employee performance data to default
      fetchEmployeePerformanceData();
      // setShowChart(true) 
      return;
    }



    const selectedStartDate = dayjs(dateStrings[0]); // Take only the start date from the selected range


    // Filter data for the selected start date for the line chart
    const hourlyDataForSelectedDate = Array(24).fill(0);

    data.forEach((item) => {
      const itemDate = dayjs(item.departureTime).format("YYYY-MM-DD");
      const departureHour = dayjs(item.departureTime).hour();

      if (itemDate === selectedStartDate.format("YYYY-MM-DD")) {
        hourlyDataForSelectedDate[departureHour] += item.totalCount || 0;
      }
    });

    setFilteredLineData(hourlyDataForSelectedDate); // Set filtered data for the selected start date in the line chart

    // Filter for weekly and monthly bar chart
    const weeklyDataForSelectedRange = {};
    const monthlyDataForSelectedRange = {};
    const filteredDonutLabels = [];
    const filteredDonutValues = [];
    const variantSet = new Set();

    data.forEach((item) => {
      const itemDate = dayjs(item.departureTime);
      const weekKey = itemDate.format("YYYY-MM-DD");
      const monthKey = itemDate.format("MMMM");

      if (!weeklyDataForSelectedRange[weekKey]) weeklyDataForSelectedRange[weekKey] = 0;
      if (!monthlyDataForSelectedRange[monthKey]) monthlyDataForSelectedRange[monthKey] = 0;

      if (itemDate.isBetween(selectedStartDate, dayjs(dateStrings[1]), 'day', '[]')) {
        weeklyDataForSelectedRange[weekKey] += item.totalCount || 0;
        monthlyDataForSelectedRange[monthKey] += item.totalCount || 0;

        // Filter for donut chart
        if (item.packageData && Array.isArray(item.packageData)) {
          item.packageData.forEach((pkg) => {
            const matchingObject = objectData.find((obj) => obj.name === pkg.variant);
            if (matchingObject && pkg.actualCount > 0) {
              if (!variantSet.has(matchingObject.displayName)) {
                filteredDonutLabels.push(formatLabel(matchingObject.displayName));
                filteredDonutValues.push(pkg.actualCount);
                variantSet.add(matchingObject.displayName);
              }
            } else if (pkg.actualCount > 0) {
              filteredDonutLabels.push(formatLabel(pkg.variant));
              filteredDonutValues.push(pkg.actualCount);
            }
          });
        }
      }
    });

    // Update bar chart data with filtered weekly and monthly counts
    const weeklyCategories = Object.keys(weeklyDataForSelectedRange);
    const weeklyCounts = Object.values(weeklyDataForSelectedRange);
    const monthlyCategories = Object.keys(monthlyDataForSelectedRange);
    const monthlyCounts = Object.values(monthlyDataForSelectedRange);

    setFilteredBarData({ weeklyCategories, weeklyCounts, monthlyCategories, monthlyCounts });

    // Update donut chart with filtered data
    if (filteredDonutLabels.length > 0 && filteredDonutValues.length > 0) {
      setFilteredDonutData({ donutLabels: filteredDonutLabels, donutChartData: filteredDonutValues });
    } else {
      // Reset if no data is available
      setFilteredDonutData({ donutLabels: [], donutChartData: [] });
    }

    // Filter employee performance data based on the selected date range
    fetchEmployeePerformanceData(dateStrings[0], dateStrings[1]);

    setShowChart(true)
  };

  const todayTotal = filteredLineData.reduce((acc, count) => acc + count, 0); // Changed to use filteredLineData
  const weeklyTotal = filteredBarData.weeklyCounts?.reduce((acc, count) => acc + count, 0) || 0; // Changed to use filteredBarData
  const monthlyTotal = chartData.barChartData?.monthlyCounts?.reduce((acc, count) => acc + count, 0) || 0;
  const yearlyTotal = monthlyTotal;

  // Cards information
  const cardDetails = [
    {
      image: today,
      title: "Today Packages",
      count: `${todayTotal}`, // Now using the default value of the line chart
      gradient: "linear-gradient(-155deg, #e0f7fa, #81d4fa)",
      textColor: "#0277bd",
      patternColor: "#81d4fa",
      percentageChange: "+2.6%",
      isPositive: true,
    },
    {
      image: week,
      title: "Weekly Packages",
      count: `${weeklyTotal}`, // Now using the default value of the bar chart's weekly counts
      gradient: "linear-gradient(-155deg, #fff9c4, #ffeb3b)",
      textColor: "#7a4100",
      patternColor: "#fbc02d",
      percentageChange: "-0.1%",
      isPositive: false,
    },
    {
      image: month,
      title: "Monthly Packages",
      count: `${monthlyTotal}`,
      gradient: "linear-gradient(-155deg, #f3e5f5, #ce93d8)",
      textColor: "#27097a",
      patternColor: "#ce93d8",
      percentageChange: "+2.8%",
      isPositive: true,
    },
    {
      image: year,
      title: "Yearly Packages",
      count: `${yearlyTotal}`,
      gradient: "linear-gradient(135deg, #ffcdd2, #e57373)",
      textColor: "#7a0916",
      patternColor: "#e57373",
      percentageChange: "+3.6%",
      isPositive: true,
    },
  ];

  const lineChartOptions = {
    chart: { type: "line" },
    xaxis: {
      categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      title: { text: "Time (HH:mm)" },
      min: isMobile ? 0 : 0,
      max: isMobile ? 12 : 23,
    },
    yaxis: { title: { text: "Total Count" } },
    legend: { position: "bottom" }, // Changed legend position to bottom
  };

  const barChartOptions = {
    chart: { type: "bar" },
    xaxis: {
      categories: filteredBarData.weeklyCategories, // Use filtered data for weekly categories
      title: { text: "Current Week" },
      labels: {
        show: true,
        rotate: 0,
      },
    },
    yaxis: { title: { text: "Total Count" } },
    legend: { position: "bottom" }, // Changed legend position to bottom
  };

  const donutOptions = {
    labels: filteredDonutData.donutLabels, // Use formatted labels for donut chart
    chart: {
      type: "donut",
      toolbar: {
        show: true,
        tools: { download: true },
      },
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const selectedIndex = config.dataPointIndex;
          setSelectedLabelIndex(selectedIndex);
        },
      },
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 270,
        donut: { size: "45%" },
        expandOnClick: true,
      },
    },
    tooltip: {
      enabled: true,
    },
    legend: {
      show: false,
    },
    states: {
      normal: {
        filter: {
          type: "none",
        },
      },
      active: {
        filter: {
          type: "darken",
          value: 0.7,
        },
      },
    },
    stroke: {
      show: false,
    },
  };

  const getLegendColor = (index) => {
    return chartRef.current?.chart?.w?.globals?.colors[index] || '#000';
  };

  useEffect(() => { }, [filteredEmployeeData])



  // Function to conditionally render content based on the selected segment
  const renderContent = () => {
    if (selectedSegment === 'Load Statistics') {
      return (
        <Grid container spacing={3}>
          {cardDetails.map((card, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Card
                className="dashboard-card"
                sx={{
                  background: card.gradient,
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  color: card.textColor,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    maskImage: `url(${back1})`,
                    WebkitMaskImage: `url(${back1})`,
                    maskSize: "80%",
                    WebkitMaskSize: "80%",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    backgroundColor: card.patternColor,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                  }}
                ></div>

                <CardContent style={{ position: "relative", zIndex: 2 }}>
                  <div style={{ marginBottom: "15px" }}>
                    <img src={card.image} style={{ height: "40px" }} alt={card.title} />
                  </div>
                  <Typography variant="subtitle1" style={{ fontWeight: "500", color: card.textColor }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h6" style={{ fontWeight: "bold", color: card.textColor }}>
                    {card.count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Line Chart */}
          <Grid item xs={12} md={12}>
            <Card className="chart-card" style={{ backgroundColor: "white" }}>
              <CardContent>
                <Typography className="title" variant="h6">
                  Hourly Package Metrics (Today)
                </Typography>
                <Chart options={lineChartOptions} series={[{ name: "Total Count", data: filteredLineData }]} type="line" height={350} />
              </CardContent>
            </Card>
          </Grid>

          {/* Bar Chart */}
          <Grid item xs={12} md={8}>
            <Card className="chart-card" style={{ backgroundColor: "white" }}>
              <CardContent>
                <Typography className="title" variant="h6">
                  Weekly Package Trend
                </Typography>

                <Chart
                  options={barChartOptions}
                  series={[{ name: "Total Count", data: filteredBarData.weeklyCounts }]}
                  type="bar"
                  height={400}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Donut Chart for Package Distribution */}
          <Grid item xs={12} md={4}>
            <Card className="chart-card" style={{ backgroundColor: "white" }}>
              <CardContent>
                <Typography className="title" variant="h6">
                  Package Distribution
                </Typography>
                <div style={{ overflowX: "hidden", whiteSpace: "nowrap", marginTop: "20px" }}>
                  <Chart ref={chartRef} options={donutOptions} series={filteredDonutData.donutChartData} type="donut" height={347} />
                </div>

                {/* Scrollable custom legend */}
                <div style={{ overflowX: "auto", whiteSpace: "nowrap", marginTop: "20px", backgroundColor: 'white', padding: '10px' }}>
                  {filteredDonutData.donutLabels.map((label, index) => (
                    <span
                      key={index}
                      style={{
                        display: "inline-block",
                        padding: "5px 15px",
                        marginRight: "10px",
                        backgroundColor: 'white',
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleLabelClick(index)}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          backgroundColor: getLegendColor(index),
                          borderRadius: "50%",
                          marginRight: "8px",
                        }}
                      ></span>
                      <span style={{ fontSize: '12px' }}>{label}</span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else if (selectedSegment === 'Employee Performance') {
      return (
        <Grid container spacing={3} style={{ marginTop: '20px' }}>
          {/* Time Series Chart for Performance Trend Over Time */}
          {/* <Grid item xs={12}>
            {employeePerformanceData.length > 0 ? (
              <Card className="chart-card" style={{ backgroundColor: "white" }}>
                <CardContent>
                  <Typography className="title" variant="h6">
                    Performance Trend Over Time
                  </Typography>
                  <Chart
                    options={timeSeriesChartOptions}
                    series={timeSeries}
                    type="line"
                    height={350}
                  />
                </CardContent>
              </Card>
            ) : (
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                No performance data available.
              </Typography>
            )}
          </Grid> */}


          <Grid item xs={12} md={12} >
            <Card className="chart-card" style={{ backgroundColor: "white" }}>
              <CardContent>
                <Typography className="title" variant="h6">
                  Counts Achieved by Supervisors
                </Typography>
                {showChart ? (<HorizontalBarChart data={filteredEmployeeData} />) : <div className="text-center"><Spin /></div>}
              </CardContent>
            </Card>
          </Grid>



          <Grid item xs={6}>
            <Card className="chart-card" style={{ backgroundColor: "white" }}>
              <CardContent>
                <Typography className="title" variant="h6">
                  Average Duration per Load for Each Supervisor
                </Typography>
                {showChart ? (<FunnelChart data={filteredEmployeeData} />) : <div className="text-center"><Spin /></div>}
              </CardContent>
            </Card>
          </Grid>

          {/* Donut Chart for SLA Scores */}
          <Grid item xs={12} md={6}>
            {/* {employeePerformanceData.length > 0 ? ( */}
            <Card className="chart-card" style={{ backgroundColor: "white" }}>
              <CardContent>
                <Typography className="title" variant="h6">
                  SLA Status by Supervisors
                </Typography>

                {/* <Select
                    placeholder="Select Employee"
                    style={{ width: '100%', marginBottom: '20px' }}
                    onChange={handleEmployeeChange}
                    allowClear
                  >
                    {Array.from(new Set(employeePerformanceData.map(data => data.assignedTo))).map(employee => (
                      <Option key={employee} value={employee}>
                        {employee}
                      </Option>
                    ))}
                  </Select>
                  <Chart
                    options={slaDonutChartOptions}
                    series={slaDonutSeries}
                    type="donut"

                    height={350}
                  /> */}
                {showChart ? (<DonutChart data={filteredEmployeeData} />) : <div className="text-center"><Spin /></div>}
              </CardContent>
            </Card>
            {/* ) : (
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                No performance data available.
              </Typography>
            )} */}
          </Grid>

          {/* Stacked Column Chart for Task and Achieved Package Count */}
          {/* <Grid item xs={12} md={6}>
            {employeePerformanceData.length > 0 ? (
              <Card className="chart-card" style={{ backgroundColor: "white" }}>
                <CardContent>
                  <Typography className="title" variant="h6">
                    Task and Achieved Package Count by Employee
                  </Typography>
                  <Chart
                    options={stackedColumnChartOptions}
                    series={stackedColumnSeries}
                    type="bar"
                    height={350}
                  />
                </CardContent>
              </Card>
            ) : (
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                No performance data available.
              </Typography>
            )}
          </Grid> */}

          {/* <Grid item xs={12} md={6}>
            <Card className="chart-card" style={{ backgroundColor: "white" }}>
              <CardContent>
                <Typography className="title" variant="h6">
                  Task Overload by Supervisor
                </Typography>
                <PieChart data={employeeData} />
              </CardContent>
            </Card>
          </Grid> */}

          <Grid item xs={12} md={12}>
            {/* {employeePerformanceData.length > 0 ? ( */}
            <Card className="chart-card" style={{ backgroundColor: "white" }}>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography className="title" variant="h6" style={{ marginBottom: '1rem' }}>
                    Supervisor Tasks Report
                  </Typography>
                  <Export data={{
                    columns: [
                      { headerName: "Supervisor Name", field: "supervisorName", sortable: true, filter: true },
                      { headerName: "Total Packages", field: "totalPackages", sortable: true, filter: true },
                      { headerName: "On Time", field: "onTime", sortable: true, filter: true },
                      { headerName: "Delayed Time", field: "delayedLoads", sortable: true, filter: true },
                      { headerName: "Performance Score", field: "performanceScore", sortable: true, filter: true }
                    ]
                    , rows: exportTableData, param: 'Supervisor Overview'
                  }} print pdf excel />
                  {console.log(exportTableData)}
                </div>
                {showChart ? (<PerformanceTable data={filteredEmployeeData} setExportTableData={setExportTableData} />) : <div className="text-center"><Spin /></div>}

                {/* <Table
                    dataSource={gridLevelData}
                    columns={gridLevelColumns}
                    rowKey={(record) => record.SupervisorName}
                    pagination={false}
                  /> */}
              </CardContent>
            </Card>
            {/* ) : (
              <Typography variant="body1" style={{ textAlign: 'center' }}>
                No performance data available.
              </Typography>
            )} */}
          </Grid>


        </Grid>
      );
    }
  };

  return (
    <>
      <Header title={"Dashboard"} />

      <div className="dashboard-page" style={{ marginTop: "55px", padding: "20px", paddingRight: "8px" }}>
        {/* Date Picker and Welcome message */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
          }}
        >
          <Typography variant="h6" style={{ marginBottom: "20px", fontWeight: "600", paddingTop: "12px" }}>
            Welcome {user?.username ? capitalizeFirstLetter(user.username) : "Guest"}
          </Typography>
          {/* Date Range Picker */}
          <RangePicker
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            defaultValue={[dayjs().startOf('day'), dayjs().endOf('day')]}  // Default to today
            style={isMobile ? { width: '100%' } : {}}
          />
        </div>

        {/* Centered Segmented component on a new line */}
        <div className="segmented-control" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <Segmented className="segment-options"
            options={[
              {
                label: (
                  <div style={{ padding: 4, display: 'flex', alignItems: 'center', textWrap: "balance" }}>
                    <TfiPackage size={24} style={{ marginRight: 8 }} />
                    <div>Load Statistics</div>
                  </div>
                ),
                value: 'Load Statistics',
              },
              {
                label: (
                  <div style={{ padding: 4, display: 'flex', alignItems: 'center', textWrap: "balance" }}>
                    <GrUserWorker size={24} style={{ marginRight: 8 }} />
                    <div>Employee Performance</div>
                  </div>
                ),
                value: 'Employee Performance',
              },
            ]}
            onChange={(value) => setSelectedSegment(value)}
            defaultValue="Load Statistics"
            style={isMobile ? { width: '100%' } : {}}
          />
        </div>

        {renderContent()}
      </div>
    </>
  );
};

export default Dashboard;
