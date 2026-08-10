import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import {salesApi} from "./saelApi";


const extractData=(res)=>{
 return (
   res.data?.Result ||
   res.data?.result ||
   res.data ||
   []
 );
};



export const fetchDailySales = createAsyncThunk(
 "sales/daily",
 async({startDate,endDate},{rejectWithValue})=>{

  try{

    const res = await salesApi.getDailySales(
      startDate,
      endDate
    );

    console.log("DAILY API RESPONSE:", res.data);

    return res.data.Result || res.data.result || res.data;

  }
  catch(err){
    return rejectWithValue(err.message);
  }

 });



export const fetchMonthlySales=createAsyncThunk(
 "sales/monthly",
 async(year,{rejectWithValue})=>{
  try{

   const res =
   await salesApi.getMonthlySales(year);

   return extractData(res);

  }catch(err){
   return rejectWithValue(err.message);
  }
 }
);



export const fetchYearlySales=createAsyncThunk(
 "sales/yearly",
 async(_,{rejectWithValue})=>{
  try{

   const res =
   await salesApi.getYearlySales();

   return extractData(res);

  }catch(err){
   return rejectWithValue(err.message);
  }
 }
);



const initialState={

 daily:[],
 monthly:[],
 yearly:[],

 status:"idle",
 error:null

};



const salesSlice=createSlice({

 name:"sales",

 initialState,

 reducers:{},

 extraReducers:(builder)=>{

 builder

.addCase(fetchDailySales.fulfilled,(state,action)=>{
    state.daily = [action.payload];
})


.addCase(fetchMonthlySales.fulfilled,(state,action)=>{

    state.monthly = [action.payload];

})


.addCase(fetchYearlySales.fulfilled, (state, action) => {

  state.yearly = Array.isArray(action.payload)
    ? action.payload
    : [action.payload];

})


 }

});


export default salesSlice.reducer;