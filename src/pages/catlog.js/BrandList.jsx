
import CatalogList from "../catlog.js/catalogList";
import { getAllBrands, createBrand, updateBrand, deleteBrand } from "../../features/categories/brandApi";

export default function BrandList() {
  return (
    <CatalogList
      title="Brands" nameLabel="Brand name" nameField="brandName"
      fetchAll={getAllBrands} create={createBrand} update={updateBrand} remove={deleteBrand}
    />
  );
}