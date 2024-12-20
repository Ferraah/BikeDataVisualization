import './App.css';
import { useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ControlBar from './components/controlbar/ControlBar';
import ScatterplotContainer from './components/scatterplot/ScatterPlotContainer';
import HexbinContainer from './components/hexbin/HexbinContainer';

import 'bootstrap/dist/css/bootstrap.min.css';

// here import other dependencies

// a component is a piece of code which render a part of the user interface
function App() {
  const dispatch = useDispatch();
  useEffect(()=>{
    console.log("App useEffect");
  })

  // called once the component did mount
  useEffect(()=>{
    // initialize the data from file
    dispatch(getSeoulBikeData());
  },[])

  return (
    <div className="App">
        {/* {console.log("App rendering")}
        <div id="view-container" className="row">
          {<ControlBar/>}
          <div className="col">
            {<ScatterplotContainer/>}
          </div>
          <div className="col">
            { <HexbinContainer/> }
          </div>
        </div> */}

        <div class="h-100">
          <div class="row">
            <div class="col-12">
              <ControlBar/>
            </div>
          </div> 
          <div class="row align-items-start h-100">
            <div class="col-6 h-100">
              <ScatterplotContainer/>
            </div>
            <div class="col-6 h-100">
              <HexbinContainer/>
            </div>

          </div>
      </div>
    </div>
  );
}



export default App;
