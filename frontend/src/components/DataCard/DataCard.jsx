import React, { useState, useEffect, useContext } from 'react';
import { Card, Input, Dropdown, Menu, Tag, Row, Col, Divider, Popconfirm } from 'antd';
import { SearchOutlined, EllipsisOutlined, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import crudOperations from '../../utils/crud';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { handlePrintCurrent } from '../../utils/print';

const statusTags = {
    awaitingVerification: <Tag icon={<ExclamationCircleOutlined />} color="orange">Awaiting Verification</Tag>,
    verified: <Tag icon={<CheckCircleOutlined />} color="success">Verified</Tag>,
    awaitingLoadInputs: <Tag icon={<ClockCircleOutlined />} color="default">Awaiting Load Inputs</Tag>,
    loading: <Tag icon={<SyncOutlined spin />} color="processing">Loading</Tag>,
    notVerified: <Tag icon={<CloseCircleOutlined />} color="error">Not Verified</Tag>,
    weighbridgeOut: <Tag icon={<ExclamationCircleOutlined />} color="orange">Weighbridge OUT</Tag>,
    weighbridgeIn: <Tag icon={<ClockCircleOutlined />} color="default">Weighbridge IN</Tag>,
    awaitingLoading: <Tag icon={<ClockCircleOutlined />} color="default">Awaiting Loading</Tag>
};

const DataCard = ({ rows, columns, param, native }) => {
    const [searchValue, setSearchValue] = useState('');
    const [filteredData, setFilteredData] = useState(rows);
    const { token, globalPermissions, tableDisplayName, globalRoles } = useContext(AuthContext)
    const [canUpdate, setCanUpdate] = useState(false)
    const [canDelete, setCanDelete] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const entity = param;
        const hasUpdatePermission = globalPermissions.includes(`${entity}.update`);
        const hasDeletePermission = globalPermissions.includes(`${entity}.delete`);
        setCanUpdate(hasUpdatePermission)
        setCanDelete(hasDeletePermission)
    }, [])

    const omitFields = ['status', 'spotId', 'actions']


    useEffect(() => {
        if (searchValue) {
            setFilteredData(
                rows.filter(item =>
                    Object.values(item).some(val =>
                        val?.toString().toLowerCase().includes(searchValue.toLowerCase())
                    )
                )
            );
        } else {
            setFilteredData(rows);
        }
    }, [searchValue, rows]);

    const handleEditClick = (id) => {
        if (native) {
            navigate(`/${param}/${id}`)
        }
        else {
            navigate(`/form/${param}/${id}`)
        }
    }

    const handleDeleteClick = (id) => {
        crudOperations.deleteData(param, id, token);
        setFilteredData((prevRows) => prevRows.filter(row => row._id !== id));
    };

    const menu = (id) => (
        <Menu>
            <Menu.Item key="update" disabled={!canUpdate} onClick={() => handleEditClick(id)}>Update</Menu.Item>
            <Popconfirm
                title="Delete this data"
                description="Are you sure to delete this data?"
                onConfirm={() => handleDeleteClick(id)}
                placement="topLeft"
                icon={
                    <QuestionCircleOutlined
                        style={{
                            color: 'red',
                        }}
                    />
                }
            >
                <Menu.Item key="delete" disabled={!canDelete} >Delete</Menu.Item>
            </Popconfirm>
            <Menu.Item key="print" onClick={() => handlePrintCurrent(id, param, token, globalRoles, tableDisplayName)}>Print</Menu.Item>
        </Menu>
    );

    return (
        <div>
            <Divider style={{ margin: '1rem 0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }} />

            <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
                onChange={e => setSearchValue(e.target.value)}
            />

            <Divider style={{ margin: '1.2rem 0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }} />

            <Row gutter={[16, 16]} style={{}}>
                {filteredData.map(item => (
                    <Col key={item._id} xs={24} sm={24} lg={24}>
                        <Card
                            // title={param == 'master' && (`${item.spotId || 'N/A'}`)}
                            title={param === 'master' && (
                                item.spotId ?
                                    <a onClick={() => handleEditClick(item._id)} style={{ cursor: 'pointer', color: '#1890ff', textDecoration: 'underline' }}>
                                        {item.spotId}
                                    </a>
                                    : 'Current Record'
                            )}
                            extra={
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {statusTags[item.status] || <Tag color="red">Unknown</Tag>}
                                        <Dropdown overlay={menu(item._id)} trigger={['click']}>
                                            <EllipsisOutlined style={{ fontSize: '20px' }} />
                                        </Dropdown>
                                    </div>
                                </>
                            }
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    {columns.filter(c => !(omitFields.includes(c.field))).map(column => (
                                        <p key={column.field}>
                                            <strong>{column.headerName}:</strong> {item[column.field] ?? 'N/A'}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default DataCard;
