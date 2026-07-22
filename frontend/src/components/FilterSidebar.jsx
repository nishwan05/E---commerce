import { useState, useEffect, useMemo } from "react";
import { Slider, Checkbox, Button, Divider, Input, Select } from "antd";
import { useProducts } from "../context/Product";
import debounce from "lodash/debounce";

const FilterSidebar = () => {
  const {
    availableBrands,
    selectedBrands,
    priceRange,
    handleBrandChange,
    handlePriceChange,
    resetFilters,
    fetchProducts,
    handleSort,
    sortOrder,
  } = useProducts();

  const [displayRange, setDisplayRange] = useState([0, 100000]);

  useEffect(() => {
    setDisplayRange(priceRange);
  }, [priceRange]);

  // const debouncedSearch = useMemo(
  //   () =>
  //     debounce((value) => {
  //       if (value.trim()) {
  //         fetchProducts({ search: value });
  //       } else {
  //         resetFilters();
  //       }
  //     }, 300),
  //   [fetchProducts, resetFilters],
  // );

  // useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const hasActiveFilters =
    selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000;

  return (
    <div className="filter-sidebar">
      {/* Search */}
      <div className="filter-section">
        <p className="filter-heading">Search</p>
        {/* <Input.Search
          placeholder="Search products..."
          allowClear
          onChange={(e) => debouncedSearch(e.target.value)}
        /> */}
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* Sort */}
      <div className="filter-section">
        <p className="filter-heading">Sort By</p>
        <Select
          placeholder="Sort by"
          value={sortOrder}
          style={{ width: "100%" }}
          allowClear
          onChange={(value) => handleSort(value || "default")}
          options={[
            { label: "Default", value: "default" },
            { label: "Name: A → Z", value: "name-asc" },
            { label: "Name: Z → A", value: "name-desc" },
            { label: "Price: Low → High", value: "price-asc" },
            { label: "Price: High → Low", value: "price-desc" },
          ]}
        />
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* Price Range */}
      <div className="filter-section">
        <p className="filter-heading">Price Range</p>
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

      {/* Brand */}
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
