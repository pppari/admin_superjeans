<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Descriptions,
  Divider,
  Table,
  Typography,
  Spin,
} from "antd";
import axios from "../lib/axios";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import toPrice from "../lib/toPrice";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";

const { Title, Text } = Typography;

const BatchDetailsPrint = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  useEffect(() => {
    const fetchBatch = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`/api/product-batches/${id}`);
        setBatch(res.data);
      } catch (err) {
        console.error("Failed to fetch batch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, [id]);

  const handleDownloadPDF = () => {
    if (!printRef.current || !batch) return;
    const opt = {
      margin: 0.5,
      filename: `batch_${batch.batchCode}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(printRef.current).set(opt).save();
  };

  const handleReactPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `batch_${batch?.batchCode}`,
  });

  const productData =
    batch?.products?.map((entry, index) => ({
      key: entry._id,
      no: index + 1,
      name: entry.productId?.name,
      sku: entry.productId?.sku,
      quantity: entry.quantity,
      price: entry.productId?.price,
      material: entry.productId?.material,
      color: entry.colorId?.name,
    })) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!batch) {
    return <Text type="danger">ไม่พบล็อตสินค้า.</Text>;
  }

  return (
    <div className="p-8 bg-white text-black max-w-4xl mx-auto">
      <div className="flex justify-end items-center gap-4 mb-4">
        <Button onClick={handleReactPrint}>พิมพ์</Button>
        <Button onClick={handleDownloadPDF} type="primary">
          ดาวน์โหลด
        </Button>
      </div>

      <div ref={printRef} className="print-content">
        <Title level={2}>สรุปล็อตสินค้า</Title>
        <Divider />

        <Descriptions column={2} bordered size="middle">
          <Descriptions.Item label="ชื่อล็อต">{batch.batchName}</Descriptions.Item>
          <Descriptions.Item label="รหัสล็อต">{batch.batchCode}</Descriptions.Item>
          <Descriptions.Item label="สินค้าทั้งหมด">{parseFloat(batch.totalProducts).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="จำนวนทั้งหมด">{parseFloat(batch.totalQuantity).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="แท็ก">{(batch.tags || []).join(", ") || "-"}</Descriptions.Item>
          <Descriptions.Item label="หมายเหตุ">{batch.notes || "-"}</Descriptions.Item>
          <Descriptions.Item label="สร้างขึ้นเมื่อ">{dayjs(batch.createdAt).format("DD/MM/YYYY - HH:mm")}</Descriptions.Item>
          <Descriptions.Item label="อัปเดตล่าสุด">{dayjs(batch.updatedAt).format("DD/MM/YYYY - HH:mm")}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">
          <span className="font-semibold">รายการสินค้า</span>
        </Divider>

        <Table
          dataSource={productData}
          pagination={false}
          size="small"
          bordered
          columns={[
            { title: "No", dataIndex: "no", width: 60 },
            { title: "ชื่อสินค้า", dataIndex: "name" },
            { title: "รหัสสินค้า", dataIndex: "sku" },
            { title: "สี", dataIndex: "color" },
            {
              title: "จำนวน",
              dataIndex: "quantity",
              align: "right",
              render: (text) => <span>{parseFloat(text).toLocaleString()}</span>,
            },
            {
              title: "ราคา",
              dataIndex: "price",
              align: "right",
              render: (text) => <span>{toPrice(text)}</span>,
            },
            { title: "วัสดุ", dataIndex: "material" },
          ]}
          scroll={{ x: true }}
        />

        <Divider />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Printed on: {dayjs().format("DD/MM/YYYY - HH:mm")}
        </Text>
      </div>
    </div>
  );
};

export default BatchDetailsPrint;
=======
import {
    Button,
    Descriptions,
    Divider,
    Table,
    Typography,
    Spin,
    Space,
  } from "antd";
  import axios from "../lib/axios";
  import dayjs from "dayjs";
  import { useEffect, useRef, useState } from "react";
  import { useParams } from "react-router-dom";
  import toPrice from "../lib/toPrice";
  import html2pdf from "html2pdf.js";
  import { useReactToPrint } from "react-to-print";
  
  const { Title, Text } = Typography;
  
  const BatchDetailsPrint = () => {
    const { id } = useParams();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
  
    // Use ref for the content you want to print
    const printRef = useRef(null);
  
    useEffect(() => {
      const fetchBatch = async () => {
        if (!id) return;
        try {
          const res = await axios.get(`/api/product-batches/${id}`);
          setBatch(res.data);
        } catch (err) {
          console.error("Failed to fetch batch:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchBatch();
    }, [id]);
  
    const handleDownloadPDF = () => {
      if (!printRef.current || !batch) return;
  
      const opt = {
        margin: 0.5,
        filename: `batch_${batch.batchCode}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };
  
      html2pdf().from(printRef.current).set(opt).save();
    };
  
    const handleReactPrint = useReactToPrint({
      contentRef: printRef, // Pass the ref correctly
      documentTitle: `batch_${batch?.batchCode}`,
    });
  
    const productData =
      batch?.products?.map((entry, index) => ({
        key: entry._id,
        no: index + 1,
        name: entry.productId?.name,
        sku: entry.productId?.sku,
        quantity: entry.quantity,
        price: entry.productId?.price,
        material: entry.productId?.material,
        color: entry.colorId?.name,
      })) || [];
  
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" />
        </div>
      );
    }
  
    if (!batch) {
      return <Text type="danger">No batch found.</Text>;
    }
  
    return (
      <div className="p-8 bg-white text-black max-w-4xl mx-auto">
        <div className="flex justify-end items-center gap-4 mb-4">
          <Button onClick={handleReactPrint}>Print</Button>
          <Button onClick={handleDownloadPDF} type="primary">
            Download
          </Button>
        </div>
  
        {/* Content to print */}
        <div ref={printRef} className="print-content">
          <Title level={2}>สรุปล็อตสินค้า</Title>
          <Divider />
  
          <Descriptions column={2} bordered size="middle">
            <Descriptions.Item label="Batch Name">
              {batch.batchName}
            </Descriptions.Item>
            <Descriptions.Item label="Batch Code">
              {batch.batchCode}
            </Descriptions.Item>
            <Descriptions.Item label="Total Products">
              {parseFloat(batch.totalProducts).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Total Quantity">
              {parseFloat(batch.totalQuantity).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Tags">
              {(batch.tags || []).join(", ") || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Notes">
              {batch.notes || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {dayjs(batch.createdAt).format("DD/MM/YYYY - HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {dayjs(batch.updatedAt).format("DD/MM/YYYY - HH:mm")}
            </Descriptions.Item>
          </Descriptions>
  
          <Divider orientation="left"><span className="font-semibold">รายการสินค้า</span></Divider>
  
          <Table
            dataSource={productData}
            pagination={false}
            size="small"
            bordered
            columns={[
              { title: "No.", dataIndex: "no", width: 60 },
              { title: "Product Name", dataIndex: "name" },
              { title: "SKU", dataIndex: "sku" },
                { title: "Color", dataIndex: "color" },
              {
                title: "Quantity",
                dataIndex: "quantity",
                align: "right",
                render: (text) => (
                  <span>{parseFloat(text).toLocaleString()}</span>
                ),
              },
              {
                title: "Price",
                dataIndex: "price",
                align: "right",
                render: (text) => <span>{toPrice(text)}</span>,
              },
              { title: "Material", dataIndex: "material" },
            ]}
            scroll={{ x: true }}
          />
  
          <Divider />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Printed on: {dayjs().format("DD/MM/YYYY - HH:mm")}
          </Text>
        </div>
      </div>
    );
  };
  
  export default BatchDetailsPrint;
  
>>>>>>> f8c3aaf75f8b3095f106d3021b6916ea2b5c9b43
