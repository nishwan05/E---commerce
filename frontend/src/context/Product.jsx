import { createContext, useCallback, useContext, useRef, useState, useEffect } from "react";
import { message } from "antd";
import { createProduct, deleteProduct, getBrands, getProducts, updateProduct } from "../api/productApi";
import { socket } from "../socket";

const ProductContext = createContext();
const defaultPriceRange = [0, 100000];

const sortProducts = (order, list = []) => {
  const sorted = [...list];
  if (!order) return sorted;
  if (order === "name-asc") sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  if (order === "name-desc") sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
  if (order === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (order === "price-desc") sorted.sort((a, b) => b.price - a.price);
  return sorted;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState(defaultPriceRange);
  const lastParams = useRef({});
  const sortOrderRef = useRef(null);
  const filterRef = useRef({ brands: [], priceRange: defaultPriceRange });
  const productReqId = useRef(0);
  const brandReqId = useRef(0);
  const abortRef = useRef(null);

  const fetchProducts = useCallback(async (params = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = productReqId.current + 1;
    productReqId.current = reqId;
    lastParams.current = params;
    setLoading(true);
    try {
      const { brands, priceRange: pr } = filterRef.current;
      const q = { ...params };
      if (brands.length > 0) q.brands = brands.join(",");
      if (pr[0] > 0) q.minPrice = pr[0];
      if (pr[1] < 100000) q.maxPrice = pr[1];
      const res = await getProducts(q, controller.signal);
      if (reqId !== productReqId.current) return;
      setProducts(sortProducts(sortOrderRef.current, Array.isArray(res?.data) ? res.data : []));
    } catch (error) { console.log(error); }
    finally { if (reqId === productReqId.current) setLoading(false); }
  }, []);

  const fetchBrands = useCallback(async (params = {}) => {
    const reqId = brandReqId.current + 1;
    brandReqId.current = reqId;
    try {
      const res = await getBrands(params);
      if (reqId !== brandReqId.current) return;
      setAvailableBrands(Array.isArray(res?.data) ? res.data : []);
    } catch (error) { console.log(error); }
  }, []);

  const handleSort = useCallback((order) => {
    setSortOrder(order);
    sortOrderRef.current = order === "default" ? null : order;
    if (order === "default") fetchProducts(lastParams.current);
    else setProducts((prev) => sortProducts(order, prev));
  }, [fetchProducts]);

  const handleBrandChange = useCallback((brand, checked) => {
    setSelectedBrands((prev) => {
      const next = checked ? [...prev, brand] : prev.filter((b) => b !== brand);
      filterRef.current = { ...filterRef.current, brands: next };
      return next;
    });
    setTimeout(() => fetchProducts(lastParams.current), 0);
  }, [fetchProducts]);

  const handlePriceChange = useCallback((range) => {
    setPriceRange(range);
    filterRef.current = { ...filterRef.current, priceRange: range };
    fetchProducts(lastParams.current);
  }, [fetchProducts]);

  const resetFilters = useCallback((params) => {
    filterRef.current = { brands: [], priceRange: defaultPriceRange };
    setSelectedBrands([]);
    setPriceRange(defaultPriceRange);
    const fp = params !== undefined ? params : lastParams.current.category ? { category: lastParams.current.category } : {};
    fetchProducts(fp);
    fetchBrands(fp);
  }, [fetchBrands, fetchProducts]);

  const refreshBrands = useCallback(() =>
    fetchBrands(lastParams.current.category ? { category: lastParams.current.category } : {}), [fetchBrands]);

  const addProduct = useCallback(async (data) => {
    await createProduct(data); await fetchProducts(lastParams.current); await refreshBrands();
    message.success("Product added successfully", 3);
  }, [fetchProducts, refreshBrands]);

  const editProduct = useCallback(async (id, data) => {
    await updateProduct(id, data); await fetchProducts(lastParams.current); await refreshBrands();
    message.success("Product updated successfully", 3);
  }, [fetchProducts, refreshBrands]);

  const removeProduct = useCallback(async (id) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p._id !== id));
    await refreshBrands();
    message.success("Product deleted successfully", 3);
  }, [refreshBrands]);

  useEffect(() => {
    socket.on("productCreated", () => { fetchProducts(lastParams.current); refreshBrands(); });
    socket.on("productUpdated", () => { fetchProducts(lastParams.current); refreshBrands(); });
    socket.on("productDeleted", () => { fetchProducts(lastParams.current); refreshBrands(); });
    return () => { socket.off("productCreated"); socket.off("productUpdated"); socket.off("productDeleted"); };
  }, [fetchProducts, refreshBrands]);

  return (
    <ProductContext.Provider value={{ products, loading, sortOrder, availableBrands, selectedBrands, priceRange, handleSort, fetchProducts, fetchBrands, handleBrandChange, handlePriceChange, resetFilters, addProduct, editProduct, removeProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
