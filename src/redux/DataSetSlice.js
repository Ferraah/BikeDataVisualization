import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa, { parse } from "papaparse"

// get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
    const response = await fetch('data/SeoulBikeData.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});
    return responseJson.data.map((item,i)=>{return {...item,index:i}}).slice(0, -7000); // 
    //return responseJson.data.map((item,i)=>{return {...item,index:i}});
    //return responseJson.data.map((item,i)=>{return {...item,index:i}});
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
        selectedItemsIndices: [1], // Empty in the beginning
        selectedBinsIndices: [],
        numericalAttributes,
        categoricalAttributes,
        xAxisAttribute : numericalAttributes[0],
        yAxisAttribute : numericalAttributes[1]
    }
}

export const stateSlice = createSlice({
  name: 'state',
  initialState: {
    dataSet: [],
    numericalAttributes : [],
    categoricalAttributes : [],
    xAxisAttribute : null,
    yAxisAttribute : null,
    selectedItemsIndices: [],
    selectedBinsIndices: []
  },
  reducers: {
    updateAxisAttributes: (state, action) => {
      return {...state, 
          xAxisAttribute: action.payload.xAxisAttribute, 
          yAxisAttribute: action.payload.yAxisAttribute
        }
    },
    updateSelectedItem: (state, action) => {
      return {...state, selectedItemsIndices: action.payload}
    }
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      // Add any fetched house to the array
      return prepareInitialState(action.payload)
    })
  }
})

// Action creators are generated for each case reducer function
export const {  updateAxisAttributes, updateSelectedItem} = stateSlice.actions

export default stateSlice.reducer