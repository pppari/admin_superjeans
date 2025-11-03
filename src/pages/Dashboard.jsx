import React, { useEffect, useState } from 'react';
import { Card, Divider, Spin, Statistic, Table, Tag, Tabs } from 'antd';
import { FaShoppingCart } from 'react-icons/fa';
import { FaSackDollar, FaUserPlus } from 'react-icons/fa6';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import moment from 'moment-timezone';
import 'moment/dist/locale/th';

import axios from '../lib/axios';
import toPrice from '../lib/toPrice';
import dateFormat from '../lib/dateFormat';

moment.locale('th');

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [rd, setRd] = useState('3m'); // ช่วงเวลาเริ่มต้น
  const [activeGraph, setActiveGraph] = useState('revenue'); // 'revenue' หรือ 'users'

  const formatDateThai = (date, fullMonth = false) => {
    const d = moment(date).tz('Asia/Bangkok').locale('th');
    const formatStr = fullMonth ? 'D MMMM' : 'D MMM';
    return d.format(formatStr) + ' ' + (d.year() + 543);
  };

  useEffect(() => {
    axios
      .get(`/api/dashboard/overview?rd=${rd}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [rd]);

  if (!data)
    return (
      <div className="text-center p-10">
        <Spin size="large" />
      </div>
    );

  const {
    salesToday = 0,
    salesThisMonth = 0,
    newUsersToday = 0,
    orderStatusCount = [],
    latestUsers = [],
    revenueDaily = [],
    topProductsByRevenue = [],
    topProductsByQty = [],
    salesByCategory = [],
  } = data;

  // ฟังก์ชันกรองช่วงเวลา
  const filterByRange = (items, dateKey) => {
    let startDate;
    const today = moment().tz('Asia/Bangkok').startOf('day');
    if (rd === '7d') startDate = today.clone().subtract(6, 'days');
    if (rd === '1m') startDate = today.clone().subtract(1, 'month').startOf('day');
    if (rd === '3m') startDate = today.clone().subtract(3, 'month').startOf('day');

    return items.filter(item => moment(item[dateKey]).tz('Asia/Bangkok').isSameOrAfter(startDate));
  };

  // รายได้รวมตามวัน
  const revenueFiltered = filterByRange(revenueDaily, '_id');
  const uniqueRevenueDailyRaw = revenueFiltered.length
    ? Object.values(
        revenueFiltered.reduce((acc, cur) => {
          const dayKey = moment(cur._id).tz('Asia/Bangkok').format('YYYY-MM-DD');
          if (!acc[dayKey]) acc[dayKey] = { date: dayKey, revenue: 0 };
          acc[dayKey].revenue += cur.total;
          return acc;
        }, {})
      ).sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  // ผู้ใช้ใหม่ต่อวัน
  const usersFiltered = filterByRange(latestUsers, 'created_at');
  const newUsersDailyRaw = Object.values(
    usersFiltered.reduce((acc, cur) => {
      const dayKey = moment(cur.created_at).tz('Asia/Bangkok').format('YYYY-MM-DD');
      if (!acc[dayKey]) acc[dayKey] = { date: dayKey, count: 0 };
      acc[dayKey].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Stats ด้านบน
  const stats = [
    { title: 'ยอดขายวันนี้', icon: <FaShoppingCart className="text-4xl" style={{ color: '#ec7d3c' }} />, value: toPrice(salesToday) },
    { title: 'ยอดขายเดือนนี้', icon: <FaSackDollar className="text-4xl" style={{ color: '#ec7d3c' }} />, value: toPrice(salesThisMonth) },
    { title: 'ผู้ใช้ใหม่วันนี้', icon: <FaUserPlus className="text-4xl" style={{ color: '#ec7d3c' }} />, value: parseFloat(newUsersToday).toLocaleString() },
  ];

  // Order Status
  const statusOrder = { 'รอจัดส่ง': 1, 'อยู่ระหว่างจัดส่ง': 2, 'จัดส่งแล้ว': 3, 'ยกเลิก': 4 };
  const allStatuses = Object.keys(statusOrder);
  const statusMap = Object.fromEntries(orderStatusCount.map(s => [s._id, s]));
  const sortedOrderStatus = allStatuses.map(status => ({ _id: status, count: statusMap[status]?.count || 0 }))
    .sort((a, b) => statusOrder[a._id] - statusOrder[b._id]);

  const renderStatusTag = (status) => {
    const colors = { 'ชำระเงินสำเร็จ': 'blue', 'รอจัดส่ง': 'gold', 'อยู่ระหว่างจัดส่ง': 'orange', 'จัดส่งแล้ว': 'green', 'ยกเลิก': 'gray' };
    return <Tag color={colors[status] || 'blue'}>{status}</Tag>;
  };

  // Tables columns
  const columnsTopProducts = [
    { title: 'ชื่อสินค้า', dataIndex: 'productName', key: 'productName' },
    { title: 'ยอดขาย (บาท)', dataIndex: 'revenue', key: 'revenue', render: (text) => toPrice(text) },
  ];
  const columnsTopQty = [
    { title: 'ชื่อสินค้า', dataIndex: 'productName', key: 'productName' },
    { title: 'จำนวนที่ขายได้', dataIndex: 'qty', key: 'qty', render: (text) => parseFloat(text).toLocaleString() },
  ];
  const columnsUsers = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'สร้างเมื่อ', dataIndex: 'created_at', key: 'created_at', render: date => dateFormat(date) },
  ];

  // Chart dataset
  const chartData = activeGraph === 'revenue' ? uniqueRevenueDailyRaw : newUsersDailyRaw;
  const barColor = activeGraph === 'revenue' ? '#3b82f6' : '#f97316';

  const tabItems = [
    { key: '7d', label: '7 วัน' },
    { key: '1m', label: '1 เดือน' },
    { key: '3m', label: '3 เดือน' },
  ];

  // -----------------------------
  // Fallback / mock data
  // -----------------------------
  const defaultProductsByRevenue = [
    { _id: 1, productName: 'สินค้ากลุ่ม A', revenue: 15000 },
    { _id: 2, productName: 'สินค้ากลุ่ม B', revenue: 12000 },
    { _id: 3, productName: 'สินค้ากลุ่ม C', revenue: 9000 },
  ];
  const defaultProductsByQty = [
    { _id: 1, productName: 'สินค้ากลุ่ม A', qty: 150 },
    { _id: 2, productName: 'สินค้ากลุ่ม B', qty: 120 },
    { _id: 3, productName: 'สินค้ากลุ่ม C', qty: 90 },
  ];
  const defaultSalesByCategory = [
    { _id: 1, categoryName: 'หมวดหมู่ A', total: 20000 },
    { _id: 2, categoryName: 'หมวดหมู่ B', total: 15000 },
    { _id: 3, categoryName: 'หมวดหมู่ C', total: 10000 },
  ];

  const topProductsRevenueData = topProductsByRevenue && topProductsByRevenue.length
    ? topProductsByRevenue
    : defaultProductsByRevenue;
  const topProductsQtyData = topProductsByQty && topProductsByQty.length
    ? topProductsByQty
    : defaultProductsByQty;
  const salesByCategoryData = salesByCategory && salesByCategory.length
    ? salesByCategory
    : defaultSalesByCategory;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx} className="rounded shadow border border-gray-300">
            <div className="flex items-center space-x-4">
              <div>{stat.icon}</div>
              <Statistic title={<span className="text-gray-500">{stat.title}</span>} value={stat.value} valueStyle={{ color: '#004f3b', fontWeight: '700', fontSize: '1.75rem' }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Order Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        {sortedOrderStatus.map(status => (
          <Card key={status._id} className="rounded shadow border border-gray-300">
            <div className="mb-2">{renderStatusTag(status._id)}</div>
            <Statistic title="จำนวนออเดอร์" value={parseFloat(status.count).toLocaleString()} valueStyle={{ color: '#004f3b', fontWeight: '700', fontSize: '1.75rem' }} />
          </Card>
        ))}
      </div>

      <Divider />

      {/* Chart + Tabs */}
      <Card title={activeGraph === 'revenue' ? 'รายได้รวม' : 'จำนวนผู้ใช้ใหม่'} className="shadow rounded border border-gray-300 mb-8"
        extra={<Tabs activeKey={rd} onChange={setRd} size="small" className="text-sm font-medium" items={tabItems} />}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" tickFormatter={date => formatDateThai(date, false)} tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => activeGraph === 'revenue' ? `${v.toLocaleString()} บาท` : `${v.toLocaleString()} คน`} tick={{ fontSize: 14 }} width={100} />
            <Tooltip labelFormatter={label => formatDateThai(label, true)} formatter={v => activeGraph === 'revenue' ? `${v.toLocaleString()} บาท` : `${v.toLocaleString()} คน`} />
            <Bar dataKey={activeGraph === 'revenue' ? 'revenue' : 'count'} fill={barColor} barSize={60} />
          </BarChart>
        </ResponsiveContainer>

        {/* ปุ่มสลับกราฟ */}
        <div className="flex justify-center gap-3 mt-6">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${activeGraph === 'revenue' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveGraph('revenue')}>● รายได้รวม</button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${activeGraph === 'users' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveGraph('users')}>● ผู้ใช้งานใหม่</button>
        </div>
      </Card>

      <Divider />

      {/* Category & Product Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="ยอดขายตามหมวดหมู่" className="shadow rounded border border-gray-300">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesByCategoryData}
                dataKey="total"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {salesByCategoryData.map((_, index) => (
                  <Cell key={`cell-cat-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => toPrice(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="ยอดขายตามสินค้า" className="shadow rounded border border-gray-300">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProductsRevenueData.map(item => ({
                  name: item.productName,
                  value: item.revenue
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {topProductsRevenueData.map((_, index) => (
                  <Cell key={`cell-prod-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => toPrice(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Divider />

      {/* Top Products Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="รายการสินค้าขายดี (ยอดขาย)" className="shadow rounded border border-gray-300">
          <Table dataSource={topProductsRevenueData} columns={columnsTopProducts} pagination={false} rowKey={record => record._id || record.productName} rowClassName={() => 'hover:bg-indigo-50 cursor-pointer'} />
        </Card>

        <Card title="รายการสินค้าขายดี (จำนวน)" className="shadow rounded border border-gray-300">
          <Table dataSource={topProductsQtyData} columns={columnsTopQty} pagination={false} rowKey={record => record._id || record.productName} rowClassName={() => 'hover:bg-green-50 cursor-pointer'} />
        </Card>
      </div>

      {/* Latest Users */}
      <Card title="ผู้ใช้ล่าสุด" className="shadow rounded border border-gray-300">
        <Table dataSource={latestUsers} columns={columnsUsers} pagination={false} rowKey={record => record._id || record.email} rowClassName={() => 'hover:bg-indigo-100 cursor-pointer'} />
      </Card>
    </div>
  );
};

export default Dashboard;
