import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Modal, Table, Button, Avatar, Typography, Spin, List, Card } from "antd";
import { useTheme } from "@mui/material/styles";
import VideoFeed from "./VideoFeed";
import { AuthContext } from "../../context/AuthContext";
import "./livedetection.css";
import Header from "../../components/Header/Header";
import NoCameraActive from "../../components/NoCameraActive/NoCameraActive";
import { useNavigate } from "react-router-dom";

const ColorList = ["#f56a00", "#7265e6", "#ffbf00", "#00a2ae", "#ff4d4f", "#52c41a", "#ff7d30", "#9c27b0"];

const LoadingVehicleList = ({ loadingVehicles, onActionClick }) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={loadingVehicles}
      renderItem={(vehicle) => {
        const digits = vehicle.vehicleNumber.match(/\d+/g);
        const lastFourDigits = digits ? digits.join("").slice(-4) : "0000";

        return (
          <List.Item
            actions={[
              <Button
                type="primary"
                className="view-detail"
                onClick={() => onActionClick(vehicle)}
              >
                View Details
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: ColorList[vehicle.id % ColorList.length],
                    verticalAlign: "middle",
                  }}
                  size="large"
                >
                  {lastFourDigits}
                </Avatar>
              }
              title={
                <Typography.Text style={{ fontFamily: "Noto Sans", fontSize: "13px" }}>
                  <strong>{vehicle.vehicleNumber}</strong> is loading in <strong>{vehicle.cameraAlias}</strong> <br />
                   {/* <strong>Spot ID:</strong> {vehicle.spotId} <br /> */}
                    <strong>Order ID:</strong> {vehicle.orderId}
                </Typography.Text>
              }
              description={
                <Typography.Text style={{ color: "var(--rs-text-secondary)", fontFamily: "Noto Sans" }}>
                  Calculated Total Count: {vehicle.totalCount}
                </Typography.Text>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

const LiveDetection = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loadingVehicles, setLoadingVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const theme = useTheme();
  const { defaultToken } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [packageData, setPackageData] = useState([]);  // State to store fetched package data
  const navigate = useNavigate();
  const [countData, setCountData] = useState([])


  // On component mount, check localStorage for modal state
  useEffect(() => {
    const storedVehicle = localStorage.getItem('selectedVehicle');
    const storedModalState = localStorage.getItem('isModalVisible');

    if (storedVehicle && storedModalState === "true") {
      setSelectedVehicle(JSON.parse(storedVehicle));
      setIsModalVisible(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/master`, {
          headers: {
            Authorization: `Bearer ${defaultToken}`
          }
        });
        const fetchedData = response.data.data;

        // Filter for vehicles with status 'loading'
        setLoadingVehicles(fetchedData?.filter(vehicle => vehicle.status === "loading"));
      } catch (error) {
        console.error("Error fetching master data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [defaultToken]);

  // Fetch package data for the selected vehicle
  const fetchPackageData = async (vehicleId) => {
    try {
      if (vehicleId) {
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/master/${vehicleId}`, {
          headers: {
            Authorization: `Bearer ${defaultToken}`
          }
        });
        setCountData(response.data.data || [])
        setPackageData(response.data.data?.packageData || []);  // Update the packageData state with fetched data
      }

    } catch (error) {
      console.error("Error fetching package data:", error);
    }
  };

  // Set an interval to refresh the package data every 10 seconds
  useEffect(() => {
    let interval;
    
    if (selectedVehicle) {
      // Fetch package data immediately after selectedVehicle is set
      fetchPackageData(selectedVehicle._id);
  
      // Set an interval to fetch the data every 5 seconds
      interval = setInterval(() => {
        fetchPackageData(selectedVehicle._id);
      }, 5000);  // Refresh every 5 seconds
    }
  
    return () => clearInterval(interval);  // Clear interval on unmount or when selectedVehicle changes
  }, [selectedVehicle]);
  



  const showModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedCamera(vehicle.camera);
    setIsModalVisible(true);
    fetchPackageData(vehicle.id);  // Fetch package data when the modal is opened

    // Store the selected vehicle and modal state in localStorage
    localStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
    localStorage.setItem('isModalVisible', "true");
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedCamera(null);
    setSelectedVehicle(null);

    // Clear modal state from localStorage
    localStorage.removeItem('selectedVehicle');
    localStorage.removeItem('isModalVisible');
  };

  if (isLoading) {
    return (
      <div style={{ marginTop: "20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="live-detection">
      <Header title={'Active Loads'} />
      {loadingVehicles.length > 0 ? (
        <>
          {loading ? (
            <div style={{ marginTop: "20px" }}>
              <Spin size="large" />
            </div>
          ) : (
            <LoadingVehicleList loadingVehicles={loadingVehicles} onActionClick={showModal} />
          )}

          <Modal
            open={isModalVisible}
            onCancel={handleModalClose}
            footer={null}
            centered
            width={1000}
            bodyStyle={{ padding: "20px" }}
          >
            <div className="modal-content">
              {countData ? (
                <>
                  <Typography.Title level={5} style={{ marginBottom: "20px", fontFamily: "Noto Sans" }}>
                    Vehicle Information
                  </Typography.Title>
                  <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px' }} className="details-vehicle">
                    <Card className="card-inside-live-detection">
                      <p><strong>Vehicle Number:</strong> {countData.vehicleNumber}</p>
                    </Card>
                    <Card className="card-inside-live-detection">
                      <p><strong>Order ID:</strong> {countData.orderId || 'N/A'}</p>
                    </Card>
                    <Card className="card-inside-live-detection">
                      <p><strong>Driver Name:</strong> {countData.driverName || 'N/A'}</p>
                    </Card>
                    <Card className="card-inside-live-detection">
                      <p><strong>Time Duration:</strong>{`${isNaN(countData.duration) || countData.duration === null || countData.duration === undefined ? '0' : (countData.duration / 60).toFixed(2).toString().replaceAll('.', ':')} min`}
                      </p>
                    </Card>
                    <Card className="card-inside-live-detection">
                      <p><strong>Target Loading Packages:</strong> {countData.targetPackage || 0}</p>
                    </Card>
                    <Card className="card-inside-live-detection">
                      <p><strong>Loading Packages:</strong> {countData.totalCount || 0}</p>
                    </Card>
                  </div>
                </>
              ) : (
                <Typography.Text>No vehicle selected.</Typography.Text>
              )}

              <div className="video-table-container" style={{ marginTop: "20px" }}>
                <div className="video-feed">
                  {selectedVehicle?.cameraId ? (
                    <VideoFeed src={selectedVehicle?.cameraId} />
                  ) : (
                    <img
                      src="https://dotsito.s3.ap-south-1.amazonaws.com/Live+feed+waiting+-+gif.gif"
                      alt="Waiting for live feed"
                      style={{ width: "100%" }}
                    />
                  )}
                </div>

                <div className="table-container">
                  <Typography.Title
                    level={6}
                    style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: "10px", fontSize: "22px", fontFamily: "Noto Sans" }}
                  >
                    Package Data 
                    {/* <Button type="primary" onClick={() => fetchPackageData(selectedVehicle._id)}>Get Data</Button> */}
                  </Typography.Title>
                  <Table
                    dataSource={packageData}  // Use fetched package data in the table
                    columns={[
                      { title: "Variant", dataIndex: "variant", key: "variant" },
                      { title: "Actual Count", dataIndex: "actualCount", key: "actualCount" },
                    ]}
                    pagination={false}
                    scroll={{ y: 200 }}
                    // summary={() => (
                    //   // <div style={{ display: "flex", justifyContent: "space-around", fontWeight: "bold" }}>

                    //   //   <div>Target Count: {countData?.targetPackage || 0}</div>
                    //   //   <div>Total Count: {countData?.totalCount || 0}</div>
                    //   // </div>
                    //   <>
                    //     <Table.Summary.Row>
                    //       <Table.Summary.Cell>
                    //         Target Count: {countData?.targetPackage || 0}
                    //       </Table.Summary.Cell>
                    //       <Table.Summary.Cell>
                    //         Total Count: {countData?.totalCount || 0}
                    //       </Table.Summary.Cell>

                    //     </Table.Summary.Row>
                    //   </>
                    // )}
                    footer={() => (
                      <div style={{ display: "flex", fontWeight: "bold" }}>
                        <div>Target Count: {countData?.targetPackage || 0}</div>
                        <div style={{ marginLeft: '15px' }}>Total Count: {countData?.totalCount || 0}</div>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <NoCameraActive />
      )
      }
    </div >
  );
};

export default LiveDetection;