import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Form as BootstrapForm, Modal } from 'react-bootstrap';

const UserFormModif = ({ user, onSubmit, onCancel, show, loading }) => {
  const initialValues = user || {
    username: '',
    email: '',
    password: '', // Optional for updates
    role: '',
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string(), // Optional for updates
    role: Yup.string().required('Role is required'),
  });

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>{user ? 'Edit Profile' : 'Add New User'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
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
                  placeholder="Enter password (optional)"
                />
                <ErrorMessage name="password" component="div" className="text-danger" />
              </BootstrapForm.Group>

              <BootstrapForm.Group className="mb-3">
                <BootstrapForm.Label>Role</BootstrapForm.Label>
                <Field name="role" as={BootstrapForm.Select}>
                  <option value="">Select a role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="RESEARCHER">Researcher</option>
                  <option value="USER">User</option>
                </Field>
                <ErrorMessage name="role" component="div" className="text-danger" />
              </BootstrapForm.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default UserFormModif;