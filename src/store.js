import { configureStore } from '@reduxjs/toolkit'
import stateReducer from './redux/DataSetSlice'
export default configureStore({
  reducer: {
    state: stateReducer,
    }
})