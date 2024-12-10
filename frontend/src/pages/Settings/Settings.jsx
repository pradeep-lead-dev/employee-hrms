import React from "react";
import CardComponent from "./CardComponent"; // Adjust the import path as necessary
import { Card } from "antd";
import Header from "../../components/Header/Header";
const Settings = () => {
  return (
    <div className="settings-page">
      <Header title={'Settings'} />
      <CardComponent />
    </div>
  );
};

export default Settings;
