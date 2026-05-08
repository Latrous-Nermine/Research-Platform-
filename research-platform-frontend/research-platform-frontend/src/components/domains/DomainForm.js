import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Form as BootstrapForm, Modal } from 'react-bootstrap';

const DomainForm = ({ domain, onSubmit, onCancel, show, loading }) => {
  const initialValues = domain || { name: '' };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Domain name is required')
  });

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>{domain ? 'Edit Domain' : 'Add New Domain'}</Modal.Title>
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
                <BootstrapForm.Label>Domain Name</BootstrapForm.Label>
                <Field 
                  name="name" 
                  as={BootstrapForm.Control} 
                  type="text" 
                  placeholder="Enter domain name" 
                />
                <ErrorMessage name="name" component="div" className="text-danger" />
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

export default DomainForm;