import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

// get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
    const response = await fetch('data/SeoulBikeData.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});
    //return responseJson.data.map((item,i)=>{return {...item,index:i}}).slice(0, -7000); // 
    //return responseJson.data.map((item,i)=>{return {...item,index:i}}).slice(0, 10); // 
    return responseJson.data.map((item,i)=>{return {...item,index:i}});
    // when a result is returned, extraReducer below is triggered with the case setSeoulBikeData.fulfilled
})

const prepareInitialState = (data) => {

    // Parse string to dates from the original data
    const parsedData = data.map(item => ({ ...item, Date: new Date(item["Date"].split("/").reverse().join("-")) }));

    // Get all attributes
    const availableAttributes = Object.keys(parsedData[0]);
    let numericalAttributes = [];
    let categoricalAttributes = [];

    availableAttributes.forEach(attribute => { 
        // We also consider date as numerical despite being an object 
        if (typeof parsedData[0][attribute] === 'number' || attribute === "Date") {
            numericalAttributes.push(attribute);
        } else {
            categoricalAttributes.push(attribute);
        }
    })

    return {
        dataSet: parsedData,
        selectedItemsIndices: [], // Empty in the beginning
        //selectedBins: [],
        numericalAttributes,
        categoricalAttributes,
        xAxisAttribute_1 : numericalAttributes[0],
        yAxisAttribute_1 : numericalAttributes[1],
        xAxisAttribute_2 : numericalAttributes[0],
        yAxisAttribute_2 : numericalAttributes[1]
    }
}

export const stateSlice = createSlice({
  name: 'state',
  initialState: {
    dataSet: [],
    numericalAttributes : [],
    categoricalAttributes : [],
    xAxisAttribute_1 : null,
    yAxisAttribute_1 : null,
    xAxisAttribute_2 : null,
    yAxisAttribute_2 : null,
    selectedItemsIndices: [],
    //selectedBins: []
  },
  reducers: {
    updateAxisAttributes: (state, action) => {
      if(action.payload.plotIndex === 0)
        return {...state, 
            xAxisAttribute_1: action.payload.xAxisAttribute, 
            yAxisAttribute_1: action.payload.yAxisAttribute
          }
      else
        return {...state, 
            xAxisAttribute_2: action.payload.xAxisAttribute, 
            yAxisAttribute_2: action.payload.yAxisAttribute
          }
    },
    updateSelectedItemsIndices: (state, action) => {
      return {...state, selectedItemsIndices: action.payload}
    },
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      // Add any fetched house to the array
      return prepareInitialState(action.payload)
    })
  }
})

// Action creators are generated for each case reducer function
export const {  updateAxisAttributes, updateSelectedItemsIndices} = stateSlice.actions

export default stateSlice.reducer