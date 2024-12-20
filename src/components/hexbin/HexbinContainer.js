import {useEffect, useRef} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import HexbinD3 from './HexbinD3';
import "./Hexbin.css"
import { updateSelectedItemsIndices } from '../../redux/DataSetSlice';

function HexbinContainer(){
    const state = useSelector(state => state.state);
    const dispatch = useDispatch();

    const divContainerRef = useRef(null);
    const hexbinRef = useRef(null);

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
        const hexbin = new HexbinD3(divContainerRef.current);

        hexbin.create({size:getCharSize()});

        hexbinRef.current = hexbin;

        return ()=>{
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("ScatterplotContainer useEffect [] return function, called when the component did unmount...");
            const hexbin = hexbinRef.current;
            hexbin.clear()
        }
    },[]);// if empty array, useEffect is called after the component did mount (has been created)

    
    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(()=>{
        console.log("ScatterplotContainer useEffect with dependency [state, dispatch], called each time matrixData changes...");
        const hexbin = hexbinRef.current;
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

            const selectedBins = hexbin.getBrushSelectedBins(event);
            const selectedItemsIndices = hexbin.getBrushSelectedItems(selectedBins)
            
            dispatch(updateSelectedItemsIndices(selectedItemsIndices))
        }

        const controllerMethods={
            handleOnClick,
            handleOnMouseEnter,
            handleOnMouseLeave,
            handleOnBrushEnd
        }
       
        hexbin.renderPlot(state.dataSet, state.selectedItemsIndices, state.xAxisAttribute_2,state.yAxisAttribute_2,controllerMethods);
    },[state,dispatch]);// if dependencies, useEffect is called after each data update, in our case only matrixData changes.



    return (
        <div ref={divContainerRef} className='divHexbinContainer'>
        </div>
    )
}


export default HexbinContainer;