import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tabs, Tab } from 'react-bootstrap';
import UserList from '../components/users/UserList';

const UsersPage = () => {
  const { user } = useAuth();
  const [key, setKey] = useState('all');

  if (user?.role !== 'ADMIN') {
    return (
      <div className="alert alert-danger">
        You don't have permission to access this page.
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">User Management</h1>
      
      <Tabs
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="all" title="All Users">
          <UserList />
        </Tab>
        <Tab eventKey="users" title="Users">
          <UserList roleFilter="USER" />
        </Tab>
        <Tab eventKey="researchers" title="Researchers">
          <UserList roleFilter="RESEARCHER" />
        </Tab>
        <Tab eventKey="moderators" title="Moderators">
          <UserList roleFilter="MODERATEUR" />
        </Tab>
        <Tab eventKey="admins" title="Admins">
          <UserList roleFilter="ADMIN" />
        </Tab>
      </Tabs>
    </div>
  );
};

export default UsersPage;