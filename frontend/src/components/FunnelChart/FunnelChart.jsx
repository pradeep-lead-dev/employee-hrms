import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const ApexChart = ({ data }) => {
  useEffect(()=>{}, data)

  const [chartData, setChartData] = useState({
    series: [],
    options: {
      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          borderRadius: 0,
          horizontal: true,
          barHeight: '90%',
          isFunnel: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opt) {
          return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val+ ' mins';
        },
        dropShadow: {
          enabled: true,
        },
      },
    //   title: {
    //     text: 'Average Duration per Load for Each Supervisor',
    //     align: 'middle',
    //   },
      xaxis: {
        categories: [],
      },
      legend: {
        show: false,
      },
    }
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Calculate total duration and count of tasks for each supervisor
    const supervisorData = data.reduce((acc, curr) => {
      if (curr.assignedTo && curr.duration !== null) {
        if (!acc[curr.assignedTo]) {
          acc[curr.assignedTo] = { totalDuration: 0, loadCount: 0 };
        }
        acc[curr.assignedTo].totalDuration += curr.duration;
        acc[curr.assignedTo].loadCount += 1;
      }
      return acc;
    }, {});

    // Prepare the series data and categories for the funnel chart
    let seriesData = Object.entries(supervisorData)
      .map(([supervisor, { totalDuration, loadCount }]) => ({
        supervisor,
        averageDuration: loadCount > 0 ? (totalDuration / loadCount).toFixed(2) : 0
      }));

    // Sort the data in descending order based on averageDuration
    seriesData.sort((a, b) => a.averageDuration - b.averageDuration);

    // Extract sorted categories and series data
    const categories = seriesData.map(item => item.supervisor);
    const seriesValues = seriesData.map(item => item.averageDuration);

    // Update the chart data
    setChartData({
      series: [
        {
          name: 'Average Duration',
          data: seriesValues,
        }
      ],
      options: {
        ...chartData.options,
        xaxis: {
          categories: categories,
        },
      }
    });
  }, [data]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="bar"
          height={410}
        />
      </div>
    </div>
  );
};

export default ApexChart;
