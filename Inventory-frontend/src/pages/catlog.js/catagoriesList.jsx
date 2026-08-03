
import CatalogList from "../catlog.js/catalogList";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../../features/categories/categoriesApi";

export default function CategoryList() {
  return (
    <CatalogList
      title="Categories" nameLabel="Category name" nameField="categoryName"
      fetchAll={getAllCategories} create={createCategory} update={updateCategory} remove={deleteCategory}
    />
  );
}