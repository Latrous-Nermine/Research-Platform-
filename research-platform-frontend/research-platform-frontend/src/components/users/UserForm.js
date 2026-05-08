import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Form as BootstrapForm, Alert } from 'react-bootstrap';

const UserForm = ({ user, onSubmit, onCancel, isAdmin = false }) => {
  const initialValues = user || {
    username: '',
    email: '',
    password: '',
    role: 'USER',
    image: null // Add image field for file upload
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: user ? Yup.string() : Yup.string().required('Password is required'),
    role: Yup.string().required('Role is required'),
    image: Yup.mixed() // Validation for file upload
  });

  const handleSubmit = (values, { setSubmitting }) => {
    const formData = new FormData();
    
    // Append all form values to formData
    Object.keys(values).forEach(key => {
      if (key === 'image' && values[key]) {
        formData.append(key, values[key]);
      } else if (values[key] !== null && values[key] !== undefined) {
        formData.append(key, values[key]);
      }
    });

    onSubmit(formData, setSubmitting);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form encType="multipart/form-data">
          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>Username</BootstrapForm.Label>
            <Field 
              name="username" 
              as={BootstrapForm.Control} 
              type="text" 
              placeholder="Enter username" 
            />
            <ErrorMessage name="username" component="div" className="text-danger" />
          </BootstrapForm.Group>

          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>Email</BootstrapForm.Label>
            <Field 
              name="email" 
              as={BootstrapForm.Control} 
              type="email" 
              placeholder="Enter email" 
            />
            <ErrorMessage name="email" component="div" className="text-danger" />
          </BootstrapForm.Group>

          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>Password</BootstrapForm.Label>
            <Field 
              name="password" 
              as={BootstrapForm.Control} 
              type="password" 
              placeholder="Password" 
            />
            <ErrorMessage name="password" component="div" className="text-danger" />
          </BootstrapForm.Group>

          {isAdmin && (
            <BootstrapForm.Group className="mb-3">
              <BootstrapForm.Label>Role</BootstrapForm.Label>
              <Field 
                name="role" 
                as={BootstrapForm.Select}
              >
                <option value="USER">User</option>
                <option value="RESEARCHER">Researcher</option>
                <option value="MODERATEUR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </Field>
              <ErrorMessage name="role" component="div" className="text-danger" />
            </BootstrapForm.Group>
          )}

          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>Profile Image (optional)</BootstrapForm.Label>
            <input
              id="image"
              name="image"
              type="file"
              onChange={(event) => {
                setFieldValue("image", event.currentTarget.files[0]);
              }}
              className="form-control"
            />
            <ErrorMessage name="image" component="div" className="text-danger" />
          </BootstrapForm.Group>

          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;