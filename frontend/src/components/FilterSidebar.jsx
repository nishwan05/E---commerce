import { useState, useEffect } from "react";
import { Slider, Checkbox, Button, Divider } from "antd";
import { useProducts } from "../context/Product";

const FilterSidebar = () => {
  const {
    availableBrands,
    selectedBrands,
    priceRange,
    handleBrandChange,
    handlePriceChange,
    resetFilters,
  } = useProducts();

  const [displayRange, setDisplayRange] = useState([0, 100000]);

  useEffect(() => { setDisplayRange(priceRange); }, [priceRange]);

  const hasActiveFilters =
    selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000;

  return (
    <div className="filter-sidebar">
      <div className="filter-section">
        <p className="filter-heading">Price range</p>
        <Slider
          range
          min={0}
          max={100000}
          step={500}
          value={displayRange}
          onChange={setDisplayRange}
          onChangeComplete={handlePriceChange}
          tooltip={{ formatter: (v) => `₹ ${v.toLocaleString()}` }}
        />
        <div className="price-labels">
          <span>₹ {displayRange[0].toLocaleString()}</span>
          <span>₹ {displayRange[1].toLocaleString()}</span>
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div className="filter-section">
        <p className="filter-heading">Brand</p>
        {availableBrands.length === 0 ? (
          <p className="filter-empty">No brands available</p>
        ) : (
          availableBrands.map((brand) => (
            <div key={brand} className="checkbox-row">
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onChange={(e) => handleBrandChange(brand, e.target.checked)}
              >
                {brand}
              </Checkbox>
            </div>
          ))
        )}
      </div>

      {hasActiveFilters && (
        <>
          <Divider style={{ margin: "12px 0" }} />
          <Button
            type="link"
            danger
            size="small"
            onClick={() => resetFilters()}
            style={{ padding: 0 }}
          >
            Reset all filters
          </Button>
        </>
      )}
    </div>
  );
};

export default FilterSidebar;
