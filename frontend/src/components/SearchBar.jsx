import { useMemo, useEffect } from "react";
import { Input } from "antd";
import { useProducts } from "../context/Product";
import debounce from "lodash/debounce";

const SearchBar = () => {
  const { fetchProducts, resetFilters } = useProducts();

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        if (value.trim()) {
          fetchProducts({ search: value });
        } else {
          resetFilters();
        }
      }, 300),
    [fetchProducts, resetFilters]
  );

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  return (
    <div className="search-bar">
      <Input.Search
        placeholder="Search for products, brands and more..."
        allowClear
        size="large"
        onChange={(e) => debouncedSearch(e.target.value)}
        style={{ maxWidth: 760 }}
      />
    </div>
  );
};

export default SearchBar;