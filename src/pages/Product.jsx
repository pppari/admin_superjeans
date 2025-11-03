// src/pages/ProductBatchForm.jsx
import { Button, Form, Input, Select, InputNumber, Space, Divider, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../lib/axios';

const { Option } = Select;

const ProductBatchForm = ({ initialValues = {} }) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [productColors, setProductColors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();

  // =========================
  // Helpers
  // =========================
  const toId = (v) => (typeof v === 'object' && v?._id ? v._id : v);
  const safeNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // =========================
  // Fetch functions
  // =========================
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get('/api/products');
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
      messageApi.error('โหลดรายการสินค้าไม่สำเร็จ');
    }
  }, [messageApi]);

  const fetchCategory = useCallback(async () => {
    try {
      const res = await axios.get('/api/categories');
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setCategory(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategory([]);
      // ไม่จำเป็นต้อง error เสมอไป
    }
  }, []);

  const fetchProductColors = useCallback(
    async (productId) => {
      const pid = toId(productId);
      if (!pid) return;
      // ใช้ cache ป้องกัน call ซ้ำ
      if (productColors[pid]) return;

      try {
        const res = await axios.get(`/api/productColor/${pid}`);
        const data = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setProductColors((prev) => ({ ...prev, [pid]: data }));
      } catch (err) {
        console.error('Failed to fetch product colors:', err);
        setProductColors((prev) => ({ ...prev, [pid]: [] }));
      }
    },
    [productColors]
  );

  const fetchBatchDetails = useCallback(async () => {
    if (!id || id === 'create') return;
    setIsEdit(true);
    try {
      const res = await axios.get(`/api/product-batches/${id}`);
      // สมมติ backend ส่งมาเป็น { ...batch, products: [...] }
      const batch = res.data?.data || res.data;

      const normalizedProducts = Array.isArray(batch?.products)
        ? batch.products.map((p) => ({
            productId: toId(p.productId),
            quantity: safeNumber(p.quantity, 1),
            colorId: p.colorId ? toId(p.colorId) : undefined,
          }))
        : [];

      form.setFieldsValue({
        ...batch,
        products: normalizedProducts,
      });

      // เตรียมสีสำหรับสินค้าที่มีอยู่ในล็อต
      for (const item of normalizedProducts) {
        await fetchProductColors(item.productId);
      }
    } catch (err) {
      console.error('Failed to fetch batch details:', err);
      messageApi.error('โหลดข้อมูลล็อตไม่สำเร็จ');
    }
  }, [form, id, fetchProductColors, messageApi]);

  useEffect(() => {
    fetchProducts();
    fetchBatchDetails();
    fetchCategory();
  }, [id, fetchProducts, fetchBatchDetails, fetchCategory]);

  // =========================
  // Submit
  // =========================
  const handleSubmit = async (values) => {
    // ตรวจอย่างน้อย 1 รายการ
    if (!Array.isArray(values.products) || values.products.length === 0) {
      messageApi.error('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const cleaned = values.products.map((p, idx) => {
      const productId = toId(p.productId);
      const colorId = p.colorId ? toId(p.colorId) : undefined;
      const quantity = safeNumber(p.quantity, 0);

      if (!productId) {
        throw new Error(`แถวที่ ${idx + 1}: กรุณาเลือกสินค้า`);
      }
      if (!colorId) {
        throw new Error(`แถวที่ ${idx + 1}: กรุณาเลือกสีสินค้า`);
      }
      if (!quantity || quantity < 1) {
        throw new Error(`แถวที่ ${idx + 1}: จำนวนต้องมากกว่าหรือเท่ากับ 1`);
      }

      return { productId, colorId, quantity };
    });

    const payload = {
      ...values,
      // ถ้าแก้ไข ให้คง batchCode เดิมไว้ (ถ้ามีใน form) ไม่ก็ไม่ส่ง
      ...(isEdit
        ? {}
        : { batchCode: `BATCH-${Date.now()}` }),
      products: cleaned,
      totalProducts: cleaned.length,
      totalQuantity: cleaned.reduce((sum, p) => sum + safeNumber(p.quantity, 0), 0),
    };

    // debug
    console.log('Payload to send:', payload);

    try {
      if (isEdit) {
        await axios.put(`/api/product-batches/${id}`, payload);
        messageApi.success('แก้ไขล็อตสำเร็จ');
      } else {
        await axios.post('/api/product-batches', payload);
        messageApi.success('สร้างล็อตสำเร็จ');
      }
      navigate('/batch');
    } catch (err) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.response?.data?.details ||
        err.message;
      console.error('Form submission failed:', err?.response?.data || err);
      messageApi.error(`มีบางอย่างผิดพลาด: ${serverMsg}`);
    }
  };

  // =========================
  // Product item component
  // =========================
  const ProductFormItem = ({ field, remove }) => {
    const selectedProductId = Form.useWatch(['products', field.name, 'productId'], { form });
    const selectedId = toId(selectedProductId);
    const colorsForProduct = useMemo(
      () => (Array.isArray(productColors[selectedId]) ? productColors[selectedId] : []),
      [productColors, selectedId]
    );

    return (
      <Space key={field.key} align="baseline" className="mb-2" wrap>
        <Form.Item
          name={[field.name, 'productId']}
          fieldKey={[field.fieldKey, 'productId']}
          rules={[{ required: true, message: 'Please select a product' }]}
        >
          <Select
            showSearch
            placeholder="เลือกสินค้า"
            style={{ width: 280 }}
            optionFilterProp="label"
            filterOption={(input, option) => (option?.label || '').toLowerCase().includes(input.toLowerCase())}
            onChange={(value) => {
              // reset color เมื่อเปลี่ยนสินค้า
              form.setFieldValue(['products', field.name, 'colorId'], undefined);
              fetchProductColors(value);
            }}
            options={products.map((product) => ({
              value: product._id,
              label: `${product.sku ?? ''} / ${product.name ?? ''}`.trim(),
            }))}
          />
        </Form.Item>

        <Form.Item
          name={[field.name, 'colorId']}
          fieldKey={[field.fieldKey, 'colorId']}
          rules={[{ required: true, message: 'Please select a color' }]}
        >
          <Select
            placeholder="เลือกสีสินค้า"
            disabled={colorsForProduct.length === 0}
            style={{ width: 220 }}
          >
            {colorsForProduct.map((color) => (
              <Option key={color._id} value={color._id}>
                {color.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name={[field.name, 'quantity']}
          fieldKey={[field.fieldKey, 'quantity']}
          rules={[{ required: true, message: 'Please enter quantity' }]}
          initialValue={1}
        >
          <InputNumber min={1} placeholder="จำนวน" disabled={colorsForProduct.length === 0} />
        </Form.Item>

        {!isEdit && (
          <MinusCircleOutlined
            onClick={() => remove(field.name)}
            style={{ color: '#ff4d4f' }}
          />
        )}
      </Space>
    );
  };

  // =========================
  // Auto-update batchName safely
  // =========================
  const productsInForm = Form.useWatch('products', form) || [];

  useEffect(() => {
    const selectedNames = productsInForm
      .filter((p) => p && p.productId)
      .map((p) => {
        const pid = toId(p.productId);
        const found = products.find((prod) => prod._id === pid);
        return found?.name;
      })
      .filter(Boolean);
    form.setFieldValue('batchName', selectedNames.join(', '));
  }, [productsInForm, products, form]);

  // ถ้าเป็นหน้า create ให้มี 1 แถวว่างตอนเริ่ม (ครั้งเดียว)
  useEffect(() => {
    if (!isEdit) {
      const current = form.getFieldValue('products');
      if (!Array.isArray(current) || current.length === 0) {
        form.setFieldsValue({ products: [{}] });
      }
    }
    // ทำครั้งเดียวหลัง mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  // =========================
  // Render
  // =========================
  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit}>
      {contextHolder}

      <Form.Item name="batchName" label="ชื่อล็อตสินค้า">
        <Input placeholder="จะถูกตั้งชื่ออัตโนมัติจากสินค้า" readOnly />
      </Form.Item>

      <Form.Item name="tags" label="แท็ก">
        <Select mode="tags" style={{ width: '100%' }} placeholder="ป้อนแท็ก">
          {category.map((item) => (
            <Option key={item._id} value={item.name}>
              {item.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Divider>สินค้า</Divider>

      <Form.List name="products">
        {(fields, { add, remove }) => (
          <div className="flex flex-col gap-2">
            {fields.map((field) => (
              <ProductFormItem key={field.key} field={field} remove={remove} />
            ))}

            {!isEdit && (
              <Form.Item>
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  เพิ่มสินค้า
                </Button>
              </Form.Item>
            )}
          </div>
        )}
      </Form.List>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {isEdit ? 'แก้ไขล็อตสินค้า' : 'สร้างล็อตสินค้า'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductBatchForm;
