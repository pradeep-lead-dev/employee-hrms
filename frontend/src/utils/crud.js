import axios from 'axios';
import toast from 'react-hot-toast';


const crudOperations = {
  // Fetch form fields based on the table
  getFormFields: async (table, setFormData, setLoading) => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/formdata/${table}`, {
          headers: {
            'Query-Field': 'tableName',
          }
        });
        setFormData(response.data.data);
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };
    await fetchFormData();
  },

  // Fetch data by ID from a table
  getDataById: async (table, id, setFormValues, setRoleList, setPermissionsList, setLoading) => {
    const fetchFormValue = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${table}/${id}`);
        setFormValues(response.data.data);
        response.data?.data?.roles && setRoleList(response.data.data.roles);
        response.data?.data?.permissions && setPermissionsList(response.data.data.permissions.split(','));
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };
    await fetchFormValue();
  },

  // Create new record in a table
  createData: async (table, values, navigate) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URI}/api/data/${table}`, values);
      toast.success(response.data.message);
      // Uncomment to navigate back after success
      // setTimeout(() => navigate(-1), 3000);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  },

  // Update an existing record by ID
  updateData: async (table, id, values, navigate) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URI}/api/data/${table}/${id}`, values);
      toast.success(response.data.message);
      // Uncomment to navigate back after success
      // setTimeout(() => navigate(-1), 3000);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  },

  // Delete a record by ID
  deleteData: async (table, id, token) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URI}/api/data/${table}/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      toast.success(response.data.message);
      // Uncomment to navigate back after success
      // setTimeout(() => navigate(-1), 3000);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  },

  // Fetch form data for building forms, can handle both update and create form builders
  getFormBuilder: async (isUpdate, id, setFormData) => {
    try {
      const url = isUpdate ? `${import.meta.env.VITE_API_URI}/api/data/forms/${id}` : `${import.meta.env.VITE_API_URI}/api/data/forms`;
      const response = await axios.get(url);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  }
};

export default crudOperations;