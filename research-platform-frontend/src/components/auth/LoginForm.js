import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Form as BootstrapForm, Alert, Row, Col } from 'react-bootstrap';

const LoginForm = ({ onSubmit }) => {
  const initialValues = {
    email: '',
    password: ''
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required')
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>Email</BootstrapForm.Label>
            <Field 
              name="email" 
              type="email" 
              as={BootstrapForm.Control} 
              placeholder="Enter email" 
            />
            <ErrorMessage name="email" component="div" className="text-danger" />
          </BootstrapForm.Group>

          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>Password</BootstrapForm.Label>
            <Field 
              name="password" 
              type="password" 
              as={BootstrapForm.Control} 
              placeholder="Password" 
            />
            <ErrorMessage name="password" component="div" className="text-danger" />
          </BootstrapForm.Group>

          <Row className="mb-3">
            <Col className="d-flex justify-content-center">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
                style={{ padding: '0.5rem 2rem' }}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;