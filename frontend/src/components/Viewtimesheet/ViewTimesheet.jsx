import React, { useState, useEffect } from 'react';
import { Select, Typography, Table, message } from 'antd';
import axios from 'axios';
import moment from 'moment';
 
import './ViewTimesheet.css';
 
const { Title } = Typography;
const { Option } = Select;
 
const ViewTimesheet = () => {
  const [selectedMonth, setSelectedMonth] = useState(moment().format('MMMM YYYY'));
  const [selectedWeek, setSelectedWeek] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [timesheetData, setTimesheetData] = useState([]);
 
  useEffect(() => {
    generateWeeksForMonth(selectedMonth);
  }, [selectedMonth]);
 
  useEffect(() => {
    if (selectedWeek) {
      fetchTimesheetData();
    }
  }, [selectedWeek]);
 
  const generateWeeksForMonth = (month) => {
    const startDate = moment(month, 'MMMM YYYY').startOf('month').startOf('week');
    const endDate = moment(month, 'MMMM YYYY').endOf('month').endOf('week');
    const weeksInMonth = [];
    let weekNumber = 1;
 
    for (let date = startDate.clone(); date.isBefore(endDate); date.add(1, 'weeks')) {
      const startOfWeek = date.clone();
      const endOfWeek = date.clone().endOf('week');
      weeksInMonth.push({
        label: `Week ${weekNumber++} (${startOfWeek.format('YYYY-MM-DD')} - ${endOfWeek.format(
          'YYYY-MM-DD'
        )})`,
        start: startOfWeek.format('YYYY-MM-DD'),
        end: endOfWeek.format('YYYY-MM-DD'),
      });
    }
 
    setWeeks(weeksInMonth);
    setSelectedWeek(weeksInMonth[0]?.label || '');
  };
 
  const fetchTimesheetData = async () => {
    try {
      const token = localStorage.getItem('dotoken');
      if (!token) {
        message.error('User token is missing. Please log in again.');
        return;
      }
 
      // const parsedToken = JSON.parse(token);
      const selectedWeekRange = weeks.find((week) => week.label === selectedWeek);
 
      if (!selectedWeekRange) {
        message.error('Invalid week selection.');
        return;
      }
 
      // Send the start and end dates to the backend
      const response = await axios.get('http://localhost:8001/view-timesheet', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start: moment(selectedWeekRange.start).format('YYYY-MM-DD'),
          end: moment(selectedWeekRange.end).format('YYYY-MM-DD'),
        },
      });
 
      if (response.status === 200) {
        setTimesheetData(response.data.timesheet);
      }
    } catch (error) {
      console.error('Error fetching timesheet data:', error.response || error);
      message.error(error.response ? error.response.data.error : 'Failed to fetch timesheet.');
    }
  };
 
  return (
    <div className="view-timesheet-container">
      <Title level={2}>View Timesheet</Title>
      <div className="form-container">
        <Select
          value={selectedMonth}
          onChange={(value) => setSelectedMonth(value)}
          style={{ marginRight: '10px', width: 200 }}
        >
          {Array.from({ length: 12 }, (_, i) =>
            moment().subtract(i, 'months').format('MMMM YYYY')
          ).map((month) => (
            <Option key={month} value={month}>
              {month}
            </Option>
          ))}
        </Select>
 
        <Select
          value={selectedWeek}
          onChange={(value) => setSelectedWeek(value)}
          style={{ marginRight: '10px', width: 300 }}
        >
          {weeks.map((week, index) => (
            <Option key={index} value={week.label}>
              {week.label}
            </Option>
          ))}
        </Select>
      </div>
 
      <Table
        dataSource={timesheetData.map((entry, index) => ({
          key: index,
          date: moment(entry.date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']).format('DD/MM/YYYY'),
          day: moment(entry.date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']).format('dddd'),
          dailyHours: entry.dailyHours,
        }))}
        columns={[
          { title: 'Date', dataIndex: 'date', key: 'date' },
          { title: 'Day', dataIndex: 'day', key: 'day' },
          { title: 'Working Hours', dataIndex: 'dailyHours', key: 'dailyHours' },
        ]}
        style={{ marginTop: '20px' }}
        pagination={false}
      />
    </div>
  );
};
 
export default ViewTimesheet;