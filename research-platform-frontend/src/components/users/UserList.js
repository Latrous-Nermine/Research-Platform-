import { useState, useEffect } from 'react';
import userService from '../../api/users';
import UserCard from './UserCard';
import { Spinner, Alert, Button, Row, Col, Form } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import UserForm from './UserForm';

const UserList = ({ roleFilter = null }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let response;
        if (roleFilter) {
          response = await userService.getUsersByRole(roleFilter);
        } else {
          response = await userService.getAllUsers();
        }
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleFilter]);

  const handleCreate = async (userData) => {
    try {
      const response = await userService.createUser(userData);
      // setUsers([...users, response.data]);
      window.location.reload();
      setShowForm(false);
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleUpdate = async (userData) => {
    try {
      const response = await userService.updateUser(editingUser.id, userData);
      setUsers(users.map(user => 
        user.id === editingUser.id ? response.data : user
      ));
      setEditingUser(null);
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await userService.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>{roleFilter ? `${roleFilter}S` : 'All Users'}</h2>
        <Button onClick={() => {
          setEditingUser(null);
          setShowForm(true);
        }}>
          <Plus className="me-1" />
          Add User
        </Button>
      </div>

      {(showForm || editingUser) && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          isAdmin={true}
        />
      )}

      <Form.Group className="mb-3" style={{ paddingTop: '1rem' }}>
        <Form.Control
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <Row>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <Col key={user.id} md={6} lg={4} className="mb-3">
              <UserCard 
                user={user} 
                onDelete={handleDelete}
              />
            </Col>
          ))
        ) : (
          <Col>
            <p>No users found</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default UserList;