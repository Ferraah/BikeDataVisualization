import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateAxisAttributes } from '../../redux/DataSetSlice';
import ScatterplotLegend from '../legend/LegendD3';

export default function ControlBar() {
    const state = useSelector(state => state.state);
    const dispatch = useDispatch();

    const handleSubmit = (e, i) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
        dispatch(updateAxisAttributes({
            xAxisAttribute: formJson.selectXAxis,
            yAxisAttribute: formJson.selectYAxis,
            plotIndex: i
        }));
    };

    return (
        <div>
        <div className='row mt-2'>

            <div className='col'>
                <form method="post" onSubmit={(e) => handleSubmit(e, 0)}>
                    <select name="selectYAxis">
                        {
                            state.numericalAttributes.map((item, i) => {
                                return <option key={i} value={item} selected={item === state.yAxisAttribute_1}>{item}</option>
                            })
                        }
                    </select>
                    <select name="selectXAxis">
                        {
                            state.numericalAttributes.map((item, i) => {
                                return <option key={i} value={item} selected={item === state.xAxisAttribute_1}>{item}</option>
                            })
                        }
                    </select>
                    <button type="submit">Visualize</button>
                </form>
            </div>
            <div className='col'>
                <form method="post" onSubmit={(e) => handleSubmit(e, 1)}>
                    <select name="selectYAxis">
                        {
                            state.numericalAttributes.map((item, i) => {
                                return <option key={i} value={item} selected={item === state.yAxisAttribute_2}>{item}</option>
                            })
                        }
                    </select>
                    <select name="selectXAxis">
                        {
                            state.numericalAttributes.map((item, i) => {
                                return <option key={i} value={item} selected={item === state.xAxisAttribute_2}>{item}</option>
                            })
                        }
                    </select>
                    <button type="submit">Visualize</button>
                </form>

            </div>
        </div>
        <div className='row align-items-start mt-4'>
            <div className='col-6'>
                <ScatterplotLegend />
            </div>
        </div>
        </div>
    );
}