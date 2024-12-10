import React, { useState, useEffect, useContext } from 'react';
import {
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  FormControl,
  Radio,
  RadioGroup,
  FormLabel,
  OutlinedInput,
  InputLabel,
  TextareaAutosize
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import './formbuilder.css'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
// import PermissionPicker from '../../components/PermissionPicker/PermissionPicker';
import RolePicker from '../../components/RolePicker/RolePicker';
import { AuthContext } from '../../context/AuthContext';
import MultiSelectPicker from '../../components/MultiSelectPicker/MultiSelectPicker';

const formTypes = [
  { label: 'Number', value: 'number' },
  { label: 'Text Box', value: 'textbox' },
  { label: 'Password', value: 'password' },
  { label: 'Radio', value: 'radio' },
  { label: 'File Upload', value: 'fileupload' },
  { label: 'Text area', value: 'textarea' },
  { label: 'Date', value: 'date' },
  { label: 'DateTime', value: 'datetime' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Multiple Select Dropdown', value: 'multipleselect' },
  { label: 'Role Picker', value: 'rolepicker' },
  { label: 'Single Role Picker', value: 'singlerolepicker' },
  { label: 'Permission Picker', value: 'permissionpicker' },
  { label: 'Splitup Table', value: 'splituptable' },
  { label: 'Reference', value: 'reference' },
  { label: 'Auto Increment', value: 'autoincrement' },
  { label: 'Multiple Select Reference', value: 'multipleselectreference' },
  { label: 'Integer Range Picker', value: 'integerrangepicker' },
  { label: 'Time Duration', value: 'timeduration' },
  { label: 'Time Picker', value: 'timepicker' },
];


const FormBuilder = ({ isUpdate }) => {
  const [formData, setFormData] = useState({
    tableName: '',
    tableDisplayName: '',
    clientScript: '',
    canCreate: true,
    fields: [],
  });

  const { id } = useParams()
  const [roleList, setRoleList] = useState([])
  const [MultiSelectList, setMultiSelectList] = useState([])
  const navigate = useNavigate()
  const { globalPermissions, token } = useContext(AuthContext)

  const [canCreate, setCanCreate] = useState(false)
  const [canRead, setCanRead] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)

  // console.log('Rolelist : ',roleList);  

  const [currentField, setCurrentField] = useState({
    type: '',
    label: '',
    key: '',
    defaultValue: '',
    options: [],
    placeholder: '',
    disabled: false,
    required: false,
    tableView: true,
    formView: false,
    tablePinnedLeft: false,
    tablePinnedRight: false,
    visibility: true,
    allowOnlyCaps: false,
    rolesToVisible: roleList,
    statusToVisible: MultiSelectList,
    disabledAfterFilled: false,
    fullWidthField: false,
    viewOnlyOnUpdate: false,
    prefixForAutoIncrement: '',
    refTableName: '',
    refLabelName: '',
    refValueField: '',
    order: 0,
    regex: '',
  });

  useEffect(() => {
    setCurrentField((prevField) => ({
      ...prevField,
      rolesToVisible: roleList,
    }));
  }, [roleList]);

  useEffect(() => {
    setCurrentField((prevField) => ({
      ...prevField,
      statusToVisible: MultiSelectList,
    }));
  }, [MultiSelectList]);

  const [availableRoles, setAvailableRoles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {

    setAvailableRoles(['tables1', 'tables2'])

    const fetchFormData = async () => {
      try {
        const response = isUpdate ? await axios.get(`${import.meta.env.VITE_API_URI}/api/data/forms/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }) : await axios.get(`${import.meta.env.VITE_API_URI}/api/data/forms`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        setFormData(response.data.data);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    const entity = 'forms';

    const hasCreatePermission = globalPermissions.includes(`${entity}.create`) || 1;
    const hasReadPermission = globalPermissions.includes(`${entity}.read`)|| 1;
    const hasUpdatePermission = globalPermissions.includes(`${entity}.update`)|| 1;

    setCanCreate(hasCreatePermission);
    setCanRead(hasReadPermission);
    setCanUpdate(hasUpdatePermission)
    isUpdate && fetchFormData();
  }, [isUpdate]);

  const handleFieldChange = (e) => {
    const { name, value, checked, type } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setCurrentField({
      ...currentField,
      [name]: fieldValue,
    });
  };

  const handleCanCreateChange = (e) => {
    const { name, value, checked, type } = e.target;
    const fieldValue = checked

    setFormData({
      ...formData,
      [name]: fieldValue,
    });
  };

  const handleFormDataChange = (e) => {
    let { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const addFieldToForm = () => {
    const updatedFields = formData.fields ? [...formData.fields] : []

    const nextOrder = updatedFields.length > 0
      ? Math.max(...updatedFields.map((f) => f.order)) + 1
      : 0;


    const fieldToAdd = {
      ...currentField,
      rolesToVisible: roleList,
      statusToVisible: MultiSelectList,
      order: editMode ? currentField.order : nextOrder,
    };

    if (editMode) {
      updatedFields[editIndex] = fieldToAdd;
      setEditMode(false);
      setEditIndex(null);
    } else {
      updatedFields.push(fieldToAdd);
    }

    setFormData({
      ...formData,
      fields: updatedFields,
    });

    resetCurrentField();
  };

  const resetCurrentField = () => {
    setRoleList([])
    setMultiSelectList([])
    setCurrentField({
      type: '',
      label: '',
      key: '',
      defaultValue: '',
      options: [],
      placeholder: '',
      disabled: false,
      required: false,
      tableView: true,
      formView: false,
      tablePinnedLeft: false,
      tablePinnedRight: false,
      visibility: true,
      fullWidthField: false,
      viewOnlyOnUpdate: false,
      disabledAfterFilled: false,
      allowOnlyCaps: false,
      prefixForAutoIncrement: '',
      rolesToVisible: [],
      statusToVisible: [],
      refTableName: '',
      refLabelName: '',
      refValueField: '',
      order: 0,
      regex: '',
    });
  };

  const handleOptionsChange = (e, index) => {
    const { name, value } = e.target;
    const updatedOptions = [...currentField.options];
    updatedOptions[index] = { ...updatedOptions[index], [name]: value };
    setCurrentField({ ...currentField, options: updatedOptions });
  };

  const addOption = () => {
    setCurrentField({
      ...currentField,
      options: [...currentField.options, { label: '', value: '' }],
    });
  };

  const handleEditField = (index) => {
    setCurrentField(formData.fields[index]);
    setEditMode(true);
    setEditIndex(index);

    setRoleList(formData.fields[index].rolesToVisible || [])
    setMultiSelectList(formData.fields[index].statusToVisible || [])
  };

  const handleDeleteField = (index) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: updatedFields });
  };

  const handleCreateTable = () => {
    axios.post(`${import.meta.env.VITE_API_URI}/api/data/forms`, formData, {
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
  };

  const handleUpdateTable = () => {

    axios.put(`${import.meta.env.VITE_API_URI}/api/data/forms/${id}`, formData, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then(res => {
      toast.success(res.data.message)
      setTimeout(() => {
        navigate(-1)
      }, 3000)
    }).catch(rej => {
      console.error(rej)
      toast.error(rej.message)
    })
  };

  const handleClick = () => {
    !isUpdate ? handleCreateTable() : handleUpdateTable()
  }

  return (
    <Grid container spacing={2} id="formbuilder">
      {/* Form Builder */}
      <Grid item xs={12} md={7}>
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>Form Builder</Typography>

          <FormControl fullWidth margin="normal">
            <FormLabel>Table Name</FormLabel>
            <OutlinedInput
              name="tableName"
              value={formData.tableName}
              onChange={handleFormDataChange}
              placeholder="Enter table name"
              fullWidth
              disabled={isUpdate}
              required
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <FormLabel>Table Display Name</FormLabel>
            <OutlinedInput
              name="tableDisplayName"
              value={formData.tableDisplayName}
              onChange={handleFormDataChange}
              placeholder="Enter table display name"
              fullWidth
              required
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <FormLabel>Client Script</FormLabel>
            <TextareaAutosize
              name="clientScript"
              minRows={10}
              value={formData.clientScript}
              onChange={handleFormDataChange}
              placeholder="Enter Client Script"
              fullWidth
              required
            />
          </FormControl>


          <FormControlLabel
            control={
              <Checkbox
                name="canCreate"
                checked={formData.canCreate}
                onChange={handleCanCreateChange}
              />
            }
            label="Can create new record directly?"
          />

          <FormControl fullWidth margin="normal">
            <FormLabel>Type</FormLabel>
            <TextField
              select
              name="type"
              value={currentField.type}
              onChange={handleFieldChange}
              variant="outlined"
              fullWidth
              required
            >
              {formTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>

          {currentField.type && (
            <>
              <FormControl fullWidth margin="normal">
                <FormLabel>Label</FormLabel>
                <OutlinedInput
                  name="label"
                  value={currentField.label}
                  onChange={handleFieldChange}
                  placeholder="Enter field label"
                  fullWidth
                  required
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <FormLabel>Key</FormLabel>
                <OutlinedInput
                  name="key"
                  value={currentField.key}
                  onChange={handleFieldChange}
                  placeholder="Enter field key"
                  fullWidth
                  required
                // disabled={isUpdate}
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <FormLabel>Default Value</FormLabel>
                <OutlinedInput
                  name="defaultValue"
                  value={currentField.defaultValue}
                  onChange={handleFieldChange}
                  placeholder="Enter default value"
                  type={currentField.type}
                  fullWidth
                  required
                />
              </FormControl>

              {currentField.type === 'splituptable' && (
                <FormControl fullWidth margin="normal">
                  <FormLabel>Tablename for Dropdown</FormLabel>
                  <OutlinedInput
                    name="tableNameForDropdown"
                    value={currentField.tableNameForDropdown}
                    onChange={handleFieldChange}
                    placeholder="Enter Tablename for Dropdown"
                    fullWidth
                  />
                </FormControl>
              )}

              {currentField.type === 'autoincrement' && (
                <FormControl fullWidth margin="normal">
                  <FormLabel>Prefix for Auto Incremental Field</FormLabel>
                  <OutlinedInput
                    name="prefixForAutoIncrement"
                    value={currentField.prefixForAutoIncrement}
                    onChange={handleFieldChange}
                    // placeholder="Enter Tablename for Dropdown"
                    fullWidth
                  />
                </FormControl>
              )}

              {(currentField.type === 'reference' || currentField.type === 'multipleselectreference') && (
                <>
                  <FormControl fullWidth margin="normal">
                    <FormLabel>Reference Tablename</FormLabel>
                    <OutlinedInput
                      name="refTableName"
                      value={currentField.refTableName}
                      onChange={handleFieldChange}
                      placeholder="Enter Tablename"
                      fullWidth
                    />
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <FormLabel>Reference Label</FormLabel>
                    <OutlinedInput
                      name="refLabelName"
                      value={currentField.refLabelName}
                      onChange={handleFieldChange}
                      placeholder="Enter Label name for Reference"
                      fullWidth
                    />
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <FormLabel>Reference Value</FormLabel>
                    <OutlinedInput
                      name="refValueField"
                      value={currentField.refValueField}
                      onChange={handleFieldChange}
                      placeholder="Enter value field for Reference"
                      fullWidth
                    />
                  </FormControl>
                </>
              )}

              {currentField.type === 'dropdown' || currentField.type === 'radio' ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>Options</Typography>
                  {currentField.options.map((option, index) => (
                    <Box key={index} display="flex" gap={2} mb={1}>
                      <TextField
                        label="Label"
                        name="label"
                        value={option.label}
                        onChange={(e) => handleOptionsChange(e, index)}
                        variant="outlined"
                        size="small"
                        sx={{ flex: 1 }}
                        required
                      />
                      <TextField
                        label="Value"
                        name="value"
                        value={option.value}
                        onChange={(e) => handleOptionsChange(e, index)}
                        variant="outlined"
                        size="small"
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={addOption}
                    sx={{ mt: 1 }}
                  >
                    Add Option
                  </Button>
                </>
              ) : null}

              <FormControl fullWidth margin="normal">
                <FormLabel>Placeholder</FormLabel>
                <OutlinedInput
                  name="placeholder"
                  value={currentField.placeholder}
                  onChange={handleFieldChange}
                  placeholder="Enter placeholder text"
                  fullWidth
                />
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    name="disabled"
                    checked={currentField.disabled}
                    onChange={handleFieldChange}
                  />
                }
                label="Disabled"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="fullWidthField"
                    checked={currentField.fullWidthField}
                    onChange={handleFieldChange}
                  />
                }
                label="Full width field"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="viewOnlyOnUpdate"
                    checked={currentField.viewOnlyOnUpdate}
                    onChange={handleFieldChange}
                  />
                }
                label="View Only On Update Mode"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="required"
                    checked={currentField.required}
                    onChange={handleFieldChange}
                  />
                }
                label="Required"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="tableView"
                    checked={currentField.tableView}
                    onChange={handleFieldChange}
                  />
                }
                label="Table View"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="formView"
                    checked={currentField.formView}
                    onChange={handleFieldChange}
                  />
                }
                label="Form View"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="tablePinnedLeft"
                    checked={currentField.tablePinnedLeft}
                    onChange={handleFieldChange}
                  />
                }
                label="Table Pinned Left"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="tablePinnedRight"
                    checked={currentField.tablePinnedRight}
                    onChange={handleFieldChange}
                  />
                }
                label="Table Pinned Right"
              />



              <FormControlLabel
                control={
                  <Checkbox
                    name="visibility"
                    checked={currentField.visibility}
                    onChange={handleFieldChange}
                  />
                }
                label="Visibility"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="disabledAfterFilled"
                    checked={currentField.disabledAfterFilled}
                    onChange={handleFieldChange}
                  />
                }
                label="Disabled After Filled"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="allowOnlyCaps"
                    checked={currentField.allowOnlyCaps}
                    onChange={handleFieldChange}
                  />
                }
                label="Allow only Caps"
              />

              <FormControl fullWidth margin="normal">
                <FormLabel>Order</FormLabel>
                <OutlinedInput
                  name="order"
                  type="number"
                  value={currentField.order}
                  onChange={handleFieldChange}
                  placeholder="Enter field order"
                  fullWidth
                />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <FormLabel>Roles To Visible</FormLabel>
                <RolePicker setRoleList={setRoleList} roleList={roleList} />
              </FormControl>

              <FormControl fullWidth margin="normal">
                <FormLabel>Status To Visible</FormLabel>
                <MultiSelectPicker setMultiSelectList={setMultiSelectList} MultiSelectList={MultiSelectList} tableName='status' labelName={'statusDisplayName'} valueName={'statusName'} />
              </FormControl>


              <FormControl fullWidth margin="normal">
                <FormLabel>Regex</FormLabel>
                <OutlinedInput
                  name="regex"
                  value={currentField.regex}
                  onChange={handleFieldChange}
                  placeholder="Enter regex pattern"
                  fullWidth
                />
              </FormControl>



              <Button
                variant="contained"
                fullWidth
                onClick={addFieldToForm}
                sx={{ mt: 2 }}
              >
                {editMode ? 'Update Field' : 'Add Field'}
              </Button>
            </>
          )}
        </Paper>
      </Grid>

      {/* Preview */}
      <Grid item xs={12} md={5}>
        <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Form Preview</Typography>
          {formData.fields
            ?.sort((a, b) => a.order - b.order)
            ?.map((field, index) => (
              <Box
                key={index}
                display="flex"
                flexDirection="column"
                gap={2}
                mb={2}
                p={2}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  boxShadow: 2,
                }}
                onClick={() => handleEditField(index)} // Click to edit field
              >
                {/* Display field based on its type */}
                {field.type === 'textbox' && (
                  <>
                    <FormLabel>{field.label}</FormLabel>
                    <TextField
                      variant="outlined"
                      placeholder={field.placeholder}
                      defaultValue={field.defaultValue}
                      disabled={field.disabled}
                      fullWidth
                    />
                  </>
                )}

                {field.type === 'number' && (
                  <>
                    <FormLabel>{field.label}</FormLabel>
                    <TextField
                      type="number"
                      variant="outlined"
                      placeholder={field.placeholder}
                      defaultValue={field.defaultValue}
                      disabled={field.disabled}
                      fullWidth
                    />
                  </>
                )}

                {field.type === 'checkbox' && (
                  <>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControlLabel
                      control={<Checkbox disabled={field.disabled} />}
                      label={field.label}
                    />
                  </>
                )}

                {field.type === 'dropdown' && (
                  <>
                    <FormLabel>{field.label}</FormLabel>
                    <TextField
                      select
                      variant="outlined"
                      defaultValue={field.defaultValue}
                      disabled={field.disabled}
                      fullWidth
                    >
                      {field.options.map((option, optIndex) => (
                        <MenuItem key={optIndex} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                )}

                {field.type === 'radio' && (
                  <>
                    <FormLabel>{field.label}</FormLabel>
                    <RadioGroup
                      row
                      defaultValue={field.defaultValue}
                      disabled={field.disabled}
                    >
                      {field.options.map((option, optIndex) => (
                        <FormControlLabel
                          key={optIndex}
                          value={option.value}
                          control={<Radio disabled={field.disabled} />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  </>
                )}

                {field.type && (
                  <>
                    <FormLabel>{field.label}</FormLabel>
                    {/* <PermissionPicker /> */}
                  </>
                )}

                {/* Icons for editing and deleting */}
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <IconButton onClick={() => handleEditField(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteField(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
        </Paper>
      </Grid>

      {/* Create Table Button */}
      <Grid item xs={12}>
        {((canUpdate && isUpdate) || (canCreate && !isUpdate)) && (<Button
          variant="contained"
          fullWidth
          sx={{ mt: 2, mb: 2 }}
          onClick={handleClick}
          type='button'
        >
          {`${isUpdate ? 'Update' : 'Create'}`} Table
        </Button>)
        }
      </Grid>
    </Grid>
  );
};

export default FormBuilder;
