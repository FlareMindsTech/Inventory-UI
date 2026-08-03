import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductsThunk,
  fetchCategoriesThunk,
  fetchBrandsThunk,
  addProductThunk,
  updateProductThunk,
  deleteProductThunk,
} from "../features/products/productSlice";

export const useProducts = () => {
  const dispatch = useDispatch();
  const { list, categories, brands, status, error } = useSelector((state) => state.products);



  return {
    products: list,
    categories,
    brands,
    isLoading: status === "loading",
    error,
    fetchProducts: () => {
      
      return dispatch(fetchProductsThunk());
    },
    fetchCategories: () => {
    
      return dispatch(fetchCategoriesThunk());
    },
    fetchBrands: () => {
    
      return dispatch(fetchBrandsThunk());
    },
    addProduct: (data) => {
    
      return dispatch(addProductThunk(data)).unwrap();
    },
    updateProduct: (id, data) => {
    
      return dispatch(updateProductThunk({ id, productData: data })).unwrap();
    },
    deleteProduct: (id) => {
     
      return dispatch(deleteProductThunk(id)).unwrap();
    },
  };
};