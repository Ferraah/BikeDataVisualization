import * as d3 from 'd3'
import * as d3Hexbin from 'd3-hexbin'
//import { getDefaultFontSize } from '../../utils/helper';
//import HammerLogo from "../../assets/hammer.svg"

class HexbinD3 {
    margin = {top: 50, right: 10, bottom: 150, left: 100};
    
    size;
    height;
    width;
    hexbinSvg;
    // add specific class properties used for the vis render/updates
    defaultOpacity=0.3;
    transitionDuration=1000;
    binRadius = 10;
    visData;
    xAttribute;
    yAttribute;
    xScale;
    yScale;
    controllerMethods;
    hexbin;

    indexToPointMap;
    pointToIndicesMap;
    pointToBinMap;
    binToPointsMap;
    

     
    constructor(el){
        this.el=el;
    };


    binIsSelected = function(bin, selectedIndices){
        
        if(!selectedIndices.length)
            return false;

        // Unoptimized
        const selectedPoints = selectedIndices.map(i => this.indexToPointMap.get(i));
        // For every point of the bin, check if at least one is selected. 
        // Then the bin count has selected
        for(let i=0; i<bin.length; i++){
            if(selectedPoints.includes(bin[i])){
                return true;
            }
        }

        return false;
    }

    createPointToBinMap = function(bins){
        const pointToBinMap = new Map();
        bins.forEach(b => {
            b.forEach(p => pointToBinMap.set(p, b))
        }) 
        return pointToBinMap;
    }
    /**
     * Create the hexagon bins, by returning an array of their senter coordinates
     * @param {*} visData The original data
     * @returns An array containing the centers of the hexagon 
     */
    prepareHexbinDataObjects = function(visData, xAttribute, yAttribute){

        //const inputForHexbin = visData.map(i => [this.xScale(i[xAttribute]), this.yScale(i[yAttribute])])
        let inputForHexbin = [];
        const indexToPointMap = new Map();
        visData.forEach(i => {
            const x = this.xScale(i[xAttribute]);
            const y = this.yScale(i[yAttribute]);
            const point = [x,y];
            indexToPointMap.set(i.index, point) 
            inputForHexbin.push(point); 
        });

        console.log(this.indexToPointMap)
        return {
            bins: this.hexbin(inputForHexbin),
            indexToPointMap: indexToPointMap
        };
    }

    /**
     *  Create the basic elements of the visualization. 
     * @param {*} config Object containing the width and height of the view
     */
    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        // Get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // Initialize the svg and keep it in a class property to reuse it in render()
        this.hexbinSvg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","matSvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Build xAxisG
        this.hexbinSvg.append("g")
            .attr("class","xAxisG")
            .attr("transform","translate(0,"+this.height+")");

        // Build yAxisG
        this.hexbinSvg.append("g")
            .attr("class","yAxisG");
        
        // Instantiate the hexabin object 
        this.hexbin = d3Hexbin.hexbin()
        .radius(this.binRadius) // size of the bin in px
        .extent([ [0, 0], [this.width, this.height] ]) 

        this.indexToPointMap = new Map();
        this.pointToBinMap = new Map();

    }


    /**
     *  Update the bin heaxgon elements, translating them to the new positions with
     *  with a transition. 
     *  @param {*} selection Selection of bin hexagon elements  
     */
    updateBinsElements(selection, selectedItemsIndices){
        selection
            .transition().duration(this.transitionDuration)
            .attr("transform", function(item) { return "translate(" + item.x + "," + item.y + ")"; })
            //.attr("stroke", bin => this.binIsSelected(bin, selectedItemsIndices) ? "red" : "black")
    }


    /**
     *  Update the axis labels 
     * @param {*} visData Data to visualize, used to calculate the domain for the axis
     * @param {*} xAttribute Current xAttribute
     * @param {*} yAttribute Current yAttribute
     */
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

        // UPDATE AXIS with the new scales

        // If they are dates format the tick labels
        const bottomAxis = isXDate ? d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%Y-%m-%d")) : d3.axisBottom(this.xScale);
        const leftAxis = isYDate ? d3.axisLeft(this.yScale).tickFormat(d3.timeFormat("%Y-%m-%d")) : d3.axisLeft(this.yScale);
       
        this.hexbinSvg.select(".xAxisG")
            .transition().duration(this.transitionDuration)
            .call(bottomAxis);

        this.hexbinSvg.select(".yAxisG")
            .transition().duration(this.transitionDuration)
            .call(leftAxis);

        // ADD AXIS LABELS

        // Remove previous axis labels
        this.hexbinSvg.select(".xAxisLabel").remove();
        this.hexbinSvg.select(".yAxisLabel").remove();

        // Append xAxisLabel 
        this.hexbinSvg.append("text")
        .attr("class", "xAxisLabel")
        .attr("text-anchor", "end")
        .attr("x", this.width)
        .attr("y", this.height - 6)
        .text(xAttribute);

        // Append yAxisLabel
        this.hexbinSvg.append("text")
        .attr("class", "yAxisLabel")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(yAttribute);
    }


    /**
     *  Render the plot given the data 
     * @param {*} visData The array of objects to visualize
     * @param {*} selectedItemsIndices The array of selected items indices
     * @param {*} xAttribute The current x-attribute to visualize
     * @param {*} yAttribute The current y-attribute to visualize 
     * @param {*} controllerMethods The controller methods for the 
     */
    renderPlot = function (visData, selectedItemsIndices, xAttribute, yAttribute, controllerMethods){

        this.controllerMethods = controllerMethods;

        // Reset the Axis with the current data and selected attributes
        this.updateAxis(visData,xAttribute,yAttribute);

        // Prepare the input for the hexbin object
        const result = this.prepareHexbinDataObjects(visData, xAttribute, yAttribute);
        const bins = result.bins;
        this.indexToPointMap = result.indexToPointMap; 

        //this.pointToBinMap = this.createPointToBinMap(bins);
        //this.binToPointsMap = new Map(Array.from(this.pointToBinMap, a => a.reverse())); // Because it's bijective

        // Create the color scale.
        const color = d3.scaleSequential(d3.interpolateBuPu)
          .domain([0, d3.max(bins, d => d.length) / 2]);
          // Create the radius scale.
        const r = d3.scaleSqrt()
        .domain([0, d3.max(bins, d => d.length) / 2])
        .range([0, this.hexbin.radius() * Math.SQRT2]);

        //console.log("Selected: ", this.binIsSelected(bins[100], selectedItemsIndices))

        this.hexbinSvg.selectAll(".binG")
        .data(bins)
        .join(
            enter => {
                console.log("enter: " , enter.data().length)
                const itemG = enter.append("g")
                    .attr("class","binG")

                itemG.append("path")
                .attr("class", "hexagon")
                .attr("fill", bin => color(bin.length))
                .attr("d", d => this.hexbin.hexagon(r(d.length)))
                this.updateBinsElements(itemG, selectedItemsIndices)
            },
            update => {
                console.log("update: " , update.data().length)
                this.updateBinsElements(update, selectedItemsIndices)
            },
            exit => {
                console.log("exit: ", exit.data().length)
                exit.remove();
            }
        )
        
        this.highlightSelectedBins(selectedItemsIndices)

        // Add a brush 
        this.hexbinSvg.call(
            d3.brush()
                .extent([[0, 0], [this.width, this.height]])
                .on("end", this.controllerMethods.handleOnBrushEnd)
        )
    }

    highlightSelectedBins = function(selectedItemsIndices){
        this.hexbinSvg.selectAll(".binG")
            .attr("stroke", bin => this.binIsSelected(bin, selectedItemsIndices) ? "red" : "black")
            .attr("stroke-width", bin => this.binIsSelected(bin, selectedItemsIndices) ? "2" : "0.5")
    }

    // Get the items objects selected by the brush
    getBrushSelectedItems = function (event){

        // If no area selected return empty list
        if(event.selection===null)
            return [];

        const extent = event.selection;
        const filtered_items = this.hexbinSvg.selectAll(".dotG")
             .filter((item)=>{
                 const xPos = this.xScale(item[this.xAttribute]);
                 const yPos = this.yScale(item[this.yAttribute]);
                 return extent[0][0] <= xPos && xPos <= extent[1][0] && extent[0][1] <= yPos && yPos <= extent[1][1];
             })
             .data();
        return filtered_items; 
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default HexbinD3;