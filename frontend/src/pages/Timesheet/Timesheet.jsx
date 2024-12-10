
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Typography, Divider, message, Row, Col, Select, Modal, Table } from 'antd';
import moment from 'moment';
// import './Timesheet.css';
import ViewTimesheet from '../../components/Viewtimesheet/ViewTimesheet';

 
const { Title } = Typography;
const { Option } = Select; 
 
const Timesheet = () => {
    const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MMMM YYYY'));
    const [selectedWeek, setSelectedWeek] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [form, setForm] = useState({ hours: {} });
    const [submittedHours, setSubmittedHours] = useState({});
    const [totalWeeklyHours, setTotalWeeklyHours] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [approvals, setApprovals] = useState([]); // State to store approval data
    const [showApprovals, setShowApprovals] = useState(false); // State to toggle approval view
 
    useEffect(() => {
        initializeWeeksForMonth(selectedMonth, dateFormat);
        fetchTimesheetData();
    }, [selectedMonth, dateFormat]);
 
    useEffect(() => {
        const total = selectedWeek.reduce(
            (acc, { date }) => acc + (form.hours[date] || 0),
            0
        );
        setTotalWeeklyHours(total);
    }, [form.hours, selectedWeek]);
 
    const initializeWeeksForMonth = (month, format) => {
        const startDate = moment(month, 'MMMM YYYY').startOf('month').startOf('week');
        const endDate = moment(month, 'MMMM YYYY').endOf('month').endOf('week');
        const weeksInMonth = [];
        let week = [];
 
        for (let date = startDate.clone(); date.isBefore(endDate) || date.isSame(endDate); date.add(1, 'days')) {
            week.push({
                date: date.format(format),
                isDisabled: !date.isSame(moment(month, 'MMMM YYYY'), 'month') || date.day() === 0,
                isSunday: date.day() === 0,
                isOutsideMonth: !date.isSame(moment(month, 'MMMM YYYY'), 'month'), // Check if date is outside the selected month
            });
            if (date.day() === 6 || date.isSame(endDate)) {
                weeksInMonth.push(week);
                week = [];
            }
        }
 
        setWeeks(weeksInMonth);
        setSelectedWeek(weeksInMonth[0] || []);
    };
 
    const fetchTimesheetData = async () => {
        try {
            const token = localStorage.getItem('dotconnectoken');
            if (!token) {
                message.error('User token is missing. Please log in again.');
                return;
            }
 
            const parsedToken = JSON.parse(token);
            const response = await axios.get('http://localhost:8000/get-timesheet', {
                headers: { Authorization: `Bearer ${parsedToken.userToken}` },
                params: { month: selectedMonth },
            });
 
            if (response.status === 200) {
                const { workingHours } = response.data;
 
                const hours = workingHours.reduce(
                    (acc, { date, dailyHours }) => ({
                        ...acc,
                        [date]: dailyHours,
                    }),
                    {}
                );
 
                setForm((prev) => ({ ...prev, hours }));
                setSubmittedHours(hours);
            }
        } catch (error) {
            console.error('Error fetching timesheet data:', error.response || error);
        }
    };
 
    const handleHoursChange = (date, value) => {
        if (value < 0 || value > 24) {
            message.error('Working hours must be between 0 and 24.');
            return;
        }
 
        setForm((prev) => ({
            ...prev,
            hours: { ...prev.hours, [date]: value },
        }));
    };
 
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('dotconnectoken');
            if (!token) {
                message.error('User token is missing. Please log in again.');
                return;
            }
 
            const parsedToken = JSON.parse(token);
            const workingHours = Object.entries(form.hours).map(([date, dailyHours]) => ({
                date,
                dailyHours,
            }));
 
            const response = await axios.post(
                'http://localhost:8000/save-timesheet',
                { workingHours },
                { headers: { Authorization: `Bearer ${parsedToken.userToken}` } }
            );
 
            if (response.status === 201 || response.status === 200) {
                message.success(response.data.message);
                setSubmittedHours({ ...form.hours });
            }
        } catch (error) {
            console.error('Error response:', error.response || error);
            message.error(error.response ? error.response.data.error : 'Failed to save timesheet.');
        }
    };
 
    const handleEditTimesheet = () => {
        setIsEditing((prev) => !prev);
    };
 
    const handleViewTimesheet = () => {
        
        setIsModalVisible(true);
    };
 
    const handleModalClose = () => {
        setIsModalVisible(false);
    };
 
    const handleDateFormatChange = (format) => {
        setDateFormat(format);
        setForm((prev) => ({
            ...prev,
            hours: Object.fromEntries(
                Object.entries(prev.hours).map(([date, value]) => [
                    moment(date, dateFormat).format(format),
                    value,
                ])
            ),
        }));
    };
 
    // Fetch approvals when the page loads
    // useEffect(() => {
    //     fetchApprovals();
    // }, []);
 
    // const fetchApprovals = async () => {
    //     try {
    //         const token = localStorage.getItem('dotconnectoken');
    //         if (!token) {
    //             message.error('User token is missing. Please log in again.');
    //             return;
    //         }
 
    //         const parsedToken = JSON.parse(token);
    //         const response = await axios.get('http://localhost:8000/get-approvals', {
    //             headers: { Authorization: `Bearer ${parsedToken.userToken}` },
    //         });
 
    //         if (response.status === 200) {
    //             setApprovals(response.data.approvals); // Set approval data
    //         }
    //     } catch (error) {
    //         // console.error('Error fetching approval data:', error.response || error);
    //     }
    // };
 
    // Table columns for approvals
    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Approval Status', dataIndex: 'status', key: 'status' },
    ];
 
    return (
        <div className="main" style={{padding: '1rem'}}>
           
 
            <div className="timesheet-container">
                <Title level={2}>Employee Weekly Timesheet</Title>
                <Divider />
 
                <div className="month-selector">
                    <Select value={dateFormat} onChange={handleDateFormatChange} style={{ marginRight: '10px' }}>
                        <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                        <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                        <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    </Select>
 
                    <Select value={selectedMonth} onChange={setSelectedMonth} style={{ marginRight: '10px' }}>
                        {Array.from({ length: 12 }, (_, i) =>
                            moment().subtract(i, 'months').format('MMMM YYYY')
                        ).map((month) => (
                            <Option key={month} value={month}>
                                {month}
                            </Option>
                        ))}
                    </Select>
 
                    <Select
                        onChange={(index) => setSelectedWeek(weeks[index] || [])}
                        className="week-dropdown"
                        style={{ width: '100px' }}
                    >
                        {weeks.map((week, index) => (
                            <Option key={index} value={index}>
                                Week {index + 1}
                            </Option>
                        ))}
                    </Select>
                </div>
 
                <Row gutter={[16, 16]} justify="center">
                    {(selectedWeek || []).map(({ date, isDisabled, isSunday, isOutsideMonth }, idx) => (
                        <Col
                            key={idx}
                            span={3}
                            style={{
                                textAlign: 'center',
                                color: isOutsideMonth
                                    ? '#6c757d'
                                    : isSunday
                                    ? 'red'
                                    : isDisabled
                                    ? '#6c757d'
                                    : 'black',
                            }}
                        >
                            {date ? (
                                <>
                                    <strong>{moment(date, dateFormat).format('ddd')}</strong>
                                    <br />
                                    <small>{date}</small>
                                    <br />
                                    <Input
                                        type="number"
                                        min={0}
                                        max={24}
                                        value={form.hours[date] || ''}
                                        onChange={(e) => handleHoursChange(date, Number(e.target.value))}
                                        disabled={isDisabled || isOutsideMonth || (!!submittedHours[date] && !isEditing)}
                                        className={submittedHours[date] ? (isEditing ? '' : 'submitted-hours') : ''}
                                        style={{
                                            backgroundColor: isOutsideMonth ? 'grey' : submittedHours[date] && !isEditing ? '#d4edda' : 'white',
                                            color: submittedHours[date] && !isEditing ? 'green' : 'black',
                                            cursor: isDisabled || isOutsideMonth || (submittedHours[date] && !isEditing) ? 'not-allowed' : 'text',
                                        }}
                                    />
                                </>
                            ) : null}
                        </Col>
                    ))}
                </Row>
 
                <div className="total-hours">
                    <Title level={4}>Total Weekly Hours: {totalWeeklyHours}</Title>
                </div>
 
                <Button type="primary" onClick={handleSubmit} style={{ marginTop: '1rem' }}>
                    Submit Timesheet
                </Button>
                <Button type="default" onClick={handleViewTimesheet} style={{ marginLeft: '10px' }}>
                    View Timesheet
                </Button>
                <Button type="default" onClick={handleEditTimesheet} style={{ marginLeft: '10px' }}>
                    {isEditing ? 'Save Edit' : 'Edit Timesheet'}
                </Button>
 
                <Button
                    type="default"
                    onClick={() => setShowApprovals(!showApprovals)}
                    style={{ marginTop: '20px' }}
                >
                    My Approvals
                </Button>
 
                {/* Approval Table */}
                {showApprovals && (
                    <div className="approvals-container" style={{ marginTop: '20px' }}>
                        <Table
                            columns={columns}
                            dataSource={approvals}
                            rowKey="date"
                            pagination={false}
                        />
                    </div>
                )}
 
                <Modal
                    title="View Timesheet"
                    visible={isModalVisible}
                    onCancel={handleModalClose}
                    footer={null}
                    width={800}
                >
                    <ViewTimesheet />
                </Modal>
            </div>
        </div>
    );
};
 
export default Timesheet;
 