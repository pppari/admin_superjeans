import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Select, Form, Tag, Descriptions, Space, Divider, Input, DatePicker,
    Tabs,
    message
} from 'antd';
import axios from '../lib/axios';
import dateFormat from '../lib/dateFormat';
import dayjs from 'dayjs';
import Fuse from 'fuse.js';
import { useSearchParams } from 'react-router-dom';

const { RangePicker } = DatePicker;

const Order = () => {
    const [searchParams] = useSearchParams();
    const oid = searchParams.get('oid');
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState(oid || '');
    const [statusFilter, setStatusFilter] = useState(null);
    const [dateRange, setDateRange] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();


    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (oid) {
            setSearchText(oid);
        }
    }, [oid]);

    useEffect(() => {
        applyFilters();
    }, [orders, searchText, statusFilter, dateRange]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/orders');
            const flattened = response.data.map(order => ({
                ...order,
                fullname: order.addressId?.fullname || 'Unknown',
                email: order.userId?.email || 'N/A',
                phone: order.addressId?.phone || 'N/A',
                formattedDate: dateFormat(order.order_date),
                full_address: `${order.addressId?.address || ''} ${order.addressId?.tambon || ''} ${order.addressId?.amphure || ''} ${order.addressId?.province || ''} ${order.addressId?.zip_code || ''}`,
                rawDate: order.order_date,
            }));
            setOrders(flattened);
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: 'มีบางอย่างผิดพลาด',
            });
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...orders];

        // Status filter
        if (statusFilter) {
            result = result.filter(order => order.status === statusFilter);
        }

        // Date range filter
        if (dateRange.length === 2) {
            const [start, end] = dateRange;
            result = result.filter(order =>
                dayjs(order.rawDate).isAfter(start.startOf('day')) &&
                dayjs(order.rawDate).isBefore(end.endOf('day'))
            );
        }

        // Fuse search
        if (searchText.trim()) {
            const fuse = new Fuse(result, {
                keys: ['fullname', 'email', '_id'],
                threshold: 0.3
            });
            result = fuse.search(searchText).map(res => res.item);
        }

        setFilteredOrders(result);
    };

    const handleUpdateStatus = async () => {
        try {
            await axios.put(`/api/orders/${currentOrder._id}`, { status });
            fetchOrders();
            setIsModalVisible(false);
            messageApi.open({
                type: 'success',
                content: 'แก้ไขข้อมูลสำเร็จ',
            });
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: 'แก้ไขข้อมูลล้มเหลว',
            });

            console.error('Failed to update order status:', error);
        }
    };


    const showModal = (order) => {
        setCurrentOrder(order);
        setStatus(order.status);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const statusTag = (status) => {
        const statusMap = {
            'ชำระเงินสำเร็จ': 'blue',
            'รอจัดส่ง': 'gold',
            'อยู่ระหว่างจัดส่ง': 'orange',
            'จัดส่งแล้ว': 'green',
            'ยกเลิก': 'gray',
        };
        return <Tag color={statusMap[status]}>{status}</Tag>;
    }

    const columns = [
        {
            title: 'ลำดับ',
            key: 'index',
            render: (_text, _record, index) => filteredOrders.length - index,
        },
        {
            title: 'วันที่สั่งซื้อ',
            dataIndex: 'formattedDate',
            key: 'formattedDate',
        },
        {
            title: 'รหัสออเดอร์',
            dataIndex: '_id',
            key: '_id',
            render: (text) => <p className='text-sm text-gray-500'>{text}</p>,
        },
        {
            title: 'ชื่อ',
            dataIndex: 'fullname',
            key: 'fullname',
        },
        {
            title: 'อีเมล',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            render: statusTag,
        },
        {
            title: 'ดำเนินการ',
            key: 'action',
            render: (_, record) => (
                <Button onClick={() => showModal(record)} type="link">View</Button>
            ),
        },
    ];

    return (
        <div className="container mx-auto">
            {contextHolder}
            <h2 className="text-2xl font-semibold mb-4">จัดการออเดอร์</h2>

            <Space className="mb-4" wrap>
                <Input.Search
                    allowClear
                    placeholder="ค้นหาชื่อ อีเมล หรือรหัสออเดอร์"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 250 }}
                />
                <Select
                    allowClear
                    placeholder="กรองตามสถานะ"
                    onChange={value => setStatusFilter(value)}
                    style={{ width: 180 }}
                >
                    <Select.Option value="ชำระเงินสำเร็จ">ชำระเงินสำเร็จ</Select.Option>
                    <Select.Option value="รอจัดส่ง">รอจัดส่ง</Select.Option>
                    <Select.Option value="อยู่ระหว่างจัดส่ง">อยู่ระหว่างจัดส่ง</Select.Option>
                    <Select.Option value="จัดส่งแล้ว">จัดส่งแล้ว</Select.Option>
                    <Select.Option value="ยกเลิก">ยกเลิก</Select.Option>
                </Select>
                <RangePicker
                    value={dateRange}
                    onChange={dates => setDateRange(dates || [])}
                />
            </Space>

            <Table
                columns={columns}
                dataSource={filteredOrders}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="รายละเอียดออเดอร์"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={700}
            >
                {currentOrder && (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Tabs defaultActiveKey="1">
                            <Tabs.TabPane tab="รายละเอียดออเดอร์" key="1">
                                <Descriptions bordered column={1} size="small">
                                    <Descriptions.Item label="Order ID">{currentOrder._id}</Descriptions.Item>
                                    <Descriptions.Item label="วันที่สั่งซื้อ">{currentOrder.formattedDate}</Descriptions.Item>
                                    <Descriptions.Item label="ชื่อผู้รับ">{currentOrder.fullname}</Descriptions.Item>
                                    <Descriptions.Item label="เบอร์โทร">{currentOrder.phone}</Descriptions.Item>
                                    <Descriptions.Item label="อีเมล">{currentOrder.email}</Descriptions.Item>
                                    <Descriptions.Item label="ที่อยู่จัดส่ง">{currentOrder.full_address || '-'}</Descriptions.Item>
                                </Descriptions>
                            </Tabs.TabPane>

                            <Tabs.TabPane tab="รายการสินค้า" key="2">
                                <Table
                                    dataSource={currentOrder.items}
                                    rowKey="_id"
                                    pagination={false}
                                    columns={[
                                        {
                                            title: 'สินค้า',
                                            dataIndex: ['productId', 'name'],
                                            key: 'name',
                                        },
                                        {
                                            title: 'สี',
                                            dataIndex: ['productColorId', 'name'],
                                            key: 'color',
                                        },
                                        {
                                            title: 'ราคา/ชิ้น',
                                            dataIndex: 'price',
                                            key: 'price',
                                            render: (price) => `฿${price.toLocaleString()}`,
                                        },
                                        {
                                            title: 'จำนวน',
                                            dataIndex: 'quantity',
                                            key: 'quantity',
                                        },
                                        {
                                            title: 'ราคารวม',
                                            dataIndex: 'total',
                                            key: 'total',
                                            render: (total) => `฿${total.toLocaleString()}`,
                                        },
                                    ]}
                                    summary={(data) => {
                                        const total = data.reduce((sum, item) => sum + item.total, 0);
                                        return (
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0} colSpan={4}>รวมทั้งหมด</Table.Summary.Cell>
                                                <Table.Summary.Cell index={1}>
                                                    ฿{total.toLocaleString()}
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        );
                                    }}
                                />
                            </Tabs.TabPane>

                            <Tabs.TabPane tab="รายละเอียดการชำระเงิน" key="3">
                                <Descriptions bordered column={1} size="small">
                                    <Descriptions.Item label="วิธีการชำระเงิน">
                                        {currentOrder.payment_method === 'promptpay' ? 'พร้อมเพย์' : 'บัตรเครดิต'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="ราคารวมสินค้า">
                                        ฿{(currentOrder.amount - currentOrder.payment_fee + (currentOrder.discount_amount || 0)).toLocaleString()}
                                    </Descriptions.Item>
                                    {currentOrder.isDiscount && (
                                        <Descriptions.Item label="ส่วนลด">-฿{currentOrder.discount_amount.toLocaleString()}</Descriptions.Item>
                                    )}
                                    <Descriptions.Item label="ค่าธรรมเนียม">฿{currentOrder.payment_fee.toLocaleString()}</Descriptions.Item>
                                    <Descriptions.Item label="ยอดชำระทั้งหมด">฿{currentOrder.amount.toLocaleString()}</Descriptions.Item>
                                </Descriptions>
                            </Tabs.TabPane>
                        </Tabs>

                        <Divider orientation="left">อัปเดตสถานะ</Divider>

                        <Form layout="inline" onFinish={handleUpdateStatus}>
                            <Form.Item>
                                <Select value={status} onChange={setStatus} style={{ minWidth: 200 }}>
                                    <Select.Option value="รอจัดส่ง">รอจัดส่ง</Select.Option>
                                    <Select.Option value="อยู่ระหว่างจัดส่ง">อยู่ระหว่างจัดส่ง</Select.Option>
                                    <Select.Option value="จัดส่งแล้ว">จัดส่งแล้ว</Select.Option>
                                    <Select.Option value="ยกเลิก">ยกเลิก</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">อัปเดตสถานะ</Button>
                            </Form.Item>
                        </Form>
                    </Space>
                )}
            </Modal>
        </div>
    );
};

export default Order;
