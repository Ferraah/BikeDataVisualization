import { useSelector, useDispatch } from "react-redux"
import { updateAxisAttributes } from "../../redux/DataSetSlice";

export default function ControlBar(){

    const state = useSelector(state => state.state);
    const dispatcher = useDispatch();

    const handleSubmit = (e) => {
        // Prevent the browser from reloading the page
        e.preventDefault();
        // Read the form data
        const form = e.target;
        const formData = new FormData(form);
        // You can work with it as a plain object.
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
        dispatcher(updateAxisAttributes({
            xAxisAttribute: formJson.selectXAxis,
            yAxisAttribute: formJson.selectYAxis
        }));
    }

    return (
        <div>
            <button onClick={()=> console.log(state)}></button>
            <form onSubmit={handleSubmit}>
                <select name="selectXAxis">
                    {
                        state.numericalAttributes.map((item,i)=>{
                            return <option key={i} value={item}>{item}</option>
                        })
                    }
                </select>
                <select name="selectYAxis">
                    {
                        state.numericalAttributes.map((item,i)=>{
                            return <option key={i} value={item}>{item}</option>
                        })
                    }
                </select>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}