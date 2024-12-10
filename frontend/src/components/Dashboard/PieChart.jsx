import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const DonutChart = ({ data }) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: "donut",
        toolbar: {
          show: true,
          tools: { download: true },
        }
      },
      labels: [],
      //   title: {
      //     text: 'Task Distribution by Supervisor',
      //     align: 'middle',
      //   },
      legend: {
        position: 'bottom',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '50%',
          }
        }
      },
    },
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Calculate the number of tasks for each supervisor
    const supervisorTaskCount = data.reduce((acc, curr) => {
      if (curr.assignedTo) {
        acc[curr.assignedTo] = (acc[curr.assignedTo] || 0) + 1;
      }
      return acc;
    }, {});

    // Prepare the series data for the donut chart
    const seriesData = Object.values(supervisorTaskCount);
    const labels = Object.keys(supervisorTaskCount);

    // Update the chart data
    setChartData({
      series: seriesData,
      options: {
        ...chartData.options,
        labels: labels,
      },
    });
  }, [data]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="donut"
          height={400}
        />
      </div>
    </div>
  );
};

export default DonutChart;
