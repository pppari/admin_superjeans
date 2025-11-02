import React, { useEffect, useState } from 'react';
import { Card, Divider, Spin, Statistic, Table, Tag, Tabs } from 'antd';
import { AiOutlineUser, AiOutlineShoppingCart, AiOutlineDollar } from 'react-icons/ai';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "moment/dist/locale/th";
import moment from "moment-timezone";

moment.locale("th");

import axios from '../lib/axios';
import toPrice from '../lib/toPrice';
import dateFormat from '../lib/dateFormat';
import { FaShoppingCart } from 'react-icons/fa';
import { FaBahtSign, FaSackDollar, FaUserPlus } from 'react-icons/fa6';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [rd, setRd] = useState("3m"); // ช่วงเวลาเริ่มต้น = 3 เดือน
  const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#888888'];

  const formatDateThai = (date, fullMonth = false) => {
    const d = moment(date).tz("Asia/Bangkok").locale("th");
    const formatStr = fullMonth ? "D MMMM" : "D MMM";
    return d.format(formatStr) + " " + (d.year() + 543);
  };

  useEffect(() => {
    axios.get(`/api/dashboard/overview?rd=${rd}`)
      .then(res => setData(res.data))
      .catch(err => { console.error(err) });
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

  // ✅ ข้อมูลจำลองกรณีไม่มีข้อมูลจริง
  const dummyRevenue = [
    { date: moment().subtract(6, 'days').format('YYYY-MM-DD'), revenue: 0 },
    { date: moment().subtract(5, 'days').format('YYYY-MM-DD'), revenue: 0 },
    { date: moment().subtract(4, 'days').format('YYYY-MM-DD'), revenue: 0 },
    { date: moment().subtract(3, 'days').format('YYYY-MM-DD'), revenue: 0 },
    { date: moment().subtract(2, 'days').format('YYYY-MM-DD'), revenue: 0 },
    { date: moment().subtract(1, 'days').format('YYYY-MM-DD'), revenue: 0 },
    { date: moment().format('YYYY-MM-DD'), revenue: 0 },
  ];

  // ✅ ฟังก์ชันกรองและเติมวันให้ครบช่วง (7 วัน / 1 เดือน / 3 เดือน)
  const fillMissingDates = (data, range) => {
    let startDate, endDate;

    // 🗓 กำหนดช่วงเวลาแต่ละโหมด
    if (range === "7d") {
      startDate = moment().subtract(6, "days").startOf("day"); // 7 วันล่าสุดรวมวันนี้
      endDate = moment().endOf("day");
    } else if (range === "1m") {
      startDate = moment().subtract(1, "month").startOf("day"); // 1 เดือนย้อนหลังจากวันนี้
      endDate = moment().endOf("day");
    } else if (range === "3m") {
      startDate = moment().subtract(3, "months").startOf("day"); // 3 เดือนย้อนหลัง
      endDate = moment().endOf("day");
    }

    // ✅ กรองเฉพาะข้อมูลในช่วงนั้น
    const filteredData = data.filter(d =>
      moment(d.date).isBetween(startDate, endDate, null, "[]")
    );

    // ✅ เอาเฉพาะวันทีมีการซื้อ (revenue > 0)
    const filteredWithSales = filteredData.filter(d => d.revenue > 0);

    // ✅ ถ้าไม่มีข้อมูลเลย ให้คืนวันปัจจุบันไว้ 1 จุด เพื่อให้เห็นแกน XY
    if (filteredWithSales.length === 0) {
      return [{
        date: moment().format("YYYY-MM-DD"),
        revenue: 0
      }];
    }

    // ✅ จัดเรียงข้อมูลตามวัน
    return filteredWithSales.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // ✅ แปลงข้อมูลจาก API
  const uniqueRevenueDailyRaw = revenueDaily?.length
    ? Object.values(
      revenueDaily.reduce((acc, cur) => {
        const dayKey = moment(cur._id).tz("Asia/Bangkok").format("YYYY-MM-DD");
        if (!acc[dayKey]) acc[dayKey] = { date: dayKey, revenue: 0 };
        acc[dayKey].revenue += cur.total;
        return acc;
      }, {})
    ).sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  // ✅ กรองให้เหลือเฉพาะช่วงเวลาที่เลือก (7d, 1m, 3m)
  const uniqueRevenueDaily = fillMissingDates(uniqueRevenueDailyRaw, rd);



  const renderStatusTag = (status) => {
    const colors = {
      'ชำระเงินสำเร็จ': 'blue',
      'รอจัดส่ง': 'gold',
      'อยู่ระหว่างจัดส่ง': 'orange',
      'จัดส่งแล้ว': 'green',
      'ยกเลิก': 'gray',
    };
    return <Tag color={colors[status] || 'blue'}>{status}</Tag>;
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
  // ✅ กรองเฉพาะออเดอร์ของเดือนล่าสุด
  const currentMonth = moment().month();
  const currentYear = moment().year();

  // ถ้า orderStatusCount มาจาก backend เช่น [{ _id: 'รอจัดส่ง', count: 13, month: 10, year: 2025 }]
  // แต่ถ้าไม่มี month/year ใน API เราจะกรองฝั่ง frontend โดยใช้ created_at แทน (ต้องมีใน object)

  const filteredOrderStatus = orderStatusCount.filter(order => {
    // ถ้ามีข้อมูลวันที่ในแต่ละ orderStatusCount
    if (order.created_at) {
      const orderMonth = moment(order.created_at).month();
      const orderYear = moment(order.created_at).year();
      return orderMonth === currentMonth && orderYear === currentYear;
    }
    return true; // fallback (กรณีไม่มีวันที่)
  });

  // ✅ สร้าง map ใหม่จากข้อมูลที่กรองแล้ว
  const statusMap = Object.fromEntries(filteredOrderStatus.map(s => [s._id, s]));


  const sortedOrderStatus = allStatuses
    .map((status) => ({
      _id: status,
      count: statusMap[status]?.count || 0,
    }))
    .sort((a, b) => statusOrder[a._id] - statusOrder[b._id]);


  const tabItems = [
    { key: '7d', label: '7 วัน' },
    { key: '1m', label: '1 เดือน' },
    { key: '3m', label: '3 เดือน' },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx} variant="borderless" className="rounded shadow border border-gray-300">
            <div className="flex items-center space-x-4">
              <div>{stat.icon}</div>
              <Statistic
                title={<span className="text-gray-500">{stat.title}</span>}
                value={stat.value}
                valueStyle={{ color: '#004f3b', fontWeight: '700', fontSize: '1.75rem' }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Order Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        {sortedOrderStatus.map((status) => (
          <Card key={status._id} variant="borderless" className="rounded shadow border border-gray-300">
            <div className="mb-2">{renderStatusTag(status._id)}</div>
            <Statistic
              title="จำนวนออเดอร์"
              value={parseFloat(status.count).toLocaleString()}
              valueStyle={{ color: '#004f3b', fontWeight: '700', fontSize: '1.75rem' }}
            />
          </Card>
        ))}
      </div>

      <Divider />

      {/* Bar Chart รายได้รวม */}
      <div className="mb-8">
        <Card
          title={<span className="text-xl font-semibold">รายได้รวม</span>}
          className="shadow rounded border border-gray-300"
          extra={
            <Tabs
              activeKey={rd}
              onChange={setRd}
              size="small"
              className="text-sm font-medium"
              items={tabItems}
            />
          }
        >
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={uniqueRevenueDaily}
              barCategoryGap="10%"
              barGap={5}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <XAxis
                dataKey="date"
                tickFormatter={(date) => formatDateThai(date, false)}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `${value.toLocaleString()} บาท`}
                tick={{ fontSize: 14 }}
                width={100}
              />
              <Tooltip
                labelFormatter={(label) => formatDateThai(label, true)}
                formatter={(value) => `${value.toLocaleString()} บาท`}
              />
              <Bar dataKey="revenue" fill="#6366f1" barSize={60} />
            </BarChart>
          </ResponsiveContainer>

        </Card>
      </div>

      {/* Category & Product Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ✅ ยอดขายตามหมวดหมู่ */}
        <Card title={<span className="text-xl font-semibold">ยอดขายตามหมวดหมู่</span>} variant="borderless" className="shadow rounded border border-gray-300">
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

        {/* ✅ ยอดขายตามสินค้า */}
        <Card title={<span className="text-xl font-semibold">ยอดขายตามสินค้า</span>} variant="borderless" className="shadow rounded border border-gray-300">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProductsByRevenue}
                dataKey="revenue"
                nameKey="productName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {topProductsByRevenue.map((_, index) => (
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

      {/* Top Products Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title={<span className="text-xl font-semibold">รายการสินค้าขายดี (ยอดขาย)</span>} variant="borderless" className="shadow rounded border border-gray-300">
          <Table
            dataSource={topProductsByRevenue}
            columns={columnsTopProducts}
            pagination={false}
            rowKey="_id"
            className="hover:shadow-lg rounded-lg"
            rowClassName={() => 'hover:bg-indigo-50 cursor-pointer'}
          />
        </Card>

        <Card title={<span className="text-xl font-semibold">รายการสินค้าขายดี (จำนวน)</span>} variant="borderless" className="shadow rounded border border-gray-300">
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

      {/* Users Table */}
      <Card title={<span className="text-xl font-semibold">ผู้ใช้ล่าสุด</span>} variant="borderless" className="shadow rounded border border-gray-300">
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
