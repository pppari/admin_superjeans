import React, { useEffect, useState } from 'react';
import { Card, Divider, Spin, Statistic, Table, Tag } from 'antd';
import { AiOutlineUser, AiOutlineShoppingCart, AiOutlineDollar } from 'react-icons/ai';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs } from 'antd';
import moment from 'moment';
const { TabPane } = Tabs;

import axios from '../lib/axios';
import toPrice from '../lib/toPrice';
import dateFormat from '../lib/dateFormat';
import { DollarOutlined } from '@ant-design/icons';
import { FaDollarSign, FaShoppingCart } from 'react-icons/fa';
import { FaBahtSign, FaSackDollar, FaUserPlus } from 'react-icons/fa6';


const Dashboard = () => {
  const [data, setData] = useState(null);
  const [rd, setRd] = useState('7d'); // default
  const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#888888'];

  useEffect(() => {
    axios.get(`/api/dashboard/overview?rd=${rd}`)
      .then(res => setData(res.data))
      .catch(err => {console.error(err)});
  }, [rd]);
  if (!data) return <div className="text-center p-10"><Spin size="large" /></div>;

  const {
    salesToday,
    salesThisMonth,
    orderStatusCount,
    newUsersToday,
    latestUsers,
    revenueDaily,
    salesByCategory,
    topProductsByRevenue,
    topProductsByQty,
    topProvinces
  } = data;

  const renderStatusTag = (status) => {
    const colors = {
      'ชำระเงินสำเร็จ': 'blue',
      'รอจัดส่ง': 'gold',
      'อยู่ระหว่างจัดส่ง': 'orange',
      'จัดส่งแล้ว': 'green',
      'ยกเลิก': 'gray',
    };
    return <Tag color={colors[status.toLowerCase()] || 'blue'}>{status}</Tag>;
  };

  const columnsUsers = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'สร้างเมื่อ',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => dateFormat(date),
    },
  ];

  const columnsTopProducts = [
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'ยอดขาย (บาท)',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (text) => toPrice(text),
    },
  ];

  const columnsTopQty = [
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'จำนวนที่ขายได้',
      dataIndex: 'qty',
      key: 'qty',
      render: (text) => parseFloat(text).toLocaleString(),
    },
  ];


  const stats = [
    {
      title: 'ยอดขายวันนี้',
      icon: <FaShoppingCart className="text-4xl" style={{ color: '#ec7d3c' }} />,
      value: toPrice(salesToday),
    },
    {
      title: 'ยอดขายเดือนนี้',
      icon: <FaSackDollar className="text-4xl" style={{ color: '#ec7d3c' }} />,
      value: toPrice(salesThisMonth),
    },
    {
      title: 'ผู้ใช้ใหม่วันนี้',
      icon: <FaUserPlus className="text-4xl" style={{ color: '#ec7d3c' }} />,
      value: parseFloat(newUsersToday).toLocaleString(),
    },
  ];

  const statusOrder = {
    'รอจัดส่ง': 1,
    'อยู่ระหว่างจัดส่ง': 2,
    'จัดส่งแล้ว': 3,
    'ยกเลิก': 4,
  };
  
  const allStatuses = Object.keys(statusOrder);
  const statusMap = Object.fromEntries(orderStatusCount.map(s => [s._id, s]));
  
  const sortedOrderStatus = allStatuses
    .map((status) => ({
      _id: status,
      count: statusMap[status]?.count || 0,
    }))
    .sort((a, b) => statusOrder[a._id] - statusOrder[b._id]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="rounded shadow border border-gray-300"
          >
            <div className="flex items-center space-x-4">
              <div>
                {stat.icon}
              </div>
              <Statistic
                title={<span className="text-gray-500">{stat.title}</span>}
                value={stat.value}
                valueStyle={{ color: '#004f3b', fontWeight: '700', fontSize: '1.75rem' }}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        {sortedOrderStatus.map((status) => (
          <Card
            key={status._id}
            className="rounded shadow border border-gray-300"
            bordered={false}
          >
            <div className="mb-2">{renderStatusTag(status._id)}</div>
            <Statistic
              title="จำนวนออเดอร์"
              value={parseFloat(status.count).toLocaleString()}
              valueStyle={{
                color: '#004f3b',
                fontWeight: '700',
                fontSize: '1.75rem',
              }}
            />
          </Card>
        ))}
      </div>


      <Divider />

      {/* Chart & Category */}
      <div className="mb-8">
        <Card
          title={<span className="text-xl font-semibold">รายได้รวม</span>}
          className="shadow rounded border border-gray-300"
          extra={
            <Tabs activeKey={rd} onChange={setRd} size="small" className="text-sm font-medium">
              <TabPane tab="3 วัน" key="3d" />
              <TabPane tab="7 วัน" key="7d" />
              <TabPane tab="1 เดือน" key="1m" />
              <TabPane tab="3 เดือน" key="3m" />
              <TabPane tab="6 เดือน" key="6m" />
              <TabPane tab="1 ปี" key="1y" />
            </Tabs>
          }
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={revenueDaily}>
              <XAxis
                dataKey="_id"
                tickFormatter={(value) => {
                  if (rd === '1m' || rd === '3m') return `สัปดาห์ ${value.split('-')[1]}`;
                  if (rd === '6m' || rd === '1y') return moment(value, 'YYYY-MM').format('MMM YY');
                  return value;
                }}
                stroke="#6b7280"
                tickLine={false}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis
                tickFormatter={(value) => value.toLocaleString()}
                stroke="#6b7280"
                tickLine={false}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip formatter={(value) => toPrice(value)} />
              <Legend />
              <Bar
                dataKey="total"
                name="ยอดขาย"
                fill="#6366f1"
                barSize={40}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </Card>
      </div>

      {/* Top Provinces & Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        {/* จังหวัดที่มียอดขายสูงสุด */}
{/*         <Card title={<span className="text-xl font-semibold">จังหวัดที่มียอดขายสูงสุด</span>} className="shadow rounded border border-gray-300" bordered={false}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProvinces}
                dataKey="totalSales"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {topProvinces.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => toPrice(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card> */}

        {/* ยอดขายตามหมวดหมู่ */}
        <Card title={<span className="text-xl font-semibold">ยอดขายตามหมวดหมู่</span>} className="shadow rounded border border-gray-300" bordered={false}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesByCategory}
                dataKey="total"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {salesByCategory.map((_, index) => (
                  <Cell key={`cell-cat-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => toPrice(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Divider />

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title={<span className="text-xl font-semibold">รายการสินค้าขายดี (ยอดขาย)</span>} className="shadow rounded border border-gray-300" bordered={false}>
          <Table
            dataSource={topProductsByRevenue}
            columns={columnsTopProducts}
            pagination={false}
            rowKey="_id"
            className="hover:shadow-lg rounded-lg"
            rowClassName={() => 'hover:bg-indigo-50 cursor-pointer'}
          />
        </Card>

        <Card title={<span className="text-xl font-semibold">รายการสินค้าขายดี (จำนวน)</span>} className="shadow rounded border border-gray-300" bordered={false}>
          <Table
            dataSource={topProductsByQty}
            columns={columnsTopQty}
            pagination={false}
            rowKey="_id"
            className="hover:shadow-lg rounded-lg"
            rowClassName={() => 'hover:bg-green-50 cursor-pointer'}
          />
        </Card>
      </div>

      <Divider />


      {/* Users & Order Status */}
      <Card title={<span className="text-xl font-semibold">ผู้ใช้ล่าสุด</span>} className="shadow rounded border border-gray-300" bordered={false}>
        <Table
          dataSource={latestUsers}
          columns={columnsUsers}
          pagination={false}
          rowKey="_id"
          rowClassName={() => 'hover:bg-indigo-100 cursor-pointer'}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
