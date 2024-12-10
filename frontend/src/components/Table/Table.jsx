import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import './table.css'
import { Button, Divider, Popconfirm, Spin, Tag, Tooltip, Typography } from "antd";
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    QuestionCircleOutlined,
    PrinterOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    PlusOutlined,
    TableOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { camelCaseToNormal, convertToNormalString } from "../../utils/StringTransformation";
import crudOperations from "../../utils/crud";
import Export from "../Export/Export";
import NotFoundPage from "../../pages/NotFoundPage/NotFoundPage";
import { AuthContext } from "../../context/AuthContext";
import DataCard from "../DataCard/DataCard";
import Header from "../Header/Header";
import ExportRecord from "../ExportRecords/ExportRecords";
import ExportOne from "../ExportOne/ExportOne";
import { handlePrintCurrent } from "../../utils/print";


import Box from '@mui/material/Box';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';


ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Table = ({ native }) => {
    const { param } = useParams();

    const gridRef = useRef();
    const containerStyle = useMemo(() => ({ width: "100%", minHeight: '90vh' }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
    const onGridReady = useCallback((params) => {
        params.api.sizeColumnsToFit();
    }, []);

    const navigate = useNavigate()

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const { Title } = Typography;
    const { globalRoles, globalPermissions, token, defaultToken, tableDisplayName, statusFilter } = useContext(AuthContext)
    let NewstatusFilter = [, "All", ...statusFilter.sort()]
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [canCreate, setCanCreate] = useState(false)
    const [canRead, setCanRead] = useState(false)
    const [canUpdate, setCanUpdate] = useState(false)
    const [canDelete, setCanDelete] = useState(false)
    const [canExport, setCanExport] = useState(false)
    const [tableName, setTableName] = useState('')
    const [tabFilter, setTabFilter] = useState(0)
    const filterMapping = {
        "date": 'agDateColumnFilter',
        "datetime": 'agDateColumnFilter',
        'number': 'agNumberColumnFilter'
    }
    const [tabView, setTabView] = useState(param == 'master')
    const [filteredRows, setFilteredRows] = useState([])


    const handleEditClick = (id) => {
        if (native) {
            navigate(`/${param}/${id}`)
        }
        else {
            navigate(`/form/${param}/${id}`)
        }
    }

    const handleDeleteClick = (data) => {
        crudOperations.deleteData(param, data._id, token);
        setRows((prevRows) => prevRows.filter(row => row._id !== data._id));
    };


    // const statusFilterAll = ['all', ...otherStatuses];

    // Sort the statuses alphabetically (excluding "All")
    // const sortedStatusToBeFiltered = [allTab, ...otherStatuses.sort()];

    useEffect(() => {
        const getData = async () => {
            if (!param) {
                console.error("Parameter is undefined");
                return;
            }

            const entity = param;

            const hasCreatePermission = 1 || globalPermissions.includes(`${entity}.create`);
            const hasReadPermission = 1 || globalPermissions.includes(`${entity}.read`);
            const hasUpdatePermission = 1 || globalPermissions.includes(`${entity}.update`);
            const hasDeletePermission = 1 || globalPermissions.includes(`${entity}.delete`);
            const hasExportPermission = 1 || globalPermissions.includes(`${entity}.export`);

            setCanCreate(hasCreatePermission);
            setCanRead(hasReadPermission);
            setCanUpdate(hasUpdatePermission)
            setCanDelete(hasDeletePermission)
            setCanExport(hasExportPermission)

            try {
                let generatedColumns;
                let tableName;

                const res = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${param}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });


                setRows(res.data.data);
                setTableName(camelCaseToNormal(param))

                if (!native) {
                    const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/formdata/${param}`, {
                        headers: {
                            "Query-Field": 'tableName',
                            "Authorization": `Bearer ${defaultToken}`
                        }
                    });


                    setCanCreate(response.data.data.canCreate && globalPermissions.includes(`${param}.create`))
                    setCanCreate(true)

                    setTableName(response.data.data?.tableDisplayName)
                    generatedColumns = response.data.data.fields.filter(field => field.tableView
                        // && globalRoles.some(element => field.rolesToVisible.includes(element))
                    ).map((field) => {

                        return {
                            field: field.key,
                            filter: 'agTextColumnFilter',
                            minWidth: 130,
                            headerName: field.label,
                            pinned: field.tablePinnedRight ? 'right' : (field.tablePinnedLeft ? 'left' : null)
                        }
                    });
                }
                else {
                    const keys = Object.keys(res.data.data[0])
                    generatedColumns = keys.map((column, index) => {
                        return {
                            field: column,
                            headerName: camelCaseToNormal(column),
                        }
                    });
                }


                // const statusResponse = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/formdata/status`, {
                //     headers: {
                //         'Query-Field': 'tableName',
                //         'Authorization': `Bearer ${defaultToken}`
                //     }
                // });

                // const statuses = statusResponse.data.data

                // const statusIndex = generatedColumns.indexOf(generatedColumns.find(col => col.field === 'status'));

                // if (statusIndex !== -1) {
                //     generatedColumns[statusIndex] = {
                //         field: 'status',
                //         headerName: 'Status',
                //         minWidth: 200,
                //         pinned: "right",
                //         cellRenderer: (params) => {
                //             // Find the status object from the statuses array that matches the params.data.status
                //             const currentStatus = statuses.find(status => status.statusName === params.data.status);

                //             if (!currentStatus) return null;

                //             let tag;
                //             switch (currentStatus.statusType) {
                //                 case 'todo':
                //                     tag = (
                //                         <Tag icon={<ClockCircleOutlined />} color="default">
                //                             {convertToNormalString(currentStatus.statusName)}
                //                         </Tag>
                //                     );
                //                     break;
                //                 case 'inProgress':
                //                     tag = (
                //                         <Tag icon={<SyncOutlined spin />} color="processing">
                //                             {convertToNormalString(currentStatus.statusName)}
                //                         </Tag>
                //                     );
                //                     break;
                //                 case 'done':
                //                     tag = (
                //                         <Tag icon={<CheckCircleOutlined />} color="success">
                //                             {convertToNormalString(currentStatus.statusName)}
                //                         </Tag>
                //                     );
                //                     break;
                //                 case 'inReview':
                //                     tag = (
                //                         <Tag icon={<ExclamationCircleOutlined />} color="purple">
                //                             {convertToNormalString(currentStatus.statusName)}
                //                         </Tag>
                //                     );
                //                     break;
                //                 case 'cancelled':
                //                     tag = (
                //                         <Tag icon={<CloseCircleOutlined />} color="error">
                //                             {convertToNormalString(currentStatus.statusName)}
                //                         </Tag>
                //                     );
                //                     break;
                //                 default:
                //                     tag = (
                //                         <Tag icon={<ClockCircleOutlined />} color="default">
                //                             {convertToNormalString(currentStatus.statusName)}
                //                         </Tag>
                //                     );
                //             }
                //             return tag;
                //         },
                //     };
                // }


                if (hasUpdatePermission || hasDeletePermission || hasExportPermission) {
                    generatedColumns.push({
                        field: 'actions',
                        headerName: 'Actions',
                        minWidth: 180,
                        sortable: false,
                        filter: '',
                        floatingFilter: false,
                        pinned: "right",
                        cellRenderer: (params) => (
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                {hasUpdatePermission && (
                                    <Tooltip title="Edit">
                                        <Button type="primary" ghost shape="circle" icon={<EditOutlined />} onClick={() => handleEditClick(params.data._id)} />
                                    </Tooltip>
                                )}
                                {
                                    hasDeletePermission && (
                                        <Tooltip title="Delete">
                                            <Popconfirm
                                                title="Delete this data"
                                                description="Are you sure to delete this data?"
                                                onConfirm={() => handleDeleteClick(params.data)}
                                                placement="topLeft"
                                                icon={
                                                    <QuestionCircleOutlined
                                                        style={{
                                                            color: 'red',
                                                        }}
                                                    />
                                                }
                                            >
                                                <Button danger shape="circle" icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        </Tooltip>
                                    )
                                }
                                {(param == 'master' && hasExportPermission) && <Button shape="circle" icon={<PrinterOutlined />} onClick={() => handlePrintCurrent(params.data._id, param, token, globalRoles, tableDisplayName)} />} 
                            </div>

                        ),
                    });
                }


                setColumns(generatedColumns);
                setIsValid(true)
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            finally {
                setLoading(false)
            }
        };
        getData();
    }, [param, native]);

    useEffect(() => {
        
        
        if (tabView) {
            setFilteredRows(tabFilter === 0
                ? rows.filter(row=>statusFilter.includes(row.status))
                : rows.filter(
                    (row) => row.status === NewstatusFilter[tabFilter + 1]
                ))
        }
    }, [tabFilter, rows])




    const defaultColDef = useMemo(() => {
        return {
            filter: 'agTextColumnFilter',
            // floatingFilter: true,
        };
    }, []);

    const paginationPageSizeSelector = useMemo(() => {
        return [10, 20, 50, 100];
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center' }}>
                <Spin />
            </div>
        );
    }

    if (!isValid || !canRead) {
        return <NotFoundPage />
    }

    const handleClickCreateButton = () => {
        setIsLoading(true)
        setTimeout(() => {
            !native ? navigate(`/form/${param}`) : navigate(`/${param}`)
        }, 500)
    }


    const handleTableFilter = (event, newValue) => {
        setTabFilter(newValue); // Update the selected tab
    };


    const toNormalCase = (str) => {
        return str
            .replace(/([A-Z])/g, ' $1') // Add a space before each capital letter
            .trim() // Remove leading/trailing spaces
            .replace(/\b\w/g, (char) => char.toLowerCase()); // Capitalize the first letter of each word
    };

    // Filter rows based on the selected tab status



    return (
        <div className="grid-wrapper ">
            <div className="export-fixed">
                <div className="table-sticky-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'spacebetween', width: '100%', padding: '3px' }}>
                            <Title level={2} style={{ margin: 0, fontSize: '16px' }}>{param == 'master' ? tableDisplayName : camelCaseToNormal(tableName)}</Title>
                        </div>
                        <img src={import.meta.env.VITE_API_LOGO_URL} alt="client-logo" style={{ width: '70px' }} />
                    </div>
                    <Divider style={{ margin: '1rem 0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',  border: '1.5px solid #D61A0C'}} />
                </div>
                {/* <Header title={camelCaseToNormal(tableName)} /> */}



                {tabView && <><Tabs
                    value={tabFilter}
                    onChange={handleTableFilter}
                    variant="scrollable"
                    scrollButtons="on" // Always show the scroll buttons
                    aria-label="visible arrows tabs example"
                    sx={{
                        display: 'flex',
                        // justifyContent: 'center', // Center the entire Tabs container
                        [`& .${tabsClasses.scrollButtons}`]: {
                            display: 'flex', // Always show the scroll buttons
                            '&.Mui-disabled': { opacity: 0.3 },
                            // You can add additional styles here to customize the buttons
                        },
                        '& .MuiTabs-scroller': {
                            flexGrow: 0, // Prevent full width scroller so items are centered
                        },
                        '& .MuiTabs-indicator': {
                            display: 'flex',
                            justifyContent: 'center',
                            backgroundColor: 'transparent', // Make the default indicator transparent
                            '&::after': {
                                content: '""',
                                width: '100%',
                                height: '4px', // Indicator height
                                backgroundColor: '#D61A0C', // Customize your indicator color
                                borderRadius: '2px', // Optional: rounded indicator
                            },
                        },
                    }}
                >
                    {NewstatusFilter.map((status, index) => (
                        <Tab
                            className="tolowercase"
                            key={index}
                            label={toNormalCase(status)}
                            sx={{
                                textTransform: 'none', // Keep normal text case
                                minWidth: 'auto', // Auto width to avoid stretching
                                textAlign: 'center',
                            }}
                        />
                    ))}

                </Tabs>
                    <Divider style={{ margin: '1rem 0', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', }} />
                </>}


                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', margin: '1rem 0' }}>
                    {(canExport || 1) ? (
                        <Export pdf excel print refresh data={{ columns, rows, param }} />
                    ) : <div></div>}

                    {(canCreate || 1) ? <Button type="primary" icon={<PlusOutlined />} onClick={handleClickCreateButton} loading={isLoading}>
                        Create
                    </Button> : <div></div>}
                </div></div>

            {
                isMobile ? (
                    <div className="mobile-table" style={{ marginTop: tabView ? '185px' : '125px' }}>
                        <DataCard rows={tabView ? filteredRows : rows} columns={columns} param={param} native={native} />
                    </div>

                ) : (
                    <div style={{ ...gridStyle, overflowX: 'auto', minHeight: tabView ? '65vh' : '75vh' }} className="ag-theme-quartz">
                        <AgGridReact
                            ref={gridRef}
                            rowData={tabView ? filteredRows : rows}
                            columnDefs={columns}
                            defaultColDef={defaultColDef}
                            onGridReady={onGridReady}
                            enableCellTextSelection={true}
                            ensureDomOrder={true}
                            pagination={true}
                            paginationPageSize={10}
                            paginationPageSizeSelector={paginationPageSizeSelector}
                        />
                    </div>
                )
            }
        </div >
    );
}

export default Table;