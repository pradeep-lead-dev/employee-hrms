import React, { useState } from 'react';
import { Table, Input, Button, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const Splitup = () => {
  const [dataSource, setDataSource] = useState([
    { key: 0, splitKey: '', splitValue: 0 },
  ]);

  // Handle adding a new row
  const handleAddRow = () => {
    const newKey = dataSource.length;
    setDataSource([...dataSource, { key: newKey, splitKey: '', splitValue: 0 }]);
  };

  // Handle removing a row
  const handleRemoveRow = (key) => {
    const newDataSource = dataSource.filter((item) => item.key !== key);
    setDataSource(newDataSource);
  };

  // Handle input change
  const handleInputChange = (key, field, value) => {
    const newValue = field === 'splitValue' ? parseFloat(value) || 0 : value;
    const newDataSource = dataSource.map((item) =>
      item.key === key ? { ...item, [field]: newValue } : item
    );
    setDataSource(newDataSource);
    console.log(JSON.stringify(dataSource, null, 2));
    
  };

  // Calculate total sum of splitValue
  const totalSum = dataSource.reduce((acc, item) => acc + (parseFloat(item.splitValue) || 0), 0);

  // Define table columns
  const columns = [
    {
      title: 'Split Key',
      dataIndex: 'splitKey',
      key: 'splitKey',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(record.key, 'splitKey', e.target.value)}
        />
      ),
    },
    {
      title: 'Split Value',
      dataIndex: 'splitValue',
      key: 'splitValue',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleInputChange(record.key, 'splitValue', e.target.value)}
          type="number" // Allow only numbers
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="danger"
            icon={<MinusOutlined />}
            onClick={() => handleRemoveRow(record.key)}
            disabled={dataSource.length === 1} // Disable remove button if there's only one row
          />
        </Space>
      ),
    },
  ];

  // Add total row at the bottom showing the sum of all splitValues
  const totalRow = {
    splitKey: 'Total Sum',
    splitValue: totalSum,
    key: 'total',
  };

  return (
    <>
      <Table
        dataSource={[...dataSource, totalRow]}
        columns={columns}
        pagination={false}
        rowKey="key"
        footer={() => (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRow}
          >
            Add Row
          </Button>
        )}
      />
    </>
  );
};

export default Splitup;