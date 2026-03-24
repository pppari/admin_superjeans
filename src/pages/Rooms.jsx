import React, { useEffect, useState } from 'react';
import {
  Button,
  message,
  Modal,
  Form,
  Input,
  Table,
  Upload,
  Image,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { FaPlus } from 'react-icons/fa';
import axios from '../lib/axios';
import { roomImg } from '../lib/imagePath';
import dateFormat from '../lib/dateFormat';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();


  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/rooms');
      setRooms(data);
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    console.log(imageFile)
    formData.append('name', values.name);
    if (imageFile) {
      formData.append('image', imageFile); // <-- ensure 'image' matches backend expectations
    }

    setUploadLoading(true);

    try {
      if (isEditing && currentRoom) {
        await axios.put(`/api/rooms/${currentRoom._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        messageApi.open({
          type: 'success',
          content: 'แก้ไขห้องสำเร็จ',
        });

      } else {
        await axios.post('/api/rooms', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        messageApi.open({
          type: 'success',
          content: 'สร้างห้องสำเร็จ',
        });

      }
      loadRooms();
      closeModal();
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
      console.error(error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEdit = (room) => {
    form.setFieldsValue({ name: room.name });
    setCurrentRoom(room);
    setIsEditing(true);
    setImageFile(null);
    // If the room has an image, set the preview to show the current image
    if (room.fileName) {
      setImagePreview(roomImg(room.fileName));
    } else {
      setImagePreview(null);
    }
    setModalVisible(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await axios.delete(`/api/rooms/${deleteTargetId}`);
      messageApi.open({
        type: 'success',
        content: 'ลบห้องสำเร็จ',
      });

      loadRooms();
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'ลบห้องล้มเหลว',
      });

      console.error('Error deleting room:', error);
    } finally {
      setDeleteConfirmVisible(false);
      setDeleteTargetId(null);
    }
  };

  const openCreateModal = () => {
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setCurrentRoom(null);
    setIsEditing(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    form.resetFields();
    setModalVisible(false);
    setCurrentRoom(null);
    setImageFile(null);
    setImagePreview(null);
  };

  // Improved file function to validate and set the image file and preview
  const handleImageChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('โปรดอัปโหลดไฟล์รูปภาพเท่านั้น!');
      return;
    }

    if (file.size / 1024 / 1024 >= 5) {
      message.error('รูปภาพต้องมีขนาดไม่เกิน 5MB!');
      return;
    }
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const columns = [
    {
      title: 'ชื่อห้อง',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'รูปภาพ',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (fileName) =>
        fileName ? (
          <Image
            src={roomImg(fileName)}
            alt="Room image"
            width={50}
            height={50}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          'ไม่มีรูปภาพ'
        ),
    },
    {
      title: 'สร้างเมื่อ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => dateFormat(text),
    },
    {
      title: 'อัปเดตล่าสุด',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => dateFormat(text),
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            แก้ไข
          </Button>
          <Button
            danger
            onClick={() => {
              setDeleteTargetId(record._id);
              setDeleteConfirmVisible(true);
            }}
          >
            ลบ
          </Button>
        </>
      ),
    },
  ];

  const filteredRooms = rooms.filter((room) =>
    room.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      {contextHolder}

      <h2 className="text-2xl font-semibold mb-4">จัดการประเภทห้อง</h2>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="ค้นหาชื่อห้อง"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<FaPlus />} onClick={openCreateModal}>
          เพิ่มห้อง
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredRooms}
        rowKey="_id"
        loading={loading}
      />

      {/* Create / Edit Modal */}
      <Modal
        title={isEditing ? 'แก้ไขห้อง' : 'เพิ่มห้อง'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="ชื่อห้อง"
            rules={[{ required: true, message: 'กรุณากรอกชื่อห้อง' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="รูปภาพห้อง">
            {imagePreview && (
              <div className="mb-2">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                />
                <Button
                  danger
                  size="small"
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  ลบรูปภาพ
                </Button>
              </div>
            )}
            <Upload
              name="image"
              showUploadList={false}
              customRequest={({ file, onSuccess, onError }) => {
                try {
                  handleImageChange(file);
                  onSuccess("ok");
                } catch (err) {
                  onError(err);
                }
              }}
            >
              <Button icon={<UploadOutlined />}>อัปโหลดรูปภาพ</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#888' }}>รองรับไฟล์ภาพขนาดไม่เกิน 5MB</div>
          </Form.Item>


          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={uploadLoading}
              disabled={uploadLoading}
            >
              {isEditing ? 'อัปเดต' : 'สร้าง'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="ยืนยันการลบ"
        open={deleteConfirmVisible}
        onCancel={() => setDeleteConfirmVisible(false)}
        onOk={handleDelete}
        okText="ลบ"
        okButtonProps={{ danger: true }}
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?</p>
      </Modal>
    </div>
  );
};

export default Rooms;
