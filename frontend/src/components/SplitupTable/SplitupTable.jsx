import React, { useState, useEffect, useContext } from 'react';
import { Table, InputNumber, Select, Button, Modal } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './SplitupTable.css';  // Import updated CSS file for spacing and mobile table formatting

export const SplitupTable = ({ splitUpData, setSplitUpData, tableNameForDropdown, setSplitUpDataKey, field, disabledRule,setDynamicCount }) => {

  const { defaultToken } = useContext(AuthContext);
  const tableHeaders = [
    { name: 'variant', displayName: 'Variant' },
    { name: 'targetCount', displayName: 'Target Count' },
    { name: 'actualCount', displayName: 'Actual Count' },
  ];

  setSplitUpDataKey(field.key);

  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 580); // Adjust for 580px width
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/formdata/${tableNameForDropdown}`, {
          headers: {
            "Query-Field": 'tableName',
            "Authorization": `Bearer ${defaultToken}`
          }
        });
        setDropdownOptions(response.data.data);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    fetchFormData();

    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 580; // Use 580px as the mobile threshold
      setIsMobile(isNowMobile);
      // Automatically close modal when switching from mobile to desktop view (above 580px)
      if (!isNowMobile && isModalVisible) {
        setIsModalVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [tableNameForDropdown, isModalVisible]);

  const [dataSource, setDataSource] = useState(
    splitUpData ? splitUpData : [{ key: 0, variant: null, targetCount: null, actualCount: 0 }]
  );
  const [count, setCount] = useState(dataSource.length || 1);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalActual, setTotalActual] = useState(0);

  useEffect(()=>{
    setDynamicCount(totalTarget)
  },[totalTarget])

  useEffect(() => {
    const totalTargetCount = dataSource.reduce((acc, row) => acc + (parseInt(row.targetCount) || 0), 0);
    const totalActualCount = dataSource.reduce((acc, row) => acc + (parseInt(row.actualCount) || 0), 0);
    setTotalTarget(totalTargetCount);
    setTotalActual(totalActualCount);
    setSplitUpData(dataSource);
  }, [dataSource]);

  const handleAddRow = () => {
    const lastRow = dataSource[dataSource.length - 1];
    if (!lastRow.variant || lastRow.targetCount === null || lastRow.targetCount <= 0) {
      toast.error('Please fill the variant and set a valid target count greater than 0 before adding a new row.');
      return;
    }
    const newRow = { key: count, variant: null, targetCount: null, actualCount: 0 };
    setDataSource([...dataSource, newRow]);
    setCount(count + 1);
  };

  const handleDeleteRow = (key) => {
    setDataSource(dataSource.filter((row) => row.key !== key));
    setCount(count - 1);
  };

  const handleDropdownChange = (value, key) => {
    const newData = dataSource.map((row) => {
      if (row.key === key) {
        return { ...row, variant: value };
      }
      return row;
    });
    setDataSource(newData);
  };

  const handleTargetCountChange = (value, key) => {
    const newData = dataSource.map((row) => {
      if (row.key === key) {
        return { ...row, targetCount: value };
      }
      return row;
    });
    setDataSource(newData);
  };

  const handleActualCountChange = (value, key) => {
    const newData = dataSource.map((row) => {
      if (row.key === key) {
        return { ...row, actualCount: value };
      }
      return row;
    });
    setDataSource(newData);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderVariantDropdown = (record, availableOptions) => {
    return (
      <Select
        style={{ width: '100%' }}
        showSearch
        placeholder="Select or search a variant"
        value={record.variant}
        optionFilterProp="children"
        onChange={(value) => handleDropdownChange(value, record.key)}
        filterOption={(input, option) =>
          option.children.toLowerCase().includes(input.toLowerCase())
        }
        disabled={disabledRule}
        // labelInValue
                
      >
        {availableOptions.map(option => (
          <Select.Option key={option.displayName} value={option.name}>
            {option.displayName}
          </Select.Option>
        ))}
      </Select>
    );
  };

  const columns = [
    {
      title: tableHeaders[0].displayName,
      dataIndex: 'variant',
      fixed: 'left',
      render: (_, record) => {
        const selectedVariants = dataSource.map((row) => row.variant).filter(Boolean);
        const availableOptions = dropdownOptions.filter((option) => !selectedVariants.includes(option.name));
        return (
          <>
            <span className="mobile-label">Variant</span>
            {renderVariantDropdown(record, availableOptions)}
          </>
        );
      },
    },
    {
      title: tableHeaders[1].displayName,
      dataIndex: 'targetCount',
      render: (_, record) => (
        <>
          <span className="mobile-label">Target Count</span>
          <InputNumber
            placeholder="Enter target count"
            min={0}
            value={record.targetCount}
            style={{ width: '100%', backgroundColor: disabledRule ? '#f5f5f5' : '#fff' }}
            onChange={(value) => handleTargetCountChange(value, record.key)}
            required
            readOnly={disabledRule}
          />
        </>
      ),
    },
    {
      title: tableHeaders[2].displayName,
      dataIndex: 'actualCount',
      render: (_, record) => (
        <>
          <span className="mobile-label">Actual Count</span>
          <InputNumber
            value={record.actualCount}
            readOnly
            min={0}
            style={{
              width: '100%',
              backgroundColor: '#f5f5f5'
            }}
            onChange={(value) => handleActualCountChange(value, record.key)}
            required
          />
        </>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) =>
      (
        <Button
          icon={<MinusOutlined />}
          danger
          size='small'
          shape='circle'
          disabled={dataSource.length <= 1 || disabledRule}
          onClick={() => handleDeleteRow(record.key)}
        />
      )
    },
  ];

  return (
    <>
      {isMobile && (
        <div className="create-button-wrapper">
          <Button type="primary" onClick={showModal}>
            View Details
          </Button>
        </div>
      )}

      <Modal
        title="Package Data"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        width="100%"  
        bodyStyle={{ height: '80vh', overflow: 'auto' }}  
      >
        <div className="splitup-table-wrapper modal-table-spacing">
          <Table
            className="custom-ant-table"
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            rowKey="key"
            scroll={{ x: true }}
            size='small'
            summary={() => (
              <>
                {count < dropdownOptions.length && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell>
                      <Button
                        size='small'
                        icon={<PlusOutlined />}
                        onClick={handleAddRow}
                        shape='circle'
                        disabled={disabledRule}
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell />
                    <Table.Summary.Cell />
                  </Table.Summary.Row>
                )}
                <Table.Summary.Row style={{ fontWeight: 650 }}>
                  <Table.Summary.Cell>
                    {isMobile && <span>Total Package Count</span>} {/* Show "Package Count" in mobile view */}
                    <InputNumber
                      id='total-target'
                      value={totalTarget}
                      readOnly
                      min={0}
                      style={{
                        width: '100%',
                        backgroundColor: '#f5f5f5'
                      }}
                      required
                    />
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    {isMobile && <span>Total Actual Count</span>} {/* Show "Actual Count" in mobile view */}
                    <InputNumber
                      id='total-actual'
                      value={totalActual}
                      readOnly
                      min={0}
                      style={{
                        width: '100%',
                        backgroundColor: '#f5f5f5'
                      }}
                      required
                    />
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              </>
            )}
          />
        </div>
      </Modal>

      {!isMobile && (
        <div className="splitup-table-wrapper">
          <Table
            className="custom-ant-table"
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            rowKey="key"
            scroll={{ x: true }}
            size='small'
            summary={() => (
              <>
                {count < dropdownOptions.length && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell>
                      <Button
                        size='small'
                        icon={<PlusOutlined />}
                        onClick={handleAddRow}
                        shape='circle'
                        disabled={disabledRule}
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell />
                    <Table.Summary.Cell />
                  </Table.Summary.Row>
                )}
                <Table.Summary.Row style={{ fontWeight: 650 }}>
                  <Table.Summary.Cell>Total</Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <InputNumber
                      id='total-target'
                      value={totalTarget}
                      readOnly
                      min={0}
                      style={{
                        width: '100%',
                        backgroundColor: '#f5f5f5'
                      }}
                      required
                    />
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <InputNumber
                      id='total-actual'
                      value={totalActual}
                      readOnly
                      min={0}
                      style={{
                        width: '100%',
                        backgroundColor: '#f5f5f5'
                      }}
                      required
                    />
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              </>
            )}
          />
        </div>
      )}
    </>
  );
};
