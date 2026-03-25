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
moment.tz.setDefault('Asia/Bangkok');

const PIE_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#a855f7',
];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [rd, setRd] = useState('1y');
  const [activeGraph, setActiveGraph] = useState('revenue'); // revenue | users


  useEffect(() => {
    axios
      .get(`/api/dashboard/overview?rd=${rd}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [rd]);

  if (!data) {
    return (
      <div className="text-center p-10">
        <Spin size="large" />
      </div>
    );
  }

  const {
    salesToday = 0,
    salesThisMonth = 0,
    newUsersToday = 0,
    orderStatusCount = [],
    latestUsers = [],
    revenueDaily = [],
    salesByCategory = [],
    topProductsByRevenue = [],
    topProductsByQty = [],
  } = data;


  const formatDateThai = (timestamp, full = false) => {
    const m = moment(timestamp);
    return full
      ? `${m.format('D MMMM')} ${m.year() + 543}`
      : `${m.format('D MMM')} ${m.year() + 543}`;
  };


  const uniqueRevenueDailyRaw = revenueDaily.length
    ? Object.values(
      revenueDaily.reduce((acc, cur) => {
        const day = moment(cur._id)
          .startOf('day')
          .valueOf();

        if (!acc[day]) {
          acc[day] = { date: day, revenue: 0 };
        }
        acc[day].revenue += cur.total;
        return acc;
      }, {})
    ).sort((a, b) => a.date - b.date)
    : [];


  const newUsersDailyRaw = latestUsers.length
    ? Object.values(
      latestUsers.reduce((acc, cur) => {
        const day = moment(cur.created_at)
          .startOf('day')
          .valueOf();

        if (!acc[day]) {
          acc[day] = { date: day, count: 0 };
        }
        acc[day].count += 1;
        return acc;
      }, {})
    ).sort((a, b) => a.date - b.date)
    : [];

  const chartData =
    activeGraph === 'revenue'
      ? uniqueRevenueDailyRaw.map(d => ({
        ...d,
        label: formatDateThai(d.date),
      }))
      : newUsersDailyRaw.map(d => ({
        ...d,
        label: formatDateThai(d.date),
      }));




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
      value: newUsersToday.toLocaleString(),
    },
  ];


  const statusOrder = {
    'รอจัดส่ง': 1,
    'อยู่ระหว่างจัดส่ง': 2,
    'จัดส่งแล้ว': 3,
    'ยกเลิก': 4,
  };

  const statusMap = Object.fromEntries(
    orderStatusCount.map(s => [s._id, s.count])
  );

  const sortedOrderStatus = Object.keys(statusOrder)
    .map(key => ({
      _id: key,
      count: statusMap[key] || 0,
    }))
    .sort((a, b) => statusOrder[a._id] - statusOrder[b._id]);

  const renderStatusTag = status => {
    const colors = {
      'รอจัดส่ง': 'gold',
      'อยู่ระหว่างจัดส่ง': 'orange',
      'จัดส่งแล้ว': 'green',
      'ยกเลิก': 'red',
    };
    return <Tag color={colors[status]}>{status}</Tag>;
  };


  const columnsUsers = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'สร้างเมื่อ',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => dateFormat(date),
    },
  ];

  const columnsTopProducts = [
    { title: 'ชื่อสินค้า', dataIndex: 'productName', key: 'productName' },
    {
      title: 'ยอดขาย (บาท)',
      dataIndex: 'revenue',
      key: 'revenue',
      render: v => toPrice(v),
    },
  ];

  const columnsTopQty = [
    { title: 'ชื่อสินค้า', dataIndex: 'productName', key: 'productName' },
    {
      title: 'จำนวนที่ขายได้',
      dataIndex: 'qty',
      key: 'qty',
      render: v => v.toLocaleString(),
    },
  ];


  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((s, i) => (
          <Card key={i} className="shadow rounded">
            <div className="flex items-center gap-4">
              {s.icon}
              <Statistic
                title={s.title}
                value={s.value}
                valueStyle={{ fontSize: 24, fontWeight: 700 }}
              />
            </div>
          </Card>
        ))}
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        {sortedOrderStatus.map(s => (
          <Card key={s._id} className="shadow rounded">
            {renderStatusTag(s._id)}
            <Statistic
              title="จำนวนออเดอร์"
              value={s.count.toLocaleString()}
            />
          </Card>
        ))}
      </div>

      <Divider />


      <Card
        title={activeGraph === 'revenue' ? 'รายได้รวม' : 'ผู้ใช้ใหม่'}
        extra={
          <Tabs
            activeKey={rd}
            onChange={setRd}
            items={[
              { key: '3d', label: '3 วัน' },
              { key: '7d', label: '7 วัน' },
              { key: '1m', label: '1 เดือน' },
              { key: '3m', label: '3 เดือน' },
              { key: '6m', label: '6 เดือน' },
              { key: '1y', label: '1 ปี' },
            ]}
          />
        }
        className="shadow rounded mb-8"
      >


        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="label"
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip
              formatter={v =>
                activeGraph === 'revenue'
                  ? toPrice(v)
                  : `${v.toLocaleString()} คน`
              }
            />
            <Bar
              dataKey={activeGraph === 'revenue' ? 'revenue' : 'count'}
              fill={activeGraph === 'revenue' ? '#ff3a3a' : '#f97316'}
              barSize={40}
            />
          </BarChart>


        </ResponsiveContainer>

        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => setActiveGraph('revenue')}
            className={`px-4 py-2 rounded ${activeGraph === 'revenue'
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-200'
              }`}
          >
            รายได้
          </button>
          <button
            onClick={() => setActiveGraph('users')}
            className={`px-4 py-2 rounded ${activeGraph === 'users'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200'
              }`}
          >
            ผู้ใช้ใหม่
          </button>
        </div>
      </Card>

      <Divider />


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="สินค้าขายดี (ยอดขาย)">
          <Table
            dataSource={topProductsByRevenue}
            columns={columnsTopProducts}
            pagination={false}
            rowKey="_id"
          />
        </Card>

        <Card title="สินค้าขายดี (จำนวน)">
          <Table
            dataSource={topProductsByQty}
            columns={columnsTopQty}
            pagination={false}
            rowKey="_id"
          />
        </Card>
      </div>

      <Card title="ผู้ใช้ล่าสุด">
        <Table
          dataSource={latestUsers}
          columns={columnsUsers}
          pagination={false}
          rowKey="_id"
        />
      </Card>
    </div>
  );
};

export default Dashboard;