import * as d3 from 'd3'

//import { getDefaultFontSize } from '../../utils/helper';
//import HammerLogo from "../../assets/hammer.svg"
//import CrossLogo from "../../assets/cross.svg"

class ScatterplotD3 {
    margin = {top: 10, right: 100, bottom: 200, left: 100};
    size;
    height;
    width;
    matSvg;
    // add specific class properties used for the vis render/updates
    defaultOpacity=0.8;
    transitionDuration=1000;
    circleRadius = 3;
    xScale;
    yScale;
    visData;
    xAttribute;
    yAttribute;
    controllerMethods;
    brushRef;

    seasonToColorMap = {
        "Spring":"rgb(240, 249, 33)",
        "Summer":"rgb(237, 121, 83)",
        "Autumn":"rgb(156, 23, 158)",
        "Winter":"rgb(13, 8, 135)"
    };
    
    /**
     * For new elements, create the visual representation of the dot and append it to the enter selection
     * @param {*} enter 
     * @returns The items group of the new elements, already appended to the enter selection 
     */
    createVisualForCategorical = function (enter){

        const holidaySymbol = d3.symbol().type(d3.symbolCross).size(50);
        const nonHolidaySymbol = d3.symbol().type(d3.symbolCircle).size(50);

        const itemG = enter.append("g").attr("class","dotG");

        itemG.style("opacity",this.defaultOpacity)
        .style("visibility", "visible")
        .style("pointer-events", "none") // prevent mouse events conflicts with brush
        .append("path")
        .attr("d", (item) => item["Holiday"] === "Holiday" ? holidaySymbol(): nonHolidaySymbol())
        return itemG

    }    

    constructor(el){
        this.el=el;
    };

    /**
     * Create the scatterplot view and axis
     * @param {*} config Configuration object with size of the scatterplot view 
     */
    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        // get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.matSvg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","scatterplotSvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        ;

        // Build the axis
        this.matSvg.append("g")
            .attr("class","xAxisG")
            .attr("transform","translate(0,"+this.height+")");

        this.matSvg.append("g")
            .attr("class","yAxisG");
        
               
    }


    /**
     * Update the position of dots in the scatterplot also with a transition 
     * @param {*} selection  The selection of the dots
     * @param {*} selectedItemsIndices 
     * @param {*} xAttribute 
     * @param {*} yAttribute 
     */
    updateDotsPositionAndColor(selection, selectedItemsIndices, xAttribute,yAttribute){
        
        // For every element in the selection, update the position of the dot
        selection
            .attr("fill", (item) => selectedItemsIndices.includes(item.index) || selectedItemsIndices.length === 0 ? this.seasonToColorMap[item.Seasons] : "gray" )
            .attr("stroke", (item) => {
                if(selectedItemsIndices.length === 0 || selectedItemsIndices.includes(item.index))
                    return item["FunctioningDay"] === "Yes" ? "green" : "red"
                else
                    return "gray"

            })
            .transition().duration(this.transitionDuration)
            .attr("transform", (item)=>{

                // use scales to return shape position from data values
                const xPos = this.xScale(item[xAttribute]);
                const yPos = this.yScale(item[yAttribute]);
                console.assert(xPos!==undefined,"xPos is undefined at "+item.index);
                console.assert(yPos!==undefined,"yPos is undefined at "+item.index);
                return "translate("+xPos+","+yPos+")";
            })

        //alert()
         
    }


    updateAxis = function(visData,xAttribute,yAttribute){

        // Check if xAttribute and yAttribute are dates by inspecting the first item
        const isXDate = xAttribute === "Date"
        const isYDate = yAttribute === "Date"

        // Set the appropriate scale based on the attribute type
        this.xScale = isXDate ? d3.scaleTime().range([0, this.width]) : d3.scaleLinear().range([0, this.width]);
        this.yScale = isYDate ? d3.scaleTime().range([this.height, 0]) : d3.scaleLinear().range([this.height, 0]);


        // Calculate min and max values for x and y
        const xExtent = d3.extent(visData, d => d[xAttribute]);
        const yExtent = d3.extent(visData, d => d[yAttribute]);

        // Set domain for each scale
        this.xScale.domain(xExtent);
        this.yScale.domain(yExtent);


        // UPDATE AXIS
        const bottomAxis = isXDate ? d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%Y-%m-%d")) : d3.axisBottom(this.xScale);
        const leftAxis = isYDate ? d3.axisLeft(this.yScale).tickFormat(d3.timeFormat("%Y-%m-%d")) : d3.axisLeft(this.yScale);

        this.matSvg.select(".xAxisG")
            .transition().duration(this.transitionDuration)
            .call(bottomAxis)
        ;

        this.matSvg.select(".yAxisG")
            .transition().duration(this.transitionDuration)
            .call(leftAxis)
        ;
        // 

        // LABELS
        this.matSvg.select(".xAxisLabel").remove();
        this.matSvg.select(".yAxisLabel").remove();

        this.matSvg.append("text")
        .attr("class", "xAxisLabel")
        .attr("text-anchor", "end")
        .attr("x", this.width)
        .attr("y", this.height - 6)
        .text(xAttribute);

        this.matSvg.append("text")
        .attr("class", "yAxisLabel")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(yAttribute);
        // 
    }

    /**
     * Render the points of the scatterplot, also updating the axis accordingly
     * @param {*} visData 
     * @param {*} xAttribute 
     * @param {*} yAttribute 
     * @param {*} controllerMethods 
     */
    renderScatterplot = function (visData, selectedItemsIndices, xAttribute, yAttribute, controllerMethods){

        
        this.visData = visData;
        this.xAttribute = xAttribute;
        this.yAttribute = yAttribute;
        this.controllerMethods = controllerMethods;

        // Reset the Axis with the current data
        this.updateAxis(visData,xAttribute,yAttribute);
        
        // Bind the data to the dots
        this.matSvg.selectAll(".dotG")
            // all elements with the class .cellG (empty the first time)
            .data(visData, (itemData) => itemData.index)
            .join(
                // When data does not exist yet
                enter => {
                    const itemG = this.createVisualForCategorical(enter);
                    this.updateDotsPositionAndColor(itemG, selectedItemsIndices, xAttribute, yAttribute);
                },
                // When data already exists
                update => {
                    this.updateDotsPositionAndColor(update, selectedItemsIndices, xAttribute, yAttribute);
                },
                // When data is removed
                exit => {
                    exit.remove();
                }
            );



        const brush = d3.brush()
        .extent([[0, 0], [this.width, this.height]])
        .on("end", (event) => {
            if (!event.sourceEvent) return; // Only transition after input.

                this.controllerMethods.handleOnBrushEnd(event);
                d3.select(this.matSvg.node()).call(brush.clear);
        });


        // Add a brush
        this.matSvg.call(brush);


    }

    /**
     * Get the selected items in the brush 
     * @param {*} event Event triggered by the ending of brush
     * @returns A list of indices of the selected items
     */
    getBrushSelectedItems = function (event){

        // If no area selected return empty list
        if(event.selection===null)
            return [];

        const extent = event.selection;

        // Select all dots and filter the ones inside the extent
        const filteredIndices = this.matSvg.selectAll(".dotG")
            .filter((item)=>{
                const xPos = this.xScale(item[this.xAttribute]);
                const yPos = this.yScale(item[this.yAttribute]);
                return extent[0][0] <= xPos && xPos <= extent[1][0] && extent[0][1] <= yPos && yPos <= extent[1][1];
            })
            // Get the data and return the index
            .data().map(i => i.index);

        return filteredIndices; 
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default ScatterplotD3;