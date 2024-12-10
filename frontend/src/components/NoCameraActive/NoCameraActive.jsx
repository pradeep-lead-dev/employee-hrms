import React from 'react';
import { Button, Result } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const NoCameraActive = () => {
  const navigate = useNavigate(0)
  return (
    <Result
    status="warning"
    title="No Camera Active"
    subTitle="There are currently no active cameras. Please check your setup or try again later."
    extra={[
      <Button type="primary" key="retry" onClick={()=>navigate(0)}>
        Retry
      </Button>,
      <Link to={'/form/help'}><Button key="contact">Contact Support</Button></Link>
    ]}
  />
  )
}

export default NoCameraActive