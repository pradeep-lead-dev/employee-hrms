import React, { useState, useEffect, useContext } from "react";
import { Card, Col, Row, Input, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import "./Setting.css";

import obj from "./object.png";
import Form from "./form.png";
import Auto from "./auto.png";
import Help from "./help.png";
import role from "./user.png";
import contact from "./contact.png";
import Acess from "./role.png";
import Privacy from "./Privacy.png";
import camera from "./cam.png";
import status from "./status.png";
import { AuthContext } from "../../context/AuthContext";

const CardComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFlip, setShowFlip] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [showPage, setShowPage] = useState(false);
  const navigate = useNavigate();
  const { globalPermissions } = useContext(AuthContext)

  useEffect(() => {
    setShowPage(true);
    const timer = setTimeout(() => {
      setShowFlip(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // const cardData = [
  //   {
  //     path: "/table/camera",
  //     imageSrc: camera,
  //     title: "Camera",
  //     description: "Manage camera settings and performance.",
  //     groupName: "Device Configuration",
  //     disabled: !(globalPermissions.includes(`camera.read`))
  //   },
  //   {
  //     path: "/table/objects",
  //     imageSrc: obj,
  //     title: "Object",
  //     description: "Manage object detection settings.",
  //     groupName: "Device Configuration",
  //     disabled: !(globalPermissions.includes(`objects.read`))
  //   },
  //   {
  //     path: "/table/contacts",
  //     imageSrc: contact,
  //     title: "Contact",
  //     description: "Manage contacts for object detection.",
  //     groupName: "Device Configuration",
  //     disabled: !(globalPermissions.includes(`contacts.read`))
  //   },
  //   {
  //     path: "/table/users",
  //     imageSrc: role,
  //     title: "Users",
  //     description: "Manage the number of users in the system.",
  //     groupName: "User Management",
  //     disabled: !(globalPermissions.includes(`users.read`))
  //   },
  //   {
  //     path: "/table/roles",
  //     imageSrc: Acess,
  //     title: "Roles",
  //     description: "Manage user roles and permissions.",
  //     groupName: "User Management",
  //     disabled: !(globalPermissions.includes(`roles.read`))
  //   },
  //   {
  //     path: "/table/native/forms/",
  //     imageSrc: Form,
  //     title: "Form",
  //     description: "Create and manage custom forms.",
  //     groupName: "Configuration Management",
  //     disabled: !(globalPermissions.includes(`forms.read`))
  //   },
  //   {
  //     path: "/table/native/workflow/",
  //     imageSrc: Auto,
  //     title: "Automation",
  //     description: "Build and manage automation process.",
  //     groupName: "Configuration Management",
  //     disabled: !(globalPermissions.includes(`workflow.read`))
  //   },
  //   {
  //     path: "/table/status",
  //     imageSrc:status ,
  //     title: "Status",
  //     description: "Flow Framework for whole process.",
  //     groupName: "Configuration Management",
  //     disabled: !(globalPermissions.includes(`status.read`))
  //   },
  //   {
  //     path: "/privacypolicy",
  //     imageSrc: Privacy,
  //     title: "Privacy",
  //     description: "Manage and configure privacy settings.",
  //     groupName: "Privacy",
  //     disabled: false
  //   },
  //   {
  //     path: "/form/help",
  //     imageSrc: Help,
  //     title: "Help",
  //     description: "Access help and support resources.",
  //     groupName: "Support",
  //     disabled: !(globalPermissions.includes(`help.read`))
  //   },
  // ];


  const cardData = [

    // {
    //   path: "/table/contacts",
    //   imageSrc: contact,
    //   title: "Contact",
    //   description: "Manage contacts for object detection.",
    //   groupName: "Device Configuration",
    //   disabled: !(globalPermissions.includes(`contacts.read`))
    // },
    {
      path: "/table/users",
      imageSrc: role,
      title: "Users",
      description: "Manage the number of users in the system.",
      groupName: "User Management",
      disabled: !(globalPermissions.includes(`users.read`))
    },
    {
      path: "/table/roles",
      imageSrc: Acess,
      title: "Roles",
      description: "Manage user roles and permissions.",
      groupName: "User Management",
      disabled: !(globalPermissions.includes(`roles.read`))
    },
    {
      path: "/table/native/forms/",
      imageSrc: Form,
      title: "Form",
      description: "Create and manage custom forms.",
      groupName: "Configuration Management",
      disabled: !(globalPermissions.includes(`forms.read`))
    },
    {
      path: "/table/native/workflow/",
      imageSrc: Auto,
      title: "Automation",
      description: "Build and manage automation process.",
      groupName: "Configuration Management",
      disabled: !(globalPermissions.includes(`workflow.read`))
    },
    // {
    //   path: "/table/status",
    //   imageSrc: status,
    //   title: "Status",
    //   description: "Flow Framework for whole process.",
    //   groupName: "Configuration Management",
    //   disabled: !(globalPermissions.includes(`status.read`))
    // },
    // {
    //   path: "/table/employee",
    //   imageSrc: contact,
    //   title: "Supervisors",
    //   description: "Manage Supervisor Details.",
    //   groupName: "User Management",
    //   disabled: !(globalPermissions.includes(`employee.read`))
    // },
    {
      path: "/privacypolicy",
      imageSrc: Privacy,
      title: "Privacy",
      description: "Manage and configure privacy settings.",
      groupName: "Privacy",
      disabled: false
    },
    {
      path: "/table/history",
      imageSrc: status,
      title: "History",
      description: "Manage history across the tool.",
      groupName: "Logs",
      disabled: !(globalPermissions.includes(`history.read`))
    },
    {
      path: "/form/help",
      imageSrc: Help,
      title: "Help",
      description: "Access help and support resources.",
      groupName: "Support",
      disabled: !(globalPermissions.includes(`help.read`))
    },
    // {
    //   path: "/table/dueSetter",
    //   imageSrc: Auto,
    //   title: "Due Setter",
    //   description: "Manage and configure dues for specific counts.",
    //   groupName: "Device Configuration",
    //   disabled: !(globalPermissions.includes(`dueSetter.read`))
    // }
  ];


  const filteredCards = cardData.filter((card) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      card.title.toLowerCase().includes(searchLower) ||
      card.description.toLowerCase().includes(searchLower) ||
      card.groupName.toLowerCase().includes(searchLower)
    );
  }).filter(filterCard => {
    return !(filterCard.disabled)
  })

  const groupCards = () => {
    return filteredCards.reduce((acc, card) => {
      const { groupName } = card;
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(card);
      return acc;
    }, {});
  };

  const groupedCards = groupCards();

  const handleCardClick = (card) => {
    setAnimateOut(true);
    setTimeout(() => {
      navigate(card.path);
    }, 600);
  };

  return (
    <CSSTransition
      in={showPage}
      timeout={600}
      classNames="fade"
      unmountOnExit
      onExited={() => {
        setAnimateOut(false);
        setShowFlip(true);
      }}
    >
      <div className="page-container">
        <div
          className="search-settings"
          style={{ display: "flex", justifyContent: "center", marginBottom: 40, paddingTop: '10px' }}
        >
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "350px",
              borderRadius: "8px",
              padding: "8px",
              // border: "1px solid #d9d9d9",
              // boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          // onPressEnter={() => console.log("Search:", searchTerm)}
          />
        </div>

        <div>
          {Object.keys(groupedCards).map((groupName) => (
            <div key={groupName}>
              <h2 style={{ color: "gray", textAlign: "left" }}>{groupName}</h2>
              <Row gutter={[16, 16]} style={{ marginTop: "15px" }}>
                {groupedCards[groupName].map((card, index) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={index}>
                    <Card
                      onClick={() => handleCardClick(card)}
                      className="custom-card"
                      // hoverable
                      style={{
                        // borderRadius: "12px",
                        cursor: 'pointer'
                        // transition: "transform 0.2s",
                        // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    // onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    // onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <div className="custom-card-body" style={{ textAlign: "center" }}>
                        <img
                          src={card.imageSrc}
                          alt={card.title}
                          className="card-image"
                          style={{ maxWidth: "100%", height: "auto", marginBottom: "10px" }}
                        />
                        <h3 className="card-title" style={{ fontSize: "16px", margin: "5px 0" }}>{card.title}</h3>
                        <p className="card-description" style={{ fontSize: "14px", color: "#555" }}>{card.description}</p>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Divider />
            </div>
          ))}

          {filteredCards.length === 0 && <p>No results found</p>}
        </div>
      </div>
    </CSSTransition>
  );
};

export default CardComponent;
