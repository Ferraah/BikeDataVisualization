import {useEffect, useRef} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import "./Scatterplot.css"
import ScatterplotD3 from './ScatterPlotD3';
import { updateSelectedItemsIndices} from '../../redux/DataSetSlice';

function ScatterplotContainer(){
    const state = useSelector(state => state.state);
    const dispatch = useDispatch();

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null);

    const getCharSize = function(){
        // fixed size
        // return {width:900, height:900};
        // getting size from parent item
        let width;// = 800;
        let height;// = 100;
        if(divContainerRef.current!==undefined){
            width=divContainerRef.current.offsetWidth;
            // width = '100%';
            height=divContainerRef.current.offsetHeight;
            // height = '100%';
        }
        return {width:width,height:height};
    }

    useEffect(()=>{
        console.log("ScatterplotContainer useEffect [] called once the component did mount");
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);

        scatterplotD3.create({size:getCharSize()});

        scatterplotD3Ref.current = scatterplotD3;

        return ()=>{
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("ScatterplotContainer useEffect [] return function, called when the component did unmount...");
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.clear()
        }
    },[]);// if empty array, useEffect is called after the component did mount (has been created)

    
    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(()=>{
        console.log("ScatterplotContainer useEffect with dependency [state, dispatch], called each time matrixData changes...");
        const scatterplotD3 = scatterplotD3Ref.current;

        const handleOnClick = function(cellData){
            alert(cellData.index);
            //dispatch(updateSelectedItem(cellData));
        }
        const handleOnMouseEnter = function(cellData){
            //dispatch(updateHoveredCell(cellData))
        }
        const handleOnMouseLeave = function(){
            //dispatch(updateHoveredCell({}))
        }
        const handleOnBrushEnd = function(event){
            const selectedItemsIndices = scatterplotD3.getBrushSelectedItems(event);
            dispatch(updateSelectedItemsIndices(selectedItemsIndices));
        }

        const controllerMethods={
            handleOnClick,
            handleOnMouseEnter,
            handleOnMouseLeave,
            handleOnBrushEnd
        }
       
        scatterplotD3.renderScatterplot(state.dataSet, state.selectedItemsIndices, state.xAxisAttribute_1,state.yAxisAttribute_1,controllerMethods);
    },[state,dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.



    return (
        <div ref={divContainerRef} className='scatterplotDivContainer'>
            <h1>Scatterplot Container</h1>
        </div>
    )
}


export default ScatterplotContainer;