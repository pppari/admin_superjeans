import React, { useEffect, useState } from "react";
import axios from "../lib/axios";
import {
  Card,
  Descriptions,
  Button,
  Input,
  Modal,
  Typography,
  Space,
  Popconfirm,
  message ,
  Rate,
  Row,
  Col,
  Skeleton,
  Divider,
  Tag,
} from "antd";
import { FaStar } from "react-icons/fa";
import dateFormat from "../lib/dateFormat";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();




  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/review");
      setReviews(response.data?.data || []);
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    } finally {
      setLoading(false);
    }
  };

  const softDeleteReview = async (id) => {
    try {
      await axios.delete(`/api/review/${id}`, { isDeleted: true });
      messageApi.open({
        type: 'success',
        content: 'ลบข้อมูลสำเร็จ',
      });


      fetchReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) =>
    review.productId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {contextHolder}

      <Title level={3}>จัดการรีวิวจากลูกค้า</Title>

      <Input.Search
        placeholder="ค้นหาชื่อสินค้า..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 400, marginBottom: 24 }}
        allowClear
        size="large"
      />

      <Divider />

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : filteredReviews.length === 0 ? (
        <Text type="secondary">ไม่พบรีวิวที่ตรงกับคำค้นหา</Text>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {filteredReviews.map((review) => (
            <Card
              key={review._id}
              hoverable
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 16 }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong style={{ fontSize: 16 }}>
                    {review.productId?.name || "ไม่ทราบชื่อสินค้า"}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dateFormat(review.created_at)} |{" "}
                      {review.userId?.email || "ไม่ทราบอีเมล"}
                    </Text>
                  </div>
                </Col>

                <Col>
                  <Tag color="gold" icon={<FaStar />}>
                    {review.score}
                  </Tag>
                </Col>
              </Row>

              <Paragraph
                style={{
                  marginTop: 16,
                  background: "#fafafa",
                  padding: "12px",
                  borderRadius: 6,
                }}
              >
                {review.message}
              </Paragraph>

              <Row justify="end" gutter={8}>
                <Col>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedReview(review);
                      setIsModalVisible(true);
                    }}
                  >
                    ดูรายละเอียด
                  </Button>
                </Col>
                <Col>
                  <Popconfirm
                    title="คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?"
                    onConfirm={() => softDeleteReview(review._id)}
                    okText="ใช่"
                    cancelText="ยกเลิก"
                    disabled={review.isDeleted}
                  >
                    <Button
                      type="primary"
                      danger
                      size="small"
                      disabled={review.isDeleted}
                    >
                      {review.isDeleted ? "ลบแล้ว" : "ลบรีวิว"}
                    </Button>
                  </Popconfirm>
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      )}

      {/* Review Detail Modal */}
      <Modal
        title="📝 รายละเอียดรีวิว"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedReview && (
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ fontWeight: 500, width: "140px" }}
          >
            <Descriptions.Item label="Order ID">
              {selectedReview.orderId}
            </Descriptions.Item>

            <Descriptions.Item label="สินค้า">
              {selectedReview.productId?.name || "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {selectedReview.userId?.email || "—"}
            </Descriptions.Item>

            <Descriptions.Item label="คะแนน">
              <Rate disabled defaultValue={selectedReview.score} />
              <span style={{ marginLeft: 8 }}>({selectedReview.score})</span>
            </Descriptions.Item>

            <Descriptions.Item label="ข้อความรีวิว">
              <TextArea
                value={selectedReview.message}
                readOnly
                autoSize={{ minRows: 4 }}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ReviewPage;
