import React, { useState, useEffect, useContext } from 'react';
import './MobileTabBar.css'; // Ensure your CSS is set up correctly
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { Avatar, Button, Dropdown, Menu } from 'antd'; // Ant Design Avatar and Dropdown
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip from Material-UI
import logo2 from "./logo.svg"; // Adjust path as necessary
import { AuthContext } from "../../context/AuthContext"; // Import your AuthContext for user data
import { BarChartOutlined, LogoutOutlined, ProductFilled, SettingFilled, UserOutlined } from '@ant-design/icons';

const MobileTabBar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const { user, logout, globalPermissions } = useContext(AuthContext); // Get the user details and logout from context


  // Dropdown menu with the Logout option
  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  // Combine menu items and down menu items
  let menuItems = [
    { icon: <AnalyticsIcon />, link: '/' },
    // { icon: <CreateNewFolderIcon />, link: '/table/master' },
    { icon: <SettingsIcon />, link: '/settings' },
    { icon: <img src={logo2} alt="Dotspot" width="40px" className="rotate-logo mobile-img" />, link: '/' },
  ];

  menuItems = [
    { icon: <BarChartOutlined style={{ color: "#000", fontSize: '20px' }} />, link: "/", disabled: !(globalPermissions.includes(`dashboard.read`)), allow: false },
    // { icon: <ProductFilled style={{ color: "#000", fontSize: '20px' }} />, link: "/table/master", disabled: !(globalPermissions.includes(`master.read`)), allow: false },
    { icon: <SettingFilled style={{ color: "#000", fontSize: '20px' }} />, link: "/settings", allow: false },
    { icon: <img src={logo2} alt="Dotspot" width="50px" className="rotate-logo mobile-img" />, link: "/", allow: false, logo: true },
    { icon: <UserOutlined style={{ color: "#000" }} />, link: "/profile", allow: false },
    // { icon: <LogoutOutlined style={{ color: "#000", fontSize: '20px' }} />, link: "/settings", allow: false },
  ]

  const downmenuItems = [
    {
      // Replace AccountCircleIcon with the dynamic avatar for the mobile view
      icon: (
        <Dropdown overlay={menu} trigger={['click']} placement="topCenter">
          <LogoutOutlined style={{ color: "#000" }} />
        </Dropdown>
      ),
    },
  ];

  // Combine both menu items into a single array
  const tabs = [...menuItems, ...downmenuItems];

  // Determine the active tab based on the current URL
  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = tabs.findIndex(tab => tab.link === currentPath);
    if (activeIndex !== -1) {
      setActiveTab(activeIndex);
    } else {
      setActiveTab(0); // Default to first tab if none match
    }
  }, [location.pathname, tabs]);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div className="mobilebar-container mobile-layout">
      {/* Navigation Tabs */}
      <nav className="mobilebar-tab">
        {tabs.map((tab, index) => (
          <Tooltip title={tab.text || ""} key={index} placement="top">
            <div
              className={`mobilebar-tab-item ${activeTab === index ? 'active' : ''}`}
              onClick={() => handleTabClick(index)}
            >
              {console.log(tab, tab.allow, tab.disabled)
              }
              <Button style={{ display: (tab.disabled && !tab.allow) ? 'none' : 'block' }} ghost type='link' size='large'>
                {
                  (tab.allow && tab.disabled) ? (
                    <>
                      <a className="mobilebar-tab__icon" >
                        {tab.icon}
                        <span className="mobilebar-tab__text">{tab.text}</span>
                      </a>
                    </>
                  ) : (
                    <Link to={tab.link} className="mobilebar-tab__icon" >
                      {tab.icon}
                      <span className="mobilebar-tab__text">{tab.text}</span>
                    </Link>
                  )
                }
              </Button>
            </div>
          </Tooltip>
        ))}
        <div
          className="mobilebar-tab-overlay"
          style={{ left: `${activeTab * (100 / tabs.length)}%` }}
        ></div>
      </nav>
    </div >
  );
};

export default MobileTabBar;
