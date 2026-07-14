import { useEffect } from "react";
import { Row, Col, Typography } from "antd";
import { useProducts } from "../context/Product";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";

const { Title } = Typography;

const CategoryPage = ({ category, title }) => {
  const { products, resetFilters } = useProducts();

  useEffect(() => { resetFilters({ category }); }, [category, resetFilters]);

  return (
    <>
      <Title level={2}>{title}</Title>
      <div className="page-layout">
        <FilterSidebar />
        <div className="products-area">
          {products.length === 0 ? (
            <p style={{ color: "gray", marginTop: 40 }}>No products found.</p>
          ) : (
            <Row gutter={[16, 16]}>
              {products.map((product) => (
                <Col xs={24} sm={12} md={8} key={product._id}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
