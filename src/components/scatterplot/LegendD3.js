import * as d3 from 'd3';

export default function ScatterplotLegend() {

    const seasonToColorMap = {
        "Spring":"rgb(240, 249, 33)",
        "Summer":"rgb(237, 121, 83)",
        "Autumn":"rgb(156, 23, 158)",
        "Winter":"rgb(13, 8, 135)"
    };

    const holidaySymbol = d3.symbol().type(d3.symbolCross).size(50);
    const nonHolidaySymbol = d3.symbol().type(d3.symbolCircle).size(50);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
                {Object.keys(seasonToColorMap).map(season => (
                    <div key={season} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: seasonToColorMap[season], marginRight: '8px' }}></div>
                        <span>{season}</span>
                    </div>
                ))}
            </div>

            <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <p style={{ marginRight: '8px' }}>Holiday: </p>
                    <svg width="20" height="20"><path transform="translate(10,10)" d={holidaySymbol()}></path></svg>
                    <p style={{ margin: '0 8px' }}>Non Holiday: </p>
                    <svg width="20" height="20"><path transform="translate(10,10)" d={nonHolidaySymbol()}></path></svg>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <p style={{ marginRight: '8px' }}>Functioning day: </p>
                    <svg width="20" height="20"><path transform="translate(10,10)" stroke="green" fill="none" d={nonHolidaySymbol()}></path></svg>
                    <p style={{ margin: '0 8px' }}>Non functioning day: </p>
                    <svg width="20" height="20"><path transform="translate(10,10)" stroke="red" fill="none" d={nonHolidaySymbol()}></path></svg>
                </div>
            </div>
        </div>
    )
}