import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Form as BootstrapForm, Spinner, Alert } from 'react-bootstrap';
import domainService from '../../api/domains';
import userService from '../../api/users';
// import * as pdfjsLib from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist/webpack'; // Updated import


const PublicationForm = ({ onSubmit, onCancel }) => {
  const [domains, setDomains] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await domainService.getAllDomains();
        setDomains(response.data);
      } catch (err) {
        setError('Failed to fetch domains');
        console.error('Error fetching domains:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const user = localStorage.getItem('user'); // Retrieve the user JSON string
      if (!user) {
        throw new Error('User not found in localStorage');
      }

      const parsedUser = JSON.parse(user); // Parse the JSON string
      const userId = parsedUser.id; // Extract the user ID
      // console.log('Retrieved userId from localStorage:', userId);

      const response = await userService.getUserById(userId); // Fetch user details using the ID
      setCurrentUser(response.data); // Set the current user state
    } catch (err) {
      setError('Failed to fetch current user');
      console.error('Error fetching current user:', err);
    } finally {
      setLoading(false); // Ensure loading state is updated
    }
  };

  fetchCurrentUser();
}, []);

  const initialValues = {
    title: '',
    domain: '',
    pdfFile: null,
    premium: false,
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    domain: Yup.string().required('Domain is required'),
    pdfFile: Yup.mixed().required('PDF file is required'),
  });

  // const handleSubmit = async (values, { setSubmitting }) => {
  //   try {
  //     // Create FormData for multipart request
  //     console.log(`user id heyaaaa ${currentUser.id}`);
  //     const formData = new FormData();
  //     formData.append('title', values.title); // Title of the publication
  //     formData.append('description', values.description); // Description
  //     formData.append('status', 'PENDING'); // Default status
  //     formData.append('premium', values.premium); // Premium status (boolean)
  //     formData.append('researcherId', currentUser.id); // Replace with the actual researcher ID (e.g., from user context)
  //     formData.append('domainId', values.domain); // Domain ID (integer)
  //     formData.append('pdfFile', values.pdfFile); // PDF file

  //     // Log the formData keys and values for debugging
  //     for (let pair of formData.entries()) {
  //       console.log(pair[0], pair[1]);
  //     }

  //     await onSubmit(formData); // Pass the FormData to the parent component's onSubmit
  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
//   const handleSubmit = async (values, { setSubmitting }) => {
//   try {
//     // Create FormData for multipart request
//     console.log(`user id heyaaaa ${currentUser.id}`);
//     const formData = new FormData();
//     formData.append('title', values.title);
//     formData.append('status', 'PENDING');
//     formData.append('premium', values.premium);
//     formData.append('researcherId', currentUser.id);
//     formData.append('domainId', values.domain);
//     formData.append('pdfFile', values.pdfFile);

//     // Handle description - generate if empty
//     let description = values.description;
//     if (!description || description.trim() === '') {
//       try {
//         // Call the summarizer API to generate a description from the title
//         const response = await fetch(
//           'https://article-extractor-and-summarizer.p.rapidapi.com/summarize-text',
//           {
//             method: 'POST',
//             headers: {
//               'x-rapidapi-key': '651df860a9msh932194d37b0a856p184a48jsn5f1fceaf5efe',
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//               text: values.title, // Using title as input text
//               lang: 'en', // Default to English, change to 'fr' for French
//             }),
//           }
//         );

//         if (!response.ok) {
//           throw new Error('Failed to generate description');
//         }

//         const data = await response.json();
//         description = data.summary || `A research publication about ${values.title}`;
//       } catch (apiError) {
//         console.error('Error generating description:', apiError);
//         description = `A research publication about ${values.title}`;
//       }
//     }

//     formData.append('description', description);

//     // Log the formData keys and values for debugging
//     for (let pair of formData.entries()) {
//       console.log(pair[0], pair[1]);
//     }

//     await onSubmit(formData); // Pass the FormData to the parent component's onSubmit
//   } catch (error) {
//     console.error('Error submitting form:', error);
//   } finally {
//     setSubmitting(false);
//   }
// };

const handleSubmit = async (values, { setSubmitting }) => {
  try {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('status', 'PENDING');
    formData.append('premium', values.premium);
    formData.append('researcherId', currentUser.id);
    formData.append('domainId', values.domain);
    formData.append('pdfFile', values.pdfFile);

    // Handle description - generate if empty
    let description = values.description;
    if (!description || description.trim() === '') {
      try {
        // Extract text from PDF using pdf.js
        const pdfText = await extractTextFromPDF(values.pdfFile);

        console.log(pdfText);
        
        if (!pdfText.trim()) {
          throw new Error('PDF text extraction returned empty content');
        }

        // Use first 1000 chars to avoid hitting API limits
        const textToSummarize = pdfText.substring(0, 1000);

        // Call summarizer API
        const response = await fetch(
          'https://article-extractor-and-summarizer.p.rapidapi.com/summarize-text',
          {
            method: 'POST',
            headers: {
              'x-rapidapi-key': '651df860a9msh932194d37b0a856p184a48jsn5f1fceaf5efe',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: textToSummarize,
              lang: 'en', // or 'fr'
            }),
          }
        );

        description = response.ok 
          ? (await response.json()).summary || generateFallbackDescription(values.title)
          : generateFallbackDescription(values.title);

      } catch (apiError) {
        console.error('Error generating description:', apiError);
        description = generateFallbackDescription(values.title);
      }
    }

    formData.append('description', description);

    // Debug logging
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    await onSubmit(formData);
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    setSubmitting(false);
  }
};

// PDF Text Extraction with pdf.js
async function extractTextFromPDF(pdfFile) {
  try {
    // Set worker path (version must match package.json)
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url
      ).toString();

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      // Disable worker for debugging if needed:
      // useWorker: false
    }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Fallback description generator
function generateFallbackDescription(title) {
  return `A research publication about ${title}`;
}

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, isSubmitting }) => (
        <Form>
          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>Title</BootstrapForm.Label>
            <Field
              name="title"
              as={BootstrapForm.Control}
              type="text"
              placeholder="Enter title"
            />
            <ErrorMessage name="title" component="div" className="text-danger" />
          </BootstrapForm.Group>

          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>Description (AI will help if empty 🤖)</BootstrapForm.Label>
            <Field
              name="description"
              as={BootstrapForm.Control}
              type="text"
              placeholder="Enter description or Try leaving me empty for a surprise!"
            />
            <ErrorMessage name="title" component="div" className="text-danger" />
          </BootstrapForm.Group>

          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>Domain</BootstrapForm.Label>
            <Field name="domain" as={BootstrapForm.Select}>
              <option value="">Select a domain</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </Field>
            <ErrorMessage name="domain" component="div" className="text-danger" />
          </BootstrapForm.Group>

          <BootstrapForm.Group className="mb-3">
            <BootstrapForm.Label>PDF File</BootstrapForm.Label>
            <BootstrapForm.Control
              type="file"
              accept=".pdf"
              onChange={(event) => {
                setFieldValue('pdfFile', event.currentTarget.files[0]);
              }}
            />
            <ErrorMessage name="pdfFile" component="div" className="text-danger" />
          </BootstrapForm.Group>

          <BootstrapForm.Group className="mb-3">
            <Field
              name="premium"
              as={BootstrapForm.Check}
              type="checkbox"
              label="Premium Publication"
            />
          </BootstrapForm.Group>

          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" /> : 'Submit'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PublicationForm;