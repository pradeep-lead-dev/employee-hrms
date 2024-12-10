import React, { useState, useEffect, useRef, useContext } from "react";
import "./navbar.css";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import { Avatar } from "antd"; // Ant Design Avatar
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import SettingsIcon from "@mui/icons-material/Settings";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import VideocamIcon from "@mui/icons-material/Videocam";
import { Link, useLocation } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import logo2 from "./logo.svg";
import RouterOutlet from "../../routes/RouterOutlet"; // Ensure this is correctly imported
import MobileTabBar from "./MobileTabBar";
import { AuthContext } from "../../context/AuthContext";
// import { LogoutOutlined } from "@mui/icons-material";
import { convertToNormalString } from "../../utils/StringTransformation";
import { BarChartOutlined, ProductFilled, ProductOutlined, SettingFilled, VideoCameraFilled, LogoutOutlined } from "@ant-design/icons";
import MobileAppBar from "../MobileAppBar/MobileAppBar";
// import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolderIcon"

const drawerWidth = 65;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// Function to generate a dynamic color based on user's name
const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// Updated function to handle multiple words and extract initials
const getInitials = (fullName) => {
  const nameArray = fullName.split(" ");
  const firstInitial = nameArray[0]?.[0]?.toUpperCase() ?? "";
  const lastInitial = nameArray[1]?.[0]?.toUpperCase() ?? "";
  return `${firstInitial}${lastInitial}`;
};

// Menu items for the navigation

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  position: "fixed",
  zIndex: theme.zIndex.drawer + 1,
  height: "100vh",
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
}));

export default function Navbar() {
  const { user, logout, globalPermissions } = useContext(AuthContext);

  // useEffect(() => {
  //   const hasUpdatePermission = globalPermissions.includes(`${entity}.update`);
  //   const hasDeletePermission = globalPermissions.includes(`${entity}.delete`);
  //   setCanUpdate(hasUpdatePermission)
  //   setCanDelete(hasDeletePermission)
  // }, [])


  const menuItems = [
    { text: "Dashboard", icon: <BarChartOutlined style={{ color: "#000", fontSize: '18px' }} />, link: "", disabled: !(globalPermissions.includes(`dashboard.read`)) },
    // { text: "Orders", icon: <ProductFilled style={{color:"#000", fontSize: '18px'}} />, link: "table/master", disabled: !(globalPermissions.includes(`master.read`)) },
    // { text: "Spot", icon: <VideoCameraFilled style={{color:"#000", fontSize: '18px'}} />, link: "live-detection",  disabled: !(globalPermissions.includes(`spot.read`)) },
    { text: "Timesheets", icon: <ProductFilled style={{color:"#000", fontSize: '18px'}} />, link: "timesheets",  disabled: !(globalPermissions.includes(`timesheets.read`)) },
    { text: "Settings", icon: <SettingFilled style={{ color: "#000", fontSize: '18px' }} />, link: "settings" },
  ];

  // Dynamic menu items at the bottom with avatar and logout
  const downmenuItems = [
    {
      text: convertToNormalString(user?.username) || 'User',
      icon: (
        <Avatar size='large'
          sx={{ width: 32, height: 32 }}
          style={{ backgroundColor: '#D61A0C' }} // Dynamic color for avatar
        >
          {user?.username ? user?.username.charAt(0).toUpperCase() : 'U'}
        </Avatar>
      ),
      link: `profile/users/${user?.user_id}`
    },
    {
      text: "Logout",
      icon: <LogoutOutlined style={{ color: "black", fontSize: '18px' }} />, // corrected from Icon to icon
      action: logout,
    },
  ];

  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [indicatorPosition, setIndicatorPosition] = useState(0); // Indicator state
  const location = useLocation(); // Get the current location
  const itemRefs = useRef([]); // To track item positions for indicator
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 600); // State for mobile view

  // Set the active item based on the current URL
  useEffect(() => {
    const currentPath = location.pathname; // Get the full current path

    // Find the menu item where the path starts with the item's link
    const activeMenuItem =
      menuItems.find((item) =>
        item.link === "" ? currentPath === "/" : currentPath.startsWith(`/${item.link}`)
      ) ||
      downmenuItems.find((item) => currentPath.startsWith(`/${item.link}`));

    if (activeMenuItem) {
      setActiveItem(activeMenuItem.text);
    } else {
      setActiveItem("");
    }

    // Find the index of the active menu item
    const activeIndex = menuItems.findIndex((item) =>
      item.link === "" ? currentPath === "/" : currentPath.startsWith(`/${item.link}`)
    );

    if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
      const { offsetTop } = itemRefs.current[activeIndex];
      setIndicatorPosition(offsetTop);
    } else {
      setIndicatorPosition(0); // Default position if no menu item is active
    }
  }, [location]);

  // Update mobile view state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 600); // Adjust the width as per your design requirements
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup on unmount
    };
  }, []);

  return (
    <Box sx={{ display: "flex", position: "relative", overflow: "hidden" }}>
      {/* Sidebar Navigation */}
      {!isMobileView && (
        <div
          className="mainflex"
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        >
          <Drawer
            variant="permanent"
            open={open || hover}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <List
              id="sidebar"
              className="navbar-icon"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                padding: 0,
                position: "relative", // Ensure relative positioning for the indicator
                // borderRight: '3px solid #e31837'
              }}
            >
              {/* Logo Section */}
              <div
                className="imgflex"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                }}
              >
                <img
                  src={logo2}
                  alt="Dotspot"
                  width="50px"
                  className="rotate-logo"
                />
              </div>

              {/* Menu Items Section */}
              <div className="upflex" style={{ position: "relative" }}>
                {/* Indicator */}
                <div
                  id="indicator"
                  className="indicator"
                  style={{
                    position: "absolute",
                    width: "4px",
                    top: indicatorPosition,
                    height: "48px",
                    transition: "top 0.3s ease",
                    left: 0.5,
                    backgroundColor: "#D61A0C", // Ensure the indicator is visible
                  }}
                ></div>
                {menuItems.map((item, index) => (
                  <ListItem
                    key={item.text}
                    id={item.text}
                    disablePadding
                    ref={(el) => (itemRefs.current[index] = el)}
                  >
                    <Tooltip title={item.text} placement="right" className="tooltip-margin" style={{ display: item.disabled ? 'none' : 'flex' }}>

                      <ListItemButton
                        component={Link}
                        to={item.link === "" ? "/" : `/${item.link}`}
                        onClick={() => setActiveItem(item.text)}
                        sx={{
                          minHeight: 48,
                          justifyContent: "center",
                          alignItems: 'center',
                          display: "flex",
                          position: "relative", // Ensure relative positioning
                        }}
                      >

                        <ListItemIcon
                          sx={{
                            color: activeItem === item.text ? "#000" : "#fff",
                            minWidth: 0,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </div>

              {/* Lower Section Menu Items */}
              <div className="downflex">
                {downmenuItems.map((item) => (
                  <ListItem key={item.text} id={item.text} disablePadding>
                    <Tooltip title={item.text} placement="right" className="tooltip-margin">
                      <ListItemButton
                        component={item.link ? Link : ListItemButton}
                        to={item.link ? `/${item.link}` : ""}
                        onClick={() => item.action && item.action()}
                        sx={{
                          minHeight: 48,
                          justifyContent: "center",
                          display: "flex",
                          position: "relative",
                        }}
                      >

                        <ListItemIcon
                          sx={{
                            color: activeItem === item.text ? "#000" : "#fff",
                            minWidth: 0,
                            marginRight: "auto",
                            marginLeft: "auto",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </div>
            </List>
          </Drawer>
        </div>
      )}

      {/* Main Content Area */}
      <Box
        id="main"
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: isMobileView ? 0 : `calc(${theme.spacing(7)} + 1px)`, // Adjust margin based on view
          overflowX: "hidden",
          width: `calc(100% - ${isMobileView ? 0 : `${theme.spacing(7)} + 1px`})`,
        }}
      >
        <DrawerHeader />
        <RouterOutlet />
      </Box>

      {/* Render Mobile Tab Bar only on mobile view */}
      {isMobileView && <MobileAppBar />}
    </Box>
  );
}
