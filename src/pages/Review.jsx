import React, { useEffect, useState } from "react";
import axios from "../lib/axios";
import {
  Card,
  Input,
  Modal,
  Typography,
  Space,
  message,
  Rate,
  Row,
  Col,
  Skeleton,
  Divider,
  Progress,
  List,
  Button,
  Popconfirm,
} from "antd";
import dateFormat from "../lib/dateFormat";

const { Title, Text } = Typography;

// ฟังก์ชันคำนวณค่าเฉลี่ยและจำนวนรีวิวแต่ละดาว
const getSummary = (reviews) => {
  const total = reviews.length;
  const summary = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumScore = 0;

  reviews.forEach((r) => {
    summary[r.score] = (summary[r.score] || 0) + 1;
    sumScore += r.score;
  });

  return {
    total,
    average: total > 0 ? (sumScore / total).toFixed(1) : 0,
    summary,
  };
};

// คอมโพเนนต์สรุปรีวิว (กราฟ + ค่าเฉลี่ย)
const RatingSummary = ({ reviews }) => {
  const { total, average, summary } = getSummary(reviews);

  return (
    <Card style={{ marginBottom: 24, borderRadius: 12 }}>
      <Row gutter={24} align="middle">
        <Col span={6} style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 48, margin: 0 }}>{average}</h1>
          <Rate disabled allowHalf defaultValue={Number(average)} />
          <p>{total} เรตติ้ง</p>
        </Col>

        <Col span={18}>
          {Object.keys(summary)
            .sort((a, b) => b - a)
            .map((star) => (
              <Row key={star} align="middle" style={{ marginBottom: 8 }}>
                <Col span={2}>{star}★</Col>
                <Col span={18}>
                  <Progress
                    percent={total > 0 ? (summary[star] / total) * 100 : 0}
                    showInfo={false}
                    strokeColor="#fadb14"
                  />
                </Col>
                <Col span={4} style={{ textAlign: "right" }}>
                  {summary[star]}
                </Col>
              </Row>
            ))}
        </Col>
      </Row>
    </Card>
  );
};

// หน้า Review หลัก
const ReviewPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // โหลดรีวิวจาก API
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/review");
      console.log(response.data?.data);
      setReviews(response.data?.data || []);
    } catch (error) {
      console.error(error);
      messageApi.error("มีบางอย่างผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // ลบรีวิว
  const deleteReview = async (id) => {
    try {
      await axios.delete(`/api/review/${id}`);
      messageApi.success("ลบรีวิวสำเร็จ");
      fetchReviews();
    } catch (error) {
      console.error(error);
      messageApi.error("ลบรีวิวไม่สำเร็จ");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ✅ ฟิลเตอร์ตามชื่อสินค้า
  // ✅ ฟิลเตอร์ตามชื่อสินค้า (รองรับทั้ง productId และ productColorId)
  const filteredReviews = reviews.filter((review) => {
    const productName =
      review.productId?.name ||
      review.productColorId?.productId?.name ||
      review.productName ||
      "ไม่ทราบชื่อสินค้า";
    return productName.toLowerCase().includes(search.toLowerCase());
  });

  // ✅ จัดกลุ่มรีวิวตามสินค้า (รองรับทั้ง productId และ productColorId)
  const groupedReviews = filteredReviews.reduce((acc, review) => {
    const productName =
      review.productId?.name ||
      review.productColorId?.productId?.name ||
      review.productName ||
      "ไม่ทราบชื่อสินค้า";
    if (!acc[productName]) acc[productName] = [];
    acc[productName].push(review);
    return acc;
  }, {});


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

      {/* แสดงสรุปรีวิวรวม */}
      {filteredReviews.length > 0 && <RatingSummary reviews={filteredReviews} />}

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : filteredReviews.length === 0 ? (
        <Text type="secondary">ไม่พบรีวิวที่ตรงกับคำค้นหา</Text>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {Object.keys(groupedReviews).map((productName) => (
            <Card key={productName} title={productName} variant="borderless">
              <List
                dataSource={groupedReviews[productName]}
                renderItem={(review) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        onClick={() => {
                          setSelectedReview(review);
                          setIsModalVisible(true);
                        }}
                      >
                        ดูรายละเอียด
                      </Button>,
                      <Popconfirm
                        title="คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?"
                        okText="ใช่"
                        cancelText="ยกเลิก"
                        onConfirm={() => deleteReview(review._id)}
                      >
                        <Button danger type="link">
                          ลบรีวิว
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <>
                          <Rate disabled defaultValue={review.score} />{" "}
                          <Text type="secondary">
                            {dateFormat(review.created_at || review.createdAt)}
                          </Text>
                        </>
                      }
                      description={
                        <>
                          <p>{review.message || "ไม่มีความคิดเห็น"}</p>
                          <Text type="secondary">
                            {review.userId?.name ||
                              review.userId?.email ||
                              "ไม่ทราบชื่อ"}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </Space>
      )}

      {/* Modal สำหรับดูรายละเอียดรีวิว */}
      <Modal
        title={<span style={{ fontSize: 24 }}>📝 รายละเอียดรีวิว</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "auto",
            padding: "24px",
            fontSize: 18,
          },
        }}
      >
        {selectedReview && (
          <div>
            <p>
              <b>สินค้า:</b>{" "}
              {typeof selectedReview.productId === "object"
                ? selectedReview.productId?.name
                : selectedReview.productName || "ไม่ทราบชื่อสินค้า"}
            </p>
            <p>
              <b>ลูกค้า:</b>{" "}
              {selectedReview.userId?.name ||
                selectedReview.userId?.email ||
                "ไม่ทราบชื่อ"}
            </p>
            <p>
              <b>คะแนน:</b>{" "}
              <Rate disabled defaultValue={selectedReview.score} />
            </p>
            <p>
              <b>ความคิดเห็น:</b> {selectedReview.message || "ไม่มีความคิดเห็น"}
            </p>
            <p>
              <b>วันที่รีวิว:</b>{" "}
              {dateFormat(selectedReview.created_at || selectedReview.createdAt)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewPage;
