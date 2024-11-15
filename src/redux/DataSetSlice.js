import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa, { parse } from "papaparse"

// get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
    const response = await fetch('data/SeoulBikeData.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});
    //return responseJson.data.map((item,i)=>{return {...item,index:i}}).slice(0, -1); // 
    return responseJson.data.map((item,i)=>{return {...item,index:i}});
    // when a result is returned, extraReducer below is triggered with the case setSeoulBikeData.fulfilled
})

const prepareInitialState = (dataSet) => {

    const parsedDataSet = dataSet.map(item => ({ ...item, Date: new Date(item["Date"].split("/").reverse().join("-")) }));
    //const parsedDataSet = dataSet;
    console.log("parsedDataSet: ", parsedDataSet);
    // Get all attributes
    const availableAttributes = Object.keys(dataSet[0]);
    let numericalAttributes = [];
    let categoricalAttributes = [];

    availableAttributes.forEach(attribute => { 
        // We also consider date as numerical despite being an object 
        if (typeof parsedDataSet[0][attribute] === 'number' || attribute === "Date") {
            numericalAttributes.push(attribute);
        } else {
            categoricalAttributes.push(attribute);
        }
    })

    console.log("numericalAttributes: ", numericalAttributes);
    console.log("categoricalAttributes: ", categoricalAttributes);

    return {
        dataSet: parsedDataSet,
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
    yAxisAttribute : null
  },
  reducers: {
    updateAxisAttributes: (state, action) => {
      return {...state, 
          xAxisAttribute: action.payload.xAxisAttribute, 
          yAxisAttribute: action.payload.yAxisAttribute
        }
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
export const { updateSelectedItem, updateAxisAttributes } = stateSlice.actions

export default stateSlice.reducer