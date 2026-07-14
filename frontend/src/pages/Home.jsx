import { useEffect } from "react";
import { Row, Col } from "antd";
import { useProducts } from "../context/Product";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";

const Home = () => {
  const { products, resetFilters } = useProducts();

  useEffect(() => { resetFilters({}); }, [resetFilters]);

  return (
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
  );
};

export default Home;
