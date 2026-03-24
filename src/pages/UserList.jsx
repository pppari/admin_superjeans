import React, { useEffect, useState, useMemo } from 'react';
import axios from '../lib/axios';
import { Table, Input, Button, Space, Popconfirm, message, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dateFormat from '../lib/dateFormat';
import Fuse from 'fuse.js';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [messageApi, contextHolder] = message.useMessage();

  // Fuse.js สำหรับ search
  const fuse = useMemo(
    () =>
      new Fuse(users, {
        keys: [
          'email',
          'addresses.0.fullname',
          'addresses.0.phone',
          'addresses.0.address',
          'addresses.0.province',
        ],
        threshold: 0.3,
      }),
    [users]
  );


// fetch Users พร้อม Address
const fetchUsers = async () => {
  setLoading(true);
  try {
    const res = await axios.get('/api/users'); // backend ต้อง populate Address
    const userData = Array.isArray(res.data.data) ? res.data.data : [];
    setUsers(userData);
    setFilteredUsers(userData);
  } catch (err) {
    console.error('Error fetching users:', err);
    messageApi.open({ type: 'error', content: 'มีบางอย่างผิดพลาด' });
    setUsers([]);
    setFilteredUsers([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => { fetchUsers(); }, []);

// search
const handleSearch = (e) => {
  const value = e.target.value;
  setSearchText(value);
  setFilteredUsers(value ? fuse.search(value).map(r => r.item) : users);
  setPagination({ ...pagination, current: 1 });
};

// toggle verification
const handleVerificationToggle = async (id, currentStatus) => {
  try {
    await axios.patch(`/api/users/${id}`, { isVerified: !currentStatus });
    messageApi.open({ type: 'success', content: 'แก้ไขข้อมูลสำเร็จ' });
    fetchUsers();
  } catch {
    messageApi.open({ type: 'error', content: 'มีบางอย่างผิดพลาด' });
  }
};

// soft delete
const handleDelete = async (id) => {
  try {
    await axios.patch(`/api/users/delete/${id}`);
    messageApi.open({ type: 'success', content: 'ลบข้อมูลสำเร็จ' });
    fetchUsers();
  } catch {
    messageApi.open({ type: 'error', content: 'ลบข้อมูลล้มเหลว' });
  }
};

// Columns
const columns = [
  { title: 'Email', dataIndex: 'email', key: 'email' },

  {
    title: 'ชื่อ-สกุล',
    render: (_, r) => r.addresses?.[0]?.fullname || '-',
  },
  {
    title: 'เบอร์โทร',
    render: (_, r) => r.addresses?.[0]?.phone || '-',
  },
  {
    title: 'ที่อยู่',
    render: (_, r) => r.addresses?.[0]?.address || '-',
  },
  {
    title: 'ตำบล',
    render: (_, r) => r.addresses?.[0]?.tambon || '-',
  },
  {
    title: 'อำเภอ',
    render: (_, r) => r.addresses?.[0]?.amphure || '-',
  },
  {
    title: 'จังหวัด',
    render: (_, r) => r.addresses?.[0]?.province || '-',
  },
  {
    title: 'รหัสไปรษณีย์',
    render: (_, r) => r.addresses?.[0]?.zip_code || '-',
  },

  {
    title: 'สร้างขึ้นเมื่อ',
    dataIndex: 'created_at',
    render: dateFormat,
  },
  {
    title: 'หมายเหตุ',
    key: 'actions',
    render: (_, record) => (
      <Space>
        <Popconfirm
          title="คุณแน่ใจหรือไม่ว่าต้องการลบ?"
          onConfirm={() => handleDelete(record._id)}
        >
          <Button danger>ลบ</Button>
        </Popconfirm>
      </Space>
    ),
  },

];


return (
  <div className="p-4">
    {contextHolder}
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-semibold">จัดการสมาชิก</h1>
      <Input
        placeholder="ค้นหา ..."
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
      onChange={setPagination}
      className="shadow rounded-xl"
    />
  </div>
);
};

export default UserList;
