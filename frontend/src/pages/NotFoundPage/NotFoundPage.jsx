import React, { useContext } from 'react'
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const NotFoundPage = ({ code, title, subtitle }) => {
  const { homePage } = useContext(AuthContext)
  const navigate = useNavigate()
  const navigateToHome = () => {
    navigate(homePage)
  }
  return (
    <Result
      status={code || '404'}
      title={title || "Oops! Something went wrong."}
      subTitle={subtitle ||
        <div>
          <p>
            The page you're trying to access may not be available due to permissions, server issues, or it no longer exists.
          </p>
          <p>
            Please try again later or contact the administrator for assistance.
          </p>
        </div>
      }
      extra={<Button type="primary" onClick={navigateToHome}>Take me home</Button>}
    />
  )
}

export default NotFoundPage