

import { useDispatch, useSelector } from "react-redux";

import {
  fetchDailySales,
  fetchMonthlySales,
  fetchYearlySales,
} from "../features/sales/saleSlice";


export function useSales() {

  const dispatch = useDispatch();


  const {
    daily,
    monthly,
    yearly,
    status,
    error
  } = useSelector(
    (state) => state.sales
  );



  const getDailySales = (startDate, endDate) => {
    return dispatch(
      fetchDailySales({
        startDate,
        endDate
      })
    ).unwrap();
  };



  const getMonthlySales = (year) => {
    return dispatch(
      fetchMonthlySales(year)
    ).unwrap();
  };



  const getYearlySales = () => {
    return dispatch(
      fetchYearlySales()
    ).unwrap();
  };



  return {

    // data
    dailySales: daily,
    monthlySales: monthly,
    yearlySales: yearly,


    // loading
    isLoading: status === "loading",


    // error
    error,


    // actions
    getDailySales,
    getMonthlySales,
    getYearlySales

  };

}