import React from "react";
import "./Header.css";
import logo from "./podaran.png"; // Replace with the correct path for your logo
import { Divider, Typography } from "antd"; // Assuming you're using Ant Design's Divider component
import { camelCaseToNormal } from "../../utils/StringTransformation";

const Header = ({ title }) => {
  const { Title } = Typography
  return (
    <div className="header">
      <header className="header" style={{ borderBottom: '1.5px solid #D61A0C' }} >
        <div className="header-content">
          <div className="header-left">
            <Title level={2} style={{ margin: 0, fontSize: '16px' }}>{camelCaseToNormal(title)}</Title>
          </div>
          <img src={import.meta.env.VITE_API_LOGO_URL} alt="Logo" style={{ width: '70px' }} className="header-logo" />
        </div>
      </header>
      <Divider className="header-divider" style={{ border: '1.5px solid #D61A0C' }} />
    </div>
  );
};

export default Header;