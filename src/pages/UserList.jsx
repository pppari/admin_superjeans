import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { Table, Input, Button, Space, Modal, Popconfirm, message, Switch, Tag } from 'antd';
import { SearchOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import dateFormat from '../lib/dateFormat';
import Fuse from 'fuse.js';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [messageApi, contextHolder] = message.useMessage();


  const fuse = new Fuse(users, {
    keys: ['email'],
    threshold: 0.3,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      const userData = Array.isArray(res.data.data) ? res.data.data : res.data.data || [];
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (err) {
      console.error('Error fetching users:', err);
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (!value) {
      setFilteredUsers(users);
    } else {
      const results = fuse.search(value).map(result => result.item);
      setFilteredUsers(results);
    }
    setPagination({ ...pagination, current: 1 });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      messageApi.open({
        type: 'success',
        content: 'ลบข้อมูลสำเร็จ',
      });

      fetchUsers();
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'ลบข้อมูลล้มเหลว',
      });

    }
  };

  const handleVerificationToggle = async (id, currentStatus) => {
    try {
      await axios.patch(`/api/users/${id}`, { isVerified: !currentStatus });
      messageApi.open({
        type: 'success',
        content: 'แก้ไขข้อมูลสำเร็จ',
      });

      fetchUsers();
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Verified',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (verified, record) => (
        <Tag color={verified ? 'green' : 'gray'}>{verified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dateFormat(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm title="Confirm delete?" onConfirm={() => handleDelete(record._id)}>
            <Button danger>
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  return (
    <div className="p-4">
      {contextHolder}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">จัดการสมาชิก</h1>
        <Input
          placeholder="Search by email"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          className="max-w-sm"
        />
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredUsers}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        className="shadow rounded-xl"
      />
    </div>
  );
};

export default UserList;
