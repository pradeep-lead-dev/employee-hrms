import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const HorizontalBarChart = ({ data }) => {
  useEffect(()=>{
    
  },[data])
  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '70%',
        },
      },
      xaxis: {
        title: {
          text: 'Total Achieved Count',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333',
          },
        },
        labels: {
          style: {
            fontSize: '12px',
            colors: ['#333'],
          },
        },
        categories: [], // This will be set dynamically
      },
      yaxis: {
        title: {
          text: 'Supervisors',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333',
          },
        },
      },
      colors: ['#008FFB'],
      tooltip: {
        y: {
          formatter: function (val, { seriesIndex, dataPointIndex, w }) {
            const totalLoads = w.config.customData[dataPointIndex].totalLoads;
            return `${val} packages (Total Loads: ${totalLoads})`;
          },
        },
      },
    },
    customData: [], // To store additional data for tooltips
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Calculate the total achievedCount and number of records for each supervisor
    const supervisorAchievedCount = data.reduce((acc, curr) => {
      if (curr.assignedTo && curr.achievedCount !== null) {
        if (!acc[curr.assignedTo]) {
          acc[curr.assignedTo] = { achievedCount: 0, totalLoads: 0 };
        }
        acc[curr.assignedTo].achievedCount += curr.achievedCount;
        acc[curr.assignedTo].totalLoads += 1;
      }
      return acc;
    }, {});

    // Prepare the series data, categories, and custom data for the horizontal bar chart
    const categories = Object.keys(supervisorAchievedCount);
    const seriesData = Object.values(supervisorAchievedCount).map(item => item.achievedCount);
    const customData = Object.values(supervisorAchievedCount).map(item => ({
      totalLoads: item.totalLoads,
    }));

    // Update the chart data
    setChartData({
      series: [
        {
          name: 'Total Achieved Count',
          data: seriesData,
        },
      ],
      options: {
        ...chartData.options,
        xaxis: {
          ...chartData.options.xaxis,
          categories: categories, // Set categories here for y-axis labels in a horizontal bar chart
        },
      },
      customData: customData, // Store custom data for tooltip
    });
  }, [data]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={{ ...chartData.options, customData: chartData.customData }}
          series={chartData.series}
          type="bar"
          height={600}
        />
      </div>
    </div>
  );
};

export default HorizontalBarChart;
