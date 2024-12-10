import React, { useState, useEffect } from 'react';
import { Layout, Typography, Modal, Button, BackTop } from 'antd';
import './PrivacyPolicy.css'; // Custom styling for a modern business-standard look

const { Title, Paragraph, Text } = Typography;
const { Content, Footer } = Layout;

const PrivacyPolicy = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const cookiesConsent = localStorage.getItem('cookiesConsent');
    if (!cookiesConsent) {
      setIsModalVisible(true);
    }
    window.scrollTo(0, 0); // Scroll to top on page load
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesConsent', 'accepted');
    setIsModalVisible(false);
  };

  const handleRejectCookies = () => {
    localStorage.setItem('cookiesConsent', 'rejected');
    setIsModalVisible(false);
  };

  return (
    <Layout className="privacy-layout">
      <Content className="privacy-content">
        <Title level={2} className="privacy-title">Privacy Policy</Title>

        <Paragraph className="privacy-intro">
          At Dotspot, we are deeply committed to safeguarding the privacy of our users and stakeholders. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. We encourage you to read this policy carefully to understand our approach and practices concerning your data.
        </Paragraph>

        <Title level={3} className="section-title">1. Overview of Dotspot</Title>

        <Paragraph className="privacy-paragraph">
          Dotspot is a comprehensive object detection and counting system, designed to automate object recognition at scale, reducing manual labor and enhancing operational efficiency. From the moment a vehicle enters our monitored area until it leaves, our system offers round-the-clock surveillance and monitoring. This system is primarily aimed at boosting productivity, increasing workplace safety, and preventing theft.
        </Paragraph>

        <Title level={3} className="section-title">2. Data We Collect</Title>
        <Paragraph className="privacy-paragraph">
          In the course of using Dotspot, we may collect data related to vehicle movement, object detection feeds, and system performance logs. While our focus is on non-personal operational data, any personal information collected will be with explicit consent and in strict compliance with applicable privacy regulations.
        </Paragraph>

        <Title level={3} className="section-title">3. How We Use the Data</Title>
        <Paragraph className="privacy-paragraph">
          The data collected by Dotspot is utilized to enhance system efficiency, provide real-time object detection, and ensure the continuous improvement of our services. Data may also be used for security purposes, including the prevention of theft and monitoring compliance with safety protocols.
        </Paragraph>

        <Title level={3} className="section-title">4. Data Protection Measures</Title>
        <Paragraph className="privacy-paragraph">
          Dotspot implements stringent security measures to protect the data we collect. These measures include data encryption, secure access protocols, and continuous system monitoring to detect and prevent unauthorized access or data breaches. We take your data security seriously and comply with all relevant laws and regulations.
        </Paragraph>

        <Title level={3} className="section-title">5. Use of Cookies</Title>
        <Paragraph className="privacy-paragraph">
          Dotspot uses cookies to enhance user experience and track system usage for performance improvements. Cookies are small text files stored on your device that help us understand user preferences and optimize our services. By continuing to use our site, you consent to our use of cookies as outlined in this policy.
        </Paragraph>

        <Title level={3} className="section-title">6. Policy Updates</Title>
        <Paragraph className="privacy-paragraph">
          We reserve the right to update this Privacy Policy at any time. Any changes will be promptly reflected on this page, and we encourage you to review this page periodically for the latest information on our privacy practices.
        </Paragraph>

        <Title level={3} className="section-title">7. Contact Information</Title>
        <Paragraph className="privacy-paragraph">
          If you have any questions, concerns, or feedback regarding our Privacy Policy, please do not hesitate to contact us at <Text strong>operations@dotsito.com</Text>
        </Paragraph>

        {/* Cookies Consent Modal */}
        <Modal
          title="Cookies Consent"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="reject" onClick={handleRejectCookies}>
              Reject
            </Button>,
            <Button key="accept" type="primary" onClick={handleAcceptCookies}>
              Accept
            </Button>,
          ]}
        >
          <Paragraph>
            We use cookies to enhance your browsing experience and provide analytical data to improve our services. By accepting, you agree to the use of cookies as per our Privacy Policy.
          </Paragraph>
        </Modal>

        {/* Back to Top Button */}
        <BackTop />
      </Content>

      <Footer className="privacy-footer">
        <Text className="copyright">© 2024 Dotsito Technologies. All rights reserved.</Text>
      </Footer>
    </Layout>
  );
};

export default PrivacyPolicy;
