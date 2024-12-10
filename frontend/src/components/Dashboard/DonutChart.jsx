import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import ReactApexChart from 'react-apexcharts';

const { Option } = Select;

const SupervisorSlaChart = ({ data }) => {
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [chartData, setChartData] = useState({
    series: [],
    plotOptions: {
      pie: {
        donut: {
          size: "85%",
        },
      },
    },
    options: {
      chart: {
        type: "donut",
        toolbar: {
          show: true,
          tools: { download: true },
        }
      },
      labels: ['SLA Met (True)', 'SLA Met (False)'],
      colors: ['#00E396', '#FF4560'],
      tooltip: {
        y: {
          formatter: function (val) {
            return val + ' loads';
          },
        },
      },
    },
  });

  // Populate supervisor list from the data
  useEffect(() => {
    if (data && data.length > 0) {
      const supervisorList = [...new Set(data.map(item => item.assignedTo))];
      setSupervisors(supervisorList);

      // Set the first supervisor as the default selected value
      if (supervisorList.length > 0) {
        setSelectedSupervisor(supervisorList[0]);
        updateChartData(supervisorList[0]);
      }
    }
  }, [data]);

  // Function to update the chart data based on the selected supervisor
  const updateChartData = (supervisor) => {
    // Calculate the number of SLA met (true/false) for the selected supervisor
    const slaData = data.filter(item => item.assignedTo === supervisor);
    const slaMetTrue = slaData.filter(item => item.slaMet === true).length;
    const slaMetFalse = slaData.filter(item => item.slaMet === false).length;

    // Update the chart with SLA met data
    setChartData({
      ...chartData,
      series: [slaMetTrue, slaMetFalse], // True and False counts
    });
  };

  // Handle the selection of a supervisor
  const handleSelectChange = (value) => {
    setSelectedSupervisor(value);
    updateChartData(value);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px',marginTop: '20px' }}>
        <Select
          value={selectedSupervisor}
          placeholder="Select a Supervisor"
          style={{ width: 200 }}
          onChange={handleSelectChange}
        >
          {supervisors.map((supervisor) => (
            <Option key={supervisor} value={supervisor}>
              {supervisor}
            </Option>
          ))}
        </Select>
      </div>

      {selectedSupervisor && (
        <div id="chart">
          <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type="donut"
            height={440}
          />
        </div>
      )}
    </div>
  );
};

export default SupervisorSlaChart;
