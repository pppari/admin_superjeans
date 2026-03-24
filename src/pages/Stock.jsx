import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { Table, Input, Select, message, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dateFormat from '../lib/dateFormat';
import Fuse from 'fuse.js';

const { Option } = Select;

const StockTransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [messageApi, contextHolder] = message.useMessage();


  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/stock');
      const data = Array.isArray(res.data.data) ? res.data.data : res.data.data || [];
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fuse = new Fuse(transactions, {
    keys: ['transaction_type', 'batchCode'],
    threshold: 0.3,
  });

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    applyFilters(value, transactionTypeFilter);
  };

  const handleTransactionTypeChange = (value) => {
    setTransactionTypeFilter(value);
    applyFilters(searchText, value);
  };

  const applyFilters = (search, type) => {
    let results = transactions;

    if (search) {
      results = fuse.search(search).map(result => result.item);
    }

    if (type) {
      results = results.filter(t => t.transaction_type === type);
    }

    setFilteredTransactions(results);
    setPagination({ ...pagination, current: 1 });
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (text) => {
        if (text === 'นำเข้า') {
          return <Tag color="green">นำเข้า</Tag>;
        }
        return <Tag color="red">ขายออก</Tag>;
      }
    },
    {
      title: 'ชื่อสินค้า',
      dataIndex: ['productId', 'name'],
      key: 'name',
    },
    {
      title: 'Date',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date) => dateFormat(date),
    },
    {
      title: 'Stock Change',
      dataIndex: 'stock_change',
      key: 'stock_change',
    }
  ];

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  return (
    <div className="p-4">
      {contextHolder}

      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <h1 className="text-2xl font-semibold">รายงานคลังสินค้า</h1>
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search by type or batch code"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            className="w-64"
          />
          <Select
            placeholder="Filter by transaction type"
            allowClear
            value={transactionTypeFilter || undefined}
            onChange={handleTransactionTypeChange}
            className="w-60"
          >
            <Option value="นำเข้า">นำเข้า</Option>
            <Option value="ขายออก">ขายออก</Option>
          </Select>
        </div>
      </div>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredTransactions}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        className="shadow rounded-xl"
      />
    </div>
  );
};

export default StockTransactionPage;
