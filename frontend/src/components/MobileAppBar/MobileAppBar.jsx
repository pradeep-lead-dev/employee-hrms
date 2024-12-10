import * as React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { BarChartOutlined, ProductFilled, SettingFilled, UserOutlined } from '@ant-design/icons';
import logo from './logo.svg';
import { Link, useNavigate } from 'react-router-dom'; // Import Link from react-router-dom
import { AuthContext } from '../../context/AuthContext';
import { Dropdown, Menu } from 'antd'; // Import Dropdown and Menu from antd
import './mobileappbar.css'

export default function MobileAppBar() {
  const [value, setValue] = React.useState(0);
  const { globalPermissions, logout, user } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      console.log(`/profile/users/${user.user_id}`);
      navigate(`/profile/users/${user.user_id}`); // Correct route handling for profile
    }
  };

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile">Profile</Menu.Item>
      <Menu.Item key="logout">Logout</Menu.Item>
    </Menu>
  );

  const menuItems = [
    { title: 'Dashboard', icon: <BarChartOutlined style={{ fontSize: '22px' }} />, link: "/", disabled: !(globalPermissions.includes('dashboard.read')) },
    { title: 'Loads', icon: <ProductFilled style={{ fontSize: '22px' }} />, link: "/table/master", disabled: !(globalPermissions.includes('master.read')) },
    { title: 'Spot', icon: <img src={logo} alt="Dotspot" width="40px" className="rotate-logo" />, link: "/live-detection", disabled: !(globalPermissions.includes('spot.read')) },
    { title: 'Settings', icon: <SettingFilled style={{ fontSize: '22px' }} />, link: "/settings", disabled: false },
    {
      title: 'Profile',
      icon: (
        <Dropdown overlay={userMenu} trigger={['click']} placement="topCenter">
          <UserOutlined style={{ fontSize: '22px', cursor: 'pointer' }} />
        </Dropdown>
      ),
      noLink: true, // Mark that no routing should happen for this item
      link: "", // Empty link for the user icon
      disabled: false, // User icon should not be hidden
    },
  ];

  const leftMenuItems = menuItems.filter((menu) => !menu.logo && !menu.disabled).slice(0, 2); // Left-side items
  const rightMenuItems = menuItems.filter((menu) => !menu.logo && !menu.disabled).slice(2); // Right-side items
  const logoItem = menuItems.find((menu) => menu.logo); // The logo item

  return (
    <div style={styles.container} className='mobile-navigation-bottom'>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        style={styles.bottomNav}
      >
        {/* Render left-side menu items */}
        {leftMenuItems.map((menu) => (
          <BottomNavigationAction
            onClick={()=>navigate(menu.link)}
            key={menu.title}
            label={menu.title}
            icon={
              <Link to={menu.link} style={styles.link}>
                {menu.icon}
              </Link>
            }
            disableRipple
            style={styles.action}
          />
        ))}

        {/* Always show the logo centered */}
        {logoItem && (
          <BottomNavigationAction
            key={logoItem.title}
            label=""
            icon={
              <Link to={logoItem.link} style={styles.link}>
                {logoItem.icon}
              </Link>
            }
            disableRipple
            style={styles.centerAction}
          />
        )}

        {/* Render right-side menu items */}
        {rightMenuItems.map((menu) => (
          !menu.noLink ? (
            <BottomNavigationAction
              key={menu.title}
              label={menu.title}
              icon={
                <Link to={menu.link} style={styles.link}>
                  {menu.icon}
                </Link>
              }
              disableRipple
              style={styles.action}
            />
          ) : (
            // Profile menu without navigation wrapping
            <BottomNavigationAction
              key={menu.title}
              label={menu.title}
              icon={menu.icon} // Render the dropdown without wrapping in Link
              disableRipple
              style={styles.action}
            />
          )
        ))}
      </BottomNavigation>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    zIndex: 999,
    height: '80px',
    paddingTop: '10px',
    background: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white for glossy effect
    backdropFilter: 'blur(10px)', // Glassy blur effect
    boxShadow: '0 -2px 15px rgba(0, 0, 0, 0.15)', // Add a shadow for more depth
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'Noto Sans',
    borderRadius: '10px 10px 0 0', // Reduced radius for a subtle curve
  },
  bottomNav: {
    width: '100%',
    maxWidth: '1200px', // Limit width for larger screens
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    backgroundColor: 'transparent',
  },
  action: {
    color: '#000',
    fontSize: '18px',
    padding: '5px 10px',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Noto Sans',
  },
  centerAction: {
    flex: 1,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'Noto Sans',
  },
  link: {
    display: 'inline-block',
    textDecoration: 'none',
    color: '#000',
  },
};
