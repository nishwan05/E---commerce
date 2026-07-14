import { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, message } from "antd";
import { useProducts } from "../context/Product";

const ProductModal = ({ open, onClose, onSuccess, mode = "create", product = null }) => {
  const [form] = Form.useForm();
  const { addProduct, editProduct } = useProducts();

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
    }
  }, [product, mode, form, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (mode === "create") {
        await addProduct(values);
      } else {
        await editProduct(product._id, values);
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
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Brand" name="brand" rules={[{ required: true, message: "Brand is required" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Price" name="price" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Image URL" name="image">
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Category" name="category" rules={[{ required: true }]}>
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
