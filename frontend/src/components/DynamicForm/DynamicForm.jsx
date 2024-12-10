import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Checkbox, Card, Row, Col, Button, Spin, Typography, Steps, DatePicker, Divider, Popconfirm } from 'antd';
import { Grid } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import './DynamicForm.css'
import PermissionPicker from '../PermissionPicker/PermissionPicker';
import RolePicker from '../RolePicker/RolePicker';
import { SplitupTable } from '../SplitupTable/SplitupTable';
import { LeftOutlined, PrinterOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AuthContext } from '../../context/AuthContext';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import Stepper from '../Stepper/Stepper';
import MultiSelectPicker from '../MultiSelectPicker/MultiSelectPicker';
import { camelCaseToNormal } from '../../utils/StringTransformation';

const { Option } = Select;
const { Title } = Typography;
const { Step } = Steps;

const DynamicForm = ({ isUpdate, userProfile }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState(null)
  const navigate = useNavigate()
  const { table, id } = useParams()
  const [permissionsList, setPermissionsList] = useState([])
  const [roleList, setRoleList] = useState([])
  const [splitUpData, setSplitUpData] = useState(null)
  const [splitUpDataKey, setSplitUpDataKey] = useState(null)
  const [multipleSelectKey, setMultipleSelectKey] = useState(null)
  const [count, setCount] = useState(0)
  const [refOptions, setRefOptions] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { globalRoles, globalPermissions, token, defaultToken, formDisplayName } = useContext(AuthContext)
  const fullWidthFields = ['splituptable', 'permissionpicker']
  const [onLoad, setOnLoad] = useState(true)




  const [canCreate, setCanCreate] = useState(false)
  const [canRead, setCanRead] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [status, setStatus] = useState(null)
  const [formView, setFormView] = useState([])
  const [disabledEdit, setDisabledEdit] = useState(false)
  const [clientscript, setClientScript] = useState(null)

  const [disableAll, setDisableAll] = useState(userProfile || false)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [MultiSelectList, setMultiSelectList] = useState([])
  const [stepperData, setStepperData] = useState(null)

  const [dynamicCount, setDynamicCount] = useState(0)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const statusButtonMapping = {
    loading: 'Change Conveyor',
    awaitingLoading: 'Start Count',
  }

  useEffect(() => {

    const entity = table;

    const hasCreatePermission = globalPermissions.includes(`${entity}.create`) || 1;
    const hasReadPermission = globalPermissions.includes(`${entity}.read`) || 1;
    const hasUpdatePermission = globalPermissions.includes(`${entity}.update`) || 1;
    const hasDisabledEditPermission = globalPermissions.includes(`${entity}.disabledEdit`) || 1;

    setCanCreate(hasCreatePermission);
    setCanRead(hasReadPermission);
    setCanUpdate(hasUpdatePermission)
    setDisabledEdit(hasDisabledEditPermission)


    const fetchFormData = async () => {
      const apiUri = import.meta.env.VITE_API_URI; // Extract API URI
      try {
        const tokenToBeTaken = userProfile ? defaultToken : token
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/formdata/${table}/${id}`, {
          headers: {
            "Authorization": `Bearer ${tokenToBeTaken}`
          }
        });
        let formDataTemp = response.data.formData
        let formValueTemp = response.data.data
        setStepperData(response.data.data)
        let statusTemp = response.data?.data?.status || 'weighbridgeIn'
        // setFormData(response.data?.formData)
        // console.log(statusTemp);


        isUpdate && setFormValues(formValueTemp);
        // if (isUpdate) {
        setStatus(statusTemp)

        // console.log('start-->',formDataTemp);

        if (formDataTemp?.tableName == 'master') {
          formDataTemp = {
            ...formDataTemp,
            fields: formDataTemp.fields?.filter(field => field?.statusToVisible?.includes(statusTemp))
          }
        }
        // }

        // console.log('2nd-->',formDataTemp, statusTemp);
        // console.log(globalRoles, formDataTemp.fields.filter(field => field.formView && (globalRoles.some(element => field.rolesToVisible.includes(element)))));

        const fields = formDataTemp.fields.filter(field => field.formView
          // && (globalRoles.some(element => field.rolesToVisible.includes(element)))
        );

        setFormData({ ...formDataTemp, fields });
        // console.log('last-->',formDataTemp);

        formValueTemp?.roles && setRoleList(formValueTemp.roles)
        formValueTemp?.permissions && setPermissionsList(formValueTemp.permissions.split(','))

        if (response.data.formData && response.data.formData.clientScript) {
          try {
            setClientScript(response.data.formData.clientScript)
            // const script = new Function(response.data.formData.clientScript);
            // script()
          } catch (error) {
            console.error('Error executing client script:', error);
          }
        }

        const refPromises = fields
          .filter(field => field.type === 'reference' || field.type == 'multipleselectreference')
          .map(async (field) => {
            try {
              const res = await axios.get(`${apiUri}/api/data/${field.refTableName}`, {
                headers: {
                  "Authorization": `Bearer ${defaultToken}`
                }
              });
              return { [field.key]: res.data.data }; // Return the result in key-value format
            } catch (err) {
              console.error(`Error fetching reference data for ${field.refTableName}:`, err);
              return { [field.key]: [] }; // Return empty array if error
            }
          });

        // Wait for all reference data to be fetched
        const refResults = await Promise.all(refPromises);
        const newRefOptions = refResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setRefOptions(prevState => ({ ...prevState, ...newRefOptions })); // Batch state update
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();

    // const fetchFormValue = async () => {
    //   try {
    //     const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${table}/${id}`, {
    //       headers: {
    //         "Authorization": `Bearer ${token}`
    //       }
    //     });

    //     setFormValues(response.data.data);
    //     setFormData(response.data?.fields)
    //     setStatus(isUpdate ? response.data.data?.status : 'weighbridgeIn')

    //     response.data?.data?.roles && setRoleList(response.data.data.roles)
    //     response.data?.data?.permissions && setPermissionsList(response.data.data.permissions.split(','))
    //   } catch (error) {
    //     console.error('Error fetching form data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };


    // const getStatuses = async () => {
    //   try {
    //     const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/status`, {
    //       headers: {
    //         "Authorization": `Bearer ${defaultToken}`
    //       }
    //     });
    //     setStatuses(response.data.data);
    //   } catch (error) {
    //     console.error('Error fetching status data:', error);
    //   }
    // };


    // isUpdate && fetchFormValue();
    !isUpdate && (setStatus('weighbridgeIn'))
  }, [table, isUpdate]);


  useEffect(() => {

  }, [roleList])

  useState(() => {

  }), [status]

  const createRecord = (values) => {
    axios.post(`${import.meta.env.VITE_API_URI}/api/data/${table}`, values, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then(res => {
      toast.success(table == 'master' ? `Spot Created!` : `${res.data.message}`)
      navigate(-1)
    }).catch(rej => {
      console.error(rej);
      toast.error(rej.message)
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const updateRecord = (values) => {

    axios.put(`${import.meta.env.VITE_API_URI}/api/data/${table}/${id}`, values, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
    ).then(res => {
      toast.success(table == 'master' ? `Spot Updated!` : `${res.data.message}`)
      setTimeout(() => {
        navigate(-1)
      }, 3000)
    }).catch(rej => {
      toast.error(rej.message)
      console.error(rej);
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const printCurrentPage = () => {
    window.print();
  }

  useEffect(() => {
    // const totalPackageData = form.getFieldValue('targetPackage')

    if (status == 'awaitingLoadInputs') {
      form.setFieldsValue({ targetPackage: dynamicCount });
    }

  }, [dynamicCount])


  const handleSubmit = (values) => {
    setIsLoading(true)
    values = { ...values, permissions: permissionsList.join(','), roles: roleList, [splitUpDataKey]: splitUpData, [multipleSelectKey]: MultiSelectList }
    !isUpdate ? createRecord(values) : updateRecord(values)
  };

  const handleBackButtonClick = () => {
    navigate(-1)
  }

  // const sourceField = document.getElementById('total-target');
  // const targetField = document.getElementById('targetPackage');

  // useEffect(()=>{
  //   console.log(sourceField.value);

  // }, [sourceField, targetField])

  // useEffect(() => {
  //   // Get references to the DOM elements
  //   const sourceField = document.getElementById('total-target');
  //   const targetField = document.getElementById('targetPackage');
  //   console.log(sourceField, targetField);


  //   if (sourceField && targetField) {
  //     // Add event listener to handle value changes in sourceField
  //     sourceField.addEventListener('input', () => {
  //       targetField.value = sourceField.value;  // Set the target field value
  //     });
  //   }

  //   // Cleanup event listener when the component unmounts
  //   return () => {
  //     if (sourceField) {
  //       sourceField.removeEventListener('input', () => {
  //         targetField.value = sourceField.value;
  //       });
  //     }
  //   };
  // }, [formData, formValues]);


  if (clientscript) {
    const allInputs = document.getElementsByTagName('input');
    Array.from(allInputs).forEach((input) => {
      input.addEventListener('input', () => {
        try {
          // const clientScriptValue = `
          // const sourceField = document.getElementById('total-target')
          // const targetField = document.getElementById('targetPackage')
          // targetField.value = sourceField.value
          // console.log(targetField.value);
          // `
          const clientScriptValue = ``
          // Create a new function from the clientscript string
          const script = new Function(clientscript);
          script();
        } catch (error) {
          console.error('Error executing client script:', error);
        }
      });
    });
  }


  const renderField = (field) => {
    // Generate regex rule if provided
    const regexRule = field.regex ? [{ pattern: new RegExp(field.regex), message: `Invalid Value for ${field.label}` }] : [];
    let disabledRule = ((isUpdate && (formValues[field.key] && (field.disabledAfterFilled))))
    if (disabledEdit) {
      disabledRule = false
    }
    if (disableAll) {
      disabledRule = true
    }
    switch (field.type) {
      case 'number':
        return (
          <Form.Item
            initialValue={isUpdate ? (formValues[field.key]) : field.defaultValue}
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              ...regexRule, // Add regex validation
            ]}
          >
            <InputNumber
              placeholder={field.placeholder || field.label}
              id={field.key}
              style={{ width: '100%' }}
              disabled={field.disabled || disabledRule}
            />
          </Form.Item>
        );


      case 'textbox':

        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              ...regexRule, // Add regex validation
            ]}
            initialValue={isUpdate ? (formValues[field.key] || '') : field.defaultValue}
          >
            <Input placeholder={field.placeholder || field.label} disabled={field.disabled || disabledRule} id={field.key} onInput={(e) => {
              if (field.allowOnlyCaps) {
                e.target.value = e.target.value.toUpperCase()
              }
            }} />
          </Form.Item>
        );

      case 'password':

        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              ...regexRule, // Add regex validation
            ]}
            initialValue={isUpdate ? (formValues[field.key] || '') : field.defaultValue}
          >
            <Input.Password placeholder={field.placeholder || field.label} disabled={field.disabled || disabledRule} id={field.key} />
          </Form.Item>
        );

      case 'textarea':  // New case for textarea
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              ...regexRule, // Add regex validation
            ]}
            initialValue={isUpdate ? (formValues[field.key] || '') : field.defaultValue}
          >
            <Input.TextArea rows={8} placeholder={field.placeholder || field.label} disabled={field.disabled || disabledRule} id={field.key} />
          </Form.Item>
        );
      case 'autoincrement':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            initialValue={isUpdate && (formValues[field.key] || '')}
          >
            <Input disabled id={field.key} />
          </Form.Item>
        );
      case 'dropdown':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            initialValue={isUpdate ? (formValues[field.key] || '') : field.defaultValue}
          >
            <Select placeholder={field.placeholder || field.label} disabled={field.disabled || disabledRule} id={field.key}>
              {field.options.map((option, index) => (
                <Option key={index} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'date':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            initialValue={isUpdate && (formValues[field.key] ? dayjs(formValues[field.key]) : null)} // Use dayjs here
          >
            <DatePicker
              id={field.key}
              style={{ width: '100%' }}
              format={field.dateFormat || 'DD-MM-YYYY'} // You can specify a default format or use a format from the field object
              placeholder={field.placeholder || field.label}
              disabled={field.disabled || disabledRule}
            />
          </Form.Item>
        );
      case 'datetime':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            initialValue={isUpdate ? (formValues[field.key] ? dayjs(formValues[field.key]) : (field.defaultValue == 'now') && dayjs()) : (field.defaultValue == 'now') && dayjs()}          >
            <DatePicker
              style={{ width: '100%' }}
              showTime={{ format: 'HH:mm' }}  // Allows selecting time in hours and minutes
              format={field.dateFormat || 'YYYY-MM-DD HH:mm'} // Combine date and time format
              placeholder={field.placeholder || field.label}
              disabled={field.disabled || disabledRule}
              id={field.key}
            />
          </Form.Item>
        );
      case 'reference':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            initialValue={isUpdate ? (formValues[field.key] || '') : field.defaultValue}
          >
            <Select placeholder={field.placeholder || field.label}
              disabled={field.disabled || disabledRule}
              id={field.key}>

              {refOptions[field.key]?.filter(refOption => {
                if (Object.keys(refOption).includes('active')) {
                  return refOption.active === false
                }
                else {
                  return refOption
                }

              }).map((option, index) => (
                <Option key={index} value={option[field.refValueField]} >
                  {option[field.refLabelName]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      // case 'reference':
      //   console.log();

      //   return (
      //     <Form.Item
      //       label={field.label}
      //       name={field.key}
      //       rules={[
      //         { required: field.required, message: `${field.label} is required` },
      //       ]}
      //       initialValue={isUpdate ? (formValues[field.key] || '') : field.defaultValue}
      //     >
      //       <Select placeholder={field.placeholder || field.label}
      //         disabled={field.disabled || disabledRule}
      //         labelInValue
      //         id={field.key}>

      //         {refOptions[field.key]?.filter(refOption => {
      //           if (Object.keys(refOption).includes('active')) {
      //             return refOption.active === false
      //           }
      //           else {
      //             return refOption
      //           }

      //         }).map((option, index) => (
      //           <Option key={index} value={option[field.refValueField]} >
      //             {option[field.refLabelName]}
      //           </Option>
      //         ))}
      //       </Select>
      //     </Form.Item>
      //   );

      // case 'reference':
      //   console.log(refOptions);

      //   return (
      //     <Form.Item
      //       label={field.label}
      //       name={field.key}
      //       rules={[
      //         { required: field.required, message: `${field.label} is required` },
      //       ]}
      //       initialValue={isUpdate ? (formValues[field.key] ? {
      //         value: formValues[field.key],
      //         label: refOptions[field.key]?.find(opt => opt[field.refValueField] === formValues[field.key])?.[field.refLabelName]
      //       } : undefined) : field.defaultValue}
      //     >
      //       <Select
      //         placeholder={field.placeholder || field.label}
      //         disabled={field.disabled || disabledRule}
      //         id={field.key}
      //         // labelInValue
      //       >
      //         {refOptions[field.key]?.filter(refOption => {
      //           if (Object.keys(refOption).includes('active')) {
      //             return refOption.active == false;
      //           }
      //           return refOption;
      //         }).map((option, index) => (
      //           <Option key={index} value={option[field.refValueField]}>
      //             {option[field.refLabelName]}
      //           </Option>
      //         ))}
      //       </Select>
      //     </Form.Item>
      //   );

      case 'multipleselectreference':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            initialValue={isUpdate ? (formValues[field.key] || '') : field.defaultValue}
          >
            <MultiSelectPicker setMultipleSelectKey={setMultipleSelectKey} setMultiSelectList={setMultiSelectList} MultiSelectList={isUpdate ? formValues[field.key] : MultiSelectList} tableName={field.refTableName} labelName={field.refLabelName} valueName={field.refValueField} field={field} />
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            valuePropName="checked"
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            initialValue={isUpdate && (formValues[field.key] || '')}
          >
            <Checkbox disabled={field.disabled || disabledRule} id={field.key}>{field.placeholder}</Checkbox>
          </Form.Item>
        );
      case 'rolepicker':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
          >
            <RolePicker disabled={disableAll} setRoleList={setRoleList} roleList={roleList} id={field.key} />
          </Form.Item>
        );
      case 'singlerolepicker':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
          >
            <RolePicker disabled={disableAll} setRoleList={setRoleList} roleList={roleList} mode='single' id={field.key} />
          </Form.Item>
        );
      case 'permissionpicker':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
          >
            <PermissionPicker setPermissionsList={setPermissionsList} permissionsList={permissionsList} id={field.key} disabled={disabledRule} />
          </Form.Item>
        );
      case 'splituptable':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
          >
            <SplitupTable disabledRule={disabledRule} setSplitUpDataKey={setSplitUpDataKey} splitUpData={isUpdate ? formValues[field.key] : splitUpData} setSplitUpData={setSplitUpData} tableNameForDropdown={field?.tableNameForDropdown} field={field} setDynamicCount={setDynamicCount} />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (!formData) {
    return <div style={{ textAlign: 'center' }}>
      <Spin />
    </div>;
  }
  return (
    <div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div style={{
        position: 'fixed', top: 0, background: '#ffffff', zIndex: 999, width: "100%", left: 0
      }}>
        <div className='dynamic-form-fixed-m-left' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '70px', marginRight: '10px', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

            <Button
              type="link"
              className='dynamic-form-backbutton-typography'
              onClick={handleBackButtonClick}
              style={{
                position: 'absolute',
                left: '75px',
                fontSize: '18px',
                color: 'blue',
                padding: 0,
                fontWeight: '800'
              }}
            >
              <LeftOutlined />
              <Title level={2} style={{ margin: 0, fontSize: '18px' }}>{table == 'master' ? formDisplayName : camelCaseToNormal(table)}</Title>
            </Button>

          </div>
          <img src={import.meta.env.VITE_API_LOGO_URL} alt="client-logo" style={{ width: '70px' }} />
        </div>
        <Divider style={{ margin: '1rem 0', marginBottom: '0rem', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '100%', border: '1.5px solid #D61A0C' }} />
      </div>


      <Grid container spacing={1} style={{ padding: '10px', paddingLeft: '18px' }}>
        {/* Form Section: Ant Design Card in 8 Columns */}
        <Grid item xs={12} md={12}>
          {
            (formData?.fields?.length > 0) ? (
              <Card style={{ width: '100%', paddingTop: '30px', marginTop: '80px' }}>
                {/* Display the tableDisplayName as the heading */}
                <div > <Form form={form} layout="vertical" onFinish={handleSubmit} scrollToFirstError>
                  <Row gutter={[16, 16]} style={{ rowGap: '0px' }}>
                    {formData.fields
                      .sort((a, b) => a.order - b.order) // Sort by order to ensure the correct sequence
                      .map((field, index) => (

                        (!field.viewOnlyOnUpdate || isUpdate) ? (
                          <Col
                            xs={24} // Full width for PermissionPicker in mobile (24 columns)
                            sm={(field.fullWidthField || field.fullwidthField) ? 24 : 12} // Full width for PermissionPicker on desktop (24 columns)
                            key={index}
                          >
                            {isUpdate ? (formValues && renderField(field)) : renderField(field)}
                          </Col>
                        ) : (
                          <></>
                        )
                      ))}
                  </Row>
                  <Form.Item>
                    <Form.Item name="loadStatus" hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name="partialLoad" hidden>
                      <Input />
                    </Form.Item>
                    {
                      ((!userProfile) && ((canUpdate && isUpdate) || (canCreate && !isUpdate))) && (
                        <Popconfirm
                          title="Warning: Proceed with caution"
                          description="Are you sure you want to proceed? You may lose access to edit these fields once confirmed."
                          onConfirm={() => {
                            // Your form submission logic should go here
                            form.submit(); // Assuming you are using Ant Design's form instance
                          }}
                          placement="topRight"
                          // icon={
                          //   <QuestionCircleOutlined
                          //     style={{
                          //       color: 'red',
                          //     }}
                          //   />
                          // }
                          style={{ width: '20px' }}
                        >
                          <Button type="primary" style={{ marginTop: '6px', marginRight: '15px', }} loading={isLoading}>
                            {statusButtonMapping[status] ? statusButtonMapping[status] : 'Submit'}
                            {/* // {`${isUpdate ? 'Update' : 'Submit'}`} */}
                          </Button>
                        </Popconfirm>
                      )}

                    {(status === 'loading') && (
                      <>
                        <Popconfirm
                          title="Warning: Stop Camera Count"
                          description="Are you sure? This will finalize and stop the count for this vehicle. Ensure the count is correct before proceeding."
                          onConfirm={() => {
                            form.setFieldsValue({ loadStatus: true });
                            form.submit()
                          }}
                          placement="top"
                          style={{ width: '20px' }}
                        >
                          <Button type="primary" style={{ marginTop: '6px', marginRight: '15px' }}>
                            Complete Load
                          </Button>
                        </Popconfirm>

                        <Popconfirm
                          title="Warning: Marking Vehicle with Partial Load"
                          description="Are you sure? This will mark the vehicle as having a partial load. Ensure the load information is accurate before proceeding."
                          onConfirm={() => {
                            form.setFieldsValue({ partialLoad: true });
                            form.submit()
                          }}
                          placement="top"
                          style={{ width: '20px' }}
                        >
                          <Button type="primary" style={{ marginTop: '6px', marginRight: '15px' }}>
                            Partial Load
                          </Button>
                        </Popconfirm>
                      </>
                    )}



                    <Popconfirm
                      title="Warning: Proceed with caution"
                      description="Are you sure you want to go back? Any unsaved changes may be lost, and you may need to re-edit these fields once you confirm."
                      onConfirm={handleBackButtonClick}
                      placement="topRight"
                      style={{ width: '20px' }}
                    >
                      <Button type="primary" style={{ marginTop: '6px', marginRight: '15px', }}>
                        Back
                      </Button>
                    </Popconfirm>

                    {(isUpdate && globalPermissions.includes(`${table}.export`)) && <Button
                      type='primary'
                      icon={<PrinterOutlined />} // Black for print
                      onClick={() => printCurrentPage()}
                      style={{ marginTop: '6px', marginRight: '15px', padding: '10px' }}
                    />
                    }

                  </Form.Item>
                </Form>
                </div>
              </Card>
            ) : (<><NotFoundPage /></>)
          }
        </Grid>

        {/* Status Stepper Section: Ant Design Steps in 4 Columns */}
        {
          (table == 'master' && !globalRoles.includes('weighbridgeSupervisor')) && (
            <Grid item xs={12} md={4}>
              <Card className='stepper-card-dynamic-form' style={{ width: '100%', paddingTop: '30px', marginTop: '80px' }}>
                {status && (
                  <div style={{ overflowX: 'auto' }}>
                    <Stepper status={status} masterData={stepperData} />
                    {/* <Divider style={{ margin: '2rem 0' }} /> */}
                  </div>
                )}
              </Card>
            </Grid>
          )
        }
      </Grid>
    </div >
  );
};

export default DynamicForm;
