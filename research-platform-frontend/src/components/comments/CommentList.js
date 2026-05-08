import { useEffect, useState } from 'react';
import commentService from '../../api/comments';
import { Alert, Spinner, ListGroup, Image, Button, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Send, Pencil, Trash } from 'react-bootstrap-icons';
import moment from 'moment';

const CommentList = ({ publicationId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const { user } = useAuth();

  const getImageSrc = (imageData) => {
    if (!imageData) return '/person-circle.svg';
    if (imageData.startsWith('data:image')) return imageData;
    if (/^[A-Za-z0-9+/=]+$/.test(imageData)) return `data:image/jpeg;base64,${imageData}`;
    return imageData;
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await commentService.getAllComments(publicationId);
        setComments(response.data);
      } catch (err) {
        setError('Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [publicationId]);

  const handleCreate = async () => {
    const content = commentText.trim();
    if (!content) return;
    try {
      const optimistic = { id: Date.now(), content, user, createdAt: new Date().toISOString() };
      setComments(prev => [...prev, optimistic]);
      setCommentText('');
      const response = await commentService.createComment({ publicationId, userId: user.id, content });
      setComments(prev => prev.map(c => c.id === optimistic.id ? response.data : c));
    } catch (err) {
      setError('Failed to create comment');
    }
  };

  const handleUpdate = async (commentId) => {
    const content = editText.trim();
    if (!content) return;
    try {
      await commentService.updateComment(commentId, { content });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, content } : c));
      setEditingId(null);
    } catch (err) {
      setError('Failed to update comment');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  if (loading) return <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h5 className="mb-3">Comments</h5>

      <ListGroup className="mb-3">
        {comments.length > 0 ? comments.map(comment => (
          <ListGroup.Item key={comment.id} className="border-0 px-0">
            <div className="d-flex">
              <Image
                src={getImageSrc(comment.user?.image)}
                roundedCircle
                width={36}
                height={36}
                className="me-2 flex-shrink-0"
                onError={(e) => { e.target.onerror = null; e.target.src = '/person-circle.svg'; }}
              />
              <div className="flex-grow-1">
                {editingId === comment.id ? (
                  <div className="d-flex">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="me-2"
                    />
                    <div className="d-flex flex-column gap-1">
                      <Button size="sm" variant="primary" onClick={() => handleUpdate(comment.id)}
                        disabled={!editText.trim()}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-light p-2 rounded">
                      <strong>{comment.user?.username || 'Unknown'}</strong>
                      <p className="mb-0">{comment.content}</p>
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <small className="text-muted">{moment(comment.createdAt).fromNow()}</small>
                      {user?.id === comment.user?.id && (
                        <>
                          <Button variant="link" size="sm" className="p-0 text-muted"
                            onClick={() => { setEditingId(comment.id); setEditText(comment.content); }}>
                            <Pencil size={13} />
                          </Button>
                          <Button variant="link" size="sm" className="p-0 text-danger"
                            onClick={() => handleDelete(comment.id)}>
                            <Trash size={13} />
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </ListGroup.Item>
        )) : (
          <ListGroup.Item className="border-0 text-muted text-center px-0">
            No comments yet. Be the first to comment!
          </ListGroup.Item>
        )}
      </ListGroup>

      {user ? (
        <Form>
          <Form.Group className="d-flex">
            <Image
              src={getImageSrc(user?.image)}
              roundedCircle
              width={36}
              height={36}
              className="me-2 flex-shrink-0"
              onError={(e) => { e.target.onerror = null; e.target.src = '/person-circle.svg'; }}
            />
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="me-2"
            />
            <Button variant="primary" onClick={handleCreate} disabled={!commentText.trim()}>
              <Send />
            </Button>
          </Form.Group>
        </Form>
      ) : (
        <Alert variant="info" className="py-2 mb-0">
          <Link to="/login" className="alert-link">Login</Link> to leave a comment.
        </Alert>
      )}
    </div>
  );
};

export default CommentList;