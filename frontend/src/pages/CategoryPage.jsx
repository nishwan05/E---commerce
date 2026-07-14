import { useEffect } from "react";
import { Row, Col, Typography, Card, Skeleton } from "antd";
import { useProducts } from "../context/Product";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";

const { Title } = Typography;

const ProductSkeleton = () => (
  <Card
    className="product-card"
    cover={
      <Skeleton.Image
        active
        style={{ width: "100%", height: 200 }}
      />
    }
  >
    <Skeleton active paragraph={{ rows: 3 }} />
  </Card>
);

const CategoryPage = ({ category, title }) => {
  const { products, loading, resetFilters } = useProducts();

  useEffect(() => { resetFilters({ category }); }, [category, resetFilters]);

  return (
    <>
      <Title level={2}>{title}</Title>
      <div className="page-layout">
        <FilterSidebar />
        <div className="products-area">
          {loading ? (
            <Row gutter={[16, 16]}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Col xs={24} sm={12} md={8} key={i}>
                  <ProductSkeleton />
                </Col>
              ))}
            </Row>
          ) : products.length === 0 ? (
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