import React, { useState, useEffect, useContext } from "react";
import { Input, Select, Button, Row, Col, Card, Divider, Steps, Switch } from "antd";
import { PlusOutlined, PlayCircleOutlined, FilterOutlined, CheckCircleOutlined, FileTextOutlined, AppstoreAddOutlined, NodeExpandOutlined, AimOutlined } from "@ant-design/icons";
import { Grid } from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const { Option } = Select;
const { Step } = Steps;

const AutomationBuilder = ({ isUpdate }) => {
    const [automationData, setAutomationData] = useState(null)
    const [automationName, setAutomationName] = useState("");
    const [active, setActive] = useState(false);
    const [triggerType, setTriggerType] = useState("");
    const [tableName, setTableName] = useState("");
    const [conditions, setConditions] = useState([{ field: "", to: "", operation: "and" }]);
    const [actions, setActions] = useState([
        {
            actionName: "",
            tableName: "",
            fields: [{ fieldName: "", fieldValue: "" }],
            url: "",
            method: "",
            headers: "",
            body: ""
        }
    ]);
    const { id } = useParams()
    const navigate = useNavigate()

    const { globalPermissions, token } = useContext(AuthContext)

    const [canCreate, setCanCreate] = useState(false)
    const [canRead, setCanRead] = useState(false)
    const [canUpdate, setCanUpdate] = useState(false)

    useEffect(() => {
        const entity = 'workflow';

        const hasCreatePermission = globalPermissions.includes(`${entity}.create`);
        const hasReadPermission = globalPermissions.includes(`${entity}.read`);
        const hasUpdatePermission = globalPermissions.includes(`${entity}.update`);

        setCanCreate(hasCreatePermission);
        setCanRead(hasReadPermission);
        setCanUpdate(hasUpdatePermission)
        const fetchFormValue = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/workflow/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                setAutomationData(response.data.data);
            } catch (error) {
                console.error('Error fetching form data:', error);
            }
        };

        isUpdate && fetchFormValue();
    }, [isUpdate])

    useEffect(() => {
        if (isUpdate && automationData) {
            setAutomationName(automationData?.automationName);
            setActive(automationData?.active);
            setTriggerType(automationData?.trigger?.type);
            setTableName(automationData?.trigger?.tableName);
            setConditions([
                ...automationData?.trigger?.condition?.and,
                ...automationData?.trigger?.condition?.or
            ]);
            setActions(automationData.actions);
        }
    }, [automationData])
    

    // Add condition
    const addCondition = () => {
        setConditions([...conditions, { field: "", to: "", operation: "and" }]);
    };

    // Add action
    const addAction = () => {
        setActions([...actions, { actionName: "", tableName: "", fields: [{ fieldName: "", fieldValue: "" }] }]);
    };

    // Add field to action
    const addFieldToAction = (index) => {
        const newActions = [...actions];
        newActions[index].fields.push({ fieldName: "", fieldValue: "" });
        setActions(newActions);
    };

    // Update AND/OR condition operation
    const updateConditionOperation = (index, value) => {
        const newConditions = [...conditions];
        newConditions[index].operation = value;
        setConditions(newConditions);
    };

    // Build JSON for automation
    const buildJson = () => {
        return {
            automationName,
            active,
            trigger: {
                type: triggerType,
                tableName,
                condition: {
                    and: conditions.filter(cond => cond.operation === "and"),
                    or: conditions.filter(cond => cond.operation === "or"),
                }
            },
            actions: actions.map(action => ({
                actionName: action.actionName,
                tableName: action.tableName,
                fields: action.fields,
                url: action.url,
                method: action.method,
                headers: action.headers,
                body: action.body
            }))
        }
    };

    const submitRecord = () => {
        buildJson()
        if (!isUpdate) {
            axios.post(`${import.meta.env.VITE_API_URI}/api/data/workflow`, buildJson(), {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }).then(res => {
                toast.success(res.data.message)
                setTimeout(() => {
                    navigate(-1)
                }, 3000)
            }).catch(rej => {
                console.log(rej);
                toast.error(rej.message)
            })
        }
        else {
            axios.put(`${import.meta.env.VITE_API_URI}/api/data/workflow/${id}`, buildJson(), {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }).then(res => {
                toast.success(res.data.message)
                setTimeout(() => {
                    navigate(-1)
                }, 3000)
            }).catch(rej => {
                toast.error(rej.message)
            })
        }
    }



    return (
        <Grid container spacing={2}>
            {/* Form Builder */}
            <Grid item xs={12} md={6}>
                {/* Left Side: Automation Form */}

                <h1>Automation Builder</h1>
                {/* Automation Name */}
                <Card bordered style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: 8 }}>
                        <h3>Status </h3><Switch value={active} onChange={() => setActive(!active)} />
                    </div>
                    <Input
                        placeholder="Automation Name"
                        value={automationName}
                        required
                        onChange={(e) => setAutomationName(e.target.value)}
                    />
                </Card>

                {/* Trigger Section */}
                <Card bordered style={{ marginBottom: 8 }}>
                    <h3><PlayCircleOutlined /> Trigger</h3>

                    <Select
                        placeholder="Select Trigger"
                        value={triggerType}
                        required
                        onChange={(value) => setTriggerType(value)}
                        style={{ width: "100%", marginBottom: 8 }}
                    >
                        <Option value="fieldvaluechanges">Field Value Changes</Option>
                        <Option value="scheduledjob">Scheduled Job</Option>
                    </Select>

                    {triggerType === "fieldvaluechanges" && (
                        <Input
                            placeholder="Table Name"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            style={{ marginBottom: 8 }}
                        />
                    )}

                    {/* Conditions Section */}
                    <Divider>Conditions (AND/OR)</Divider>

                    {conditions.map((condition, index) => (
                        <Row gutter={16} key={index} style={{ marginBottom: 8 }}>
                            <Col span={8}>
                                <Card bordered style={{ padding: 8, backgroundColor: "#E8F5E9" }}>
                                    <AimOutlined style={{ color: "#4CAF50", marginRight: 8 }} />
                                    <Input
                                        placeholder="Field"
                                        value={condition.field}
                                        onChange={(e) => {
                                            const newConditions = [...conditions];
                                            newConditions[index].field = e.target.value;
                                            setConditions(newConditions);
                                        }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card bordered style={{ padding: 8, backgroundColor: "#E8F5E9" }}>
                                    <NodeExpandOutlined style={{ color: "#4CAF50", marginRight: 8 }} />
                                    <Input
                                        placeholder="To"
                                        value={condition.to}
                                        onChange={(e) => {
                                            const newConditions = [...conditions];
                                            newConditions[index].to = e.target.value;
                                            setConditions(newConditions);
                                        }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Select
                                    value={condition.operation}
                                    onChange={(value) => updateConditionOperation(index, value)}
                                    style={{ width: "100%" }}
                                >
                                    <Option value="and">AND</Option>
                                    <Option value="or">OR</Option>
                                </Select>
                            </Col>
                        </Row>
                    ))}

                    <Button type="dashed" onClick={addCondition} style={{ backgroundColor: "#4CAF50", color: "white" }}>
                        <PlusOutlined /> Add Condition
                    </Button>
                </Card>

                {/* Actions Section */}
                <Card bordered style={{ marginBottom: 8 }}>
                    <h3><AppstoreAddOutlined /> Actions</h3>

                    {actions.map((action, actionIndex) => (
                        <div key={actionIndex} style={{ marginBottom: 8 }}>
                            <Select
                                placeholder="Select Action"
                                value={action.actionName}
                                onChange={(value) => {
                                    const newActions = [...actions];
                                    newActions[actionIndex].actionName = value;
                                    setActions(newActions);
                                }}
                                style={{ width: "100%", marginBottom: 8 }}
                            >
                                <Option value="updaterecord">Update Record</Option>
                                <Option value="createrecord">Create Record</Option>
                                <Option value="startcamera">Start Camera</Option>
                                <Option value="stopcamera">Stop Camera</Option>
                                <Option value="webhook">Web Hook</Option>
                            </Select>

                            {action.actionName === "webhook" && (
                                <div>
                                    <Input
                                        placeholder="EndPoint URL"
                                        value={action.url}
                                        onChange={(e) => {
                                            const newActions = [...actions];
                                            newActions[actionIndex].url = e.target.value;
                                            setActions(newActions);
                                        }}
                                        style={{ marginBottom: 8 }}
                                    />

                                    <Select
                                        placeholder="Method"
                                        value={action.method}
                                        onChange={(value) => {
                                            const newActions = [...actions];
                                            newActions[actionIndex].method = value;
                                            setActions(newActions);
                                        }}
                                        style={{ width: "100%", marginBottom: 8 }}
                                    >
                                        <Option value="get">GET</Option>
                                        <Option value="post">POST</Option>
                                        <Option value="put">PUT</Option>
                                        <Option value="delete">DELETE</Option>
                                    </Select>

                                    <Input.TextArea
                                        placeholder="Header (JSON format)"
                                        value={action.headers}
                                        onChange={(e) => {
                                            const newActions = [...actions];
                                            newActions[actionIndex].headers = e.target.value;
                                            setActions(newActions);
                                        }}
                                        style={{ marginBottom: 8 }}
                                    />

                                    <Input.TextArea
                                        placeholder="Body (JSON format)"
                                        value={action.body}
                                        onChange={(e) => {
                                            const newActions = [...actions];
                                            newActions[actionIndex].body = e.target.value;
                                            setActions(newActions);
                                        }}
                                        style={{ marginBottom: 8 }}
                                    />
                                </div>
                            )}

                            <Input
                                placeholder="Table Name"
                                value={action.tableName}
                                onChange={(e) => {
                                    const newActions = [...actions];
                                    newActions[actionIndex].tableName = e.target.value;
                                    setActions(newActions);
                                }}
                                style={{ marginBottom: 16 }}
                            />
                            <Input
                                placeholder="Field from Current Record"
                                value={action.fieldName}
                                onChange={(e) => {
                                    const newActions = [...actions];
                                    newActions[actionIndex].fieldName = e.target.value;
                                    setActions(newActions);
                                }}
                                style={{ marginBottom: 16 }}
                            />

                            {/* Fields for the action */}
                            {action?.fields?.map((field, fieldIndex) => (
                                <Row gutter={16} key={fieldIndex} style={{ marginBottom: 8 }}>
                                    <Col span={12}>
                                        <Card bordered style={{ padding: 16, backgroundColor: "#E8F5E9" }}>
                                            <AimOutlined style={{ color: "#4CAF50", marginRight: 8 }} />
                                            <Input
                                                placeholder="Field Name"
                                                value={field.fieldName}
                                                onChange={(e) => {
                                                    const newActions = [...actions];
                                                    newActions[actionIndex].fields[fieldIndex].fieldName = e.target.value;
                                                    setActions(newActions);
                                                }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card bordered style={{ padding: 16, backgroundColor: "#E8F5E9" }}>
                                            <FilterOutlined style={{ color: "#4CAF50", marginRight: 8 }} />
                                            <Input
                                                placeholder="Field Value"
                                                value={field.fieldValue}
                                                onChange={(e) => {
                                                    const newActions = [...actions];
                                                    newActions[actionIndex].fields[fieldIndex].fieldValue = e.target.value;
                                                    setActions(newActions);
                                                }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            ))}

                            <Button type="dashed" onClick={() => addFieldToAction(actionIndex)} style={{ backgroundColor: "#4CAF50", color: "white", marginBottom: 16 }}>
                                <PlusOutlined /> Add Field
                            </Button>
                        </div>
                    ))}

                    <Button type="dashed" onClick={addAction} style={{ backgroundColor: "#4CAF50", color: "white" }}>
                        <PlusOutlined /> Add Action
                    </Button>
                </Card>

                {((canUpdate && isUpdate) || (canCreate && !isUpdate)) && (
                    <Button
                        type="primary"
                        style={{ backgroundColor: "#4CAF50", borderColor: "#4CAF50", color: "white", width: "100%" }}
                        onClick={submitRecord}
                    >
                        {isUpdate ? "Update Automation" : "Build Automation"}
                    </Button>
                )}

            </Grid>

            {/* Right Side: Diagrammatic Representation */}
            <Grid item xs={12} md={6}>
                <h2>Automation Preview</h2>

                {/* Steps to represent Trigger, Conditions, and Actions */}
                <Steps direction="vertical" current={actions.length + 1} style={{ marginBottom: 32 }}>
                    <Step
                        title={<span style={{ color: "#009688" }}><PlayCircleOutlined /> Trigger</span>}
                        description={(
                            <Card bordered style={{ padding: 16, backgroundColor: "#E0F7FA" }}>
                                <p><AimOutlined style={{ color: "#009688", marginRight: 8 }} />Type: {triggerType || "Select a trigger"}</p>
                                {triggerType === "fieldvaluechanges" && <p><FileTextOutlined style={{ color: "#009688", marginRight: 8 }} />Table: {tableName || "Specify table name"}</p>}
                            </Card>
                        )}
                    />

                    <Step
                        title={<span style={{ color: "#FF5722" }}><FilterOutlined /> Conditions</span>}
                        description={(
                            <Card bordered style={{ padding: 16, backgroundColor: "#FFF3E0" }}>
                                {conditions.map((condition, index) => (
                                    <p key={index}>
                                        <AimOutlined style={{ color: "#FF5722", marginRight: 8 }} />
                                        Field: {condition.field || "?"},
                                        <NodeExpandOutlined style={{ color: "#FF5722", marginRight: 8 }} />
                                        To: {condition.to || "?"},
                                        Operation: {condition.operation.toUpperCase()}
                                    </p>
                                ))}
                            </Card>
                        )}
                    />

                    {actions.map((action, index) => (
                        <Step
                            key={index}
                            title={<span style={{ color: "#4CAF50" }}><CheckCircleOutlined /> Action: {action.actionName || "?"}</span>}
                            description={(
                                <Card bordered style={{ padding: 16, backgroundColor: "#E8F5E9" }}>
                                    <p><AimOutlined style={{ color: "#4CAF50", marginRight: 8 }} />Table: {action.tableName || "?"}</p>
                                    {action.fields.map((field, fieldIndex) => (
                                        <p key={fieldIndex}>
                                            <AimOutlined style={{ color: "#4CAF50", marginRight: 8 }} />
                                            Field: {field.fieldName || "?"},
                                            <NodeExpandOutlined style={{ color: "#4CAF50", marginRight: 8 }} />
                                            Value: {field.fieldValue || "?"}
                                        </p>
                                    ))}
                                </Card>
                            )}
                        />
                    ))}
                </Steps>
            </Grid>
        </Grid>
    );
};

export default AutomationBuilder;