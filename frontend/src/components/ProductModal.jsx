import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Upload, message } from "antd";
import { useProducts } from "../context/Product";

const normFile = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList || [];
};

const ProductModal = ({
  open,
  onClose,
  onSuccess,
  mode = "create",
  product = null,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const { addProduct, editProduct } = useProducts();

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
      return;
    }
    if (mode === "edit" && product) {
      form.setFieldsValue({ ...product, image: [] });
      setFileList([]);
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [product, mode, form, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === "image") {
          const file = value?.[0]?.originFileObj;
          if (file) {
            formData.append("image", file);
          }
          return;
        }
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      if (mode === "create") {
        await addProduct(formData);
      } else {
        await editProduct(product._id, formData);
      }
      onSuccess?.();
      onClose();
      form.resetFields();
    } catch (error) {
      console.log(error);
      message.error(error.response?.data?.message || "Failed to save product");
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Add Product" : "Edit Product"}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={mode === "create" ? "Create" : "Update"}
      centered
      width={560}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Brand"
          name="brand"
          rules={[{ required: true, message: "Brand is required" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Price" name="price" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Image"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[
            { required: mode === "create", message: "Image is required" },
          ]}
        >
          <Upload.Dragger
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
            accept="image/*"
          >
            <p className="ant-upload-drag-icon"> </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Upload.Dragger>
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: "Mobile", value: "mobile" },
              { label: "Electronics", value: "electronics" },
              { label: "Fashion", value: "fashion" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Stock" name="stock" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductModal;
