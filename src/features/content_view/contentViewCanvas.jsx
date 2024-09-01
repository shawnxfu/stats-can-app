import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { COLOR_ARRAY } from "../../app/colors";
import DrillDownLink from "./drillDownLink";

import { selectAllCharacteristics, selectCharacteristicsData, selectCompareWith } from "./contentSlice";

function ContentViewCanvas({geo, ids, root, handleItemClick}) {
    const [selectedId, setSelectedId] = useState(root.id);
    const allChs = useSelector(selectAllCharacteristics);
    const chsData = useSelector(selectCharacteristicsData);
    const compareWith = useSelector(selectCompareWith);
    const canvasRef = useRef(null);

    const chs = ids.map(id => allChs[id]);

    const ColumnNames = ["Counts - Total", "Counts - Men+", "Counts - Women+", "Rates - Total", "Rates - Men+", "Rates - Women+"];

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const totalWidth = canvas.parentElement.offsetWidth;
            const totalHeight = canvas.parentElement.offsetHeight > 420 ? 420 : canvas.parentElement.offsetHeight;
            canvas.width = totalWidth;
            canvas.height = totalHeight;

            // canvas.addEventListener("mousemove", (event) => {
            //     const bounding = canvas.getBoundingClientRect();
            //     const x = event.clientX - bounding.left;
            //     const y = event.clientY - bounding.top;
            //     console.log("x=" + x + " y=" + y);
            // });
        }
    }, [canvasRef]);

    
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const parent = canvas.parentElement;

            const geoArray = [geo, ...compareWith];
            const numGroups = 6;
            const minWidth = 8 * (numGroups + 1) * chs.length * geoArray.length; // min bar width = 8
            if (minWidth > parent.offsetWidth) {
                parent.style.width=minWidth+"px";
                parent.style.maxWidth=minWidth+"px";
            } else {
                parent.style.width="100%";
                parent.style.maxWidth="100%";
            }
            canvas.width = parent.offsetWidth;
        }
    }, [canvasRef, root, geo, compareWith]);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const totalWidth = canvas.width;
            const totalHeight = canvas.height;

            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const geoArray = [geo, ...compareWith];
            const numGroups = 6;
            const numBarsInGroup = chs.length * geoArray.length;

            let calcBarWidth = Math.floor(totalWidth/((numGroups * numBarsInGroup) + numGroups-1)); // a gap between each group 
            const barWidth = calcBarWidth > 20 ? 20 : calcBarWidth < 8 ? 8 : calcBarWidth;

            function drawBar(percentage, grpIdx, barIdx, geoIdx, isSelectedCh = false) {
                let barHeight = Math.floor(totalHeight * percentage);
                if (barHeight < 1) barHeight = 1;
                
                let offsetX = barWidth * (grpIdx * (numBarsInGroup + 1) + barIdx * geoArray.length + geoIdx);
                let offsetY = totalHeight - barHeight;
                let fillColor = COLOR_ARRAY[barIdx % COLOR_ARRAY.length];
                ctx.fillStyle = fillColor;
                ctx.fillRect(offsetX, offsetY, barWidth, barHeight);
                if (isSelectedCh) {                
                    ctx.strokeStyle = "#000";
                } else {
                    ctx.strokeStyle = "#ccc";
                }
                ctx.strokeRect(offsetX+1, offsetY+1, 
                    barWidth-2 > 0 ? barWidth-2 : 1, 
                    barHeight-2 > 0 ? barHeight-2 : 1);
            }

            let maxTotal = 0;
            geoArray.forEach(g => {
                const totalCnt = Number(chs[0]?.['data']?.[g.id]?.[0]);
                if (totalCnt && totalCnt > maxTotal) {
                    maxTotal = totalCnt;
                }
            })

            if (maxTotal > 0) {
                for (let groupIndex = 0; groupIndex < numGroups; groupIndex++) {
                    for (let barIndex = 0; barIndex < numBarsInGroup; barIndex++) {
                        const ch = chs[barIndex];
                        const isSelectedCh = ch?.id === selectedId;
                        for (let geoIndex= 0; geoIndex < geoArray.length; geoIndex++) {
                            const g = geoArray[geoIndex];
                            const values = ch?.['data']?.[g.id];
                            if (!values) continue;
                            const value = Number(values[groupIndex]);
                            if (value) {
                                let percentage = 0;
                                if (groupIndex < 3) {
                                    percentage = value / maxTotal;
                                } else {
                                    percentage = value / 100;
                                }
                                drawBar(percentage, groupIndex, barIndex, geoIndex, isSelectedCh);
                            }
                        }
                    }
                }
            }    
        }
    }, [canvasRef, geo, compareWith, chs, selectedId, chsData]);

    if (!chs || chs?.length === 0) return (<></>);

    const charList = chs.map(ch => {
        if (!ch) {
            return (<></>);
        }
        return (
            <tr key={ch.id}>
                <td onClick={() => setSelectedId(ch.id)} 
                    className={selectedId === ch.id ? "bg-primary-subtle" : ""}>
                    <DrillDownLink root={root} ch={ch}
                        handleItemClick={handleItemClick}
                        ></DrillDownLink>
                </td>
            </tr>
        );
    });

    const geoArray = [geo, ...compareWith];
    const selectedChInfo = geoArray.map(g => {
        const isPrimary = geo.id === g.id;
        const ch = allChs[selectedId];
        const data = ch?.['data']?.[g.id];
        const row = data ?
            Object.values(data).map((val, idx) => {
                return (
                    <>
                        { idx === 0 && 
                            <td width="20%" 
                                className={"text-truncate text-end" + (isPrimary ? "" : " fw-light")} 
                                title={g.name}>
                                    <span className="pe-1">{g.name}</span>
                                </td> 
                        }
                        <td className={"text-end" + (isPrimary ? "" : " fw-light")}
                            title={ColumnNames[idx]}
                            >{idx < 3 && Number(val) ? Number(val).toLocaleString() : val}</td>
                    </>
                )
            })
            :
            (
                <>
                    <td className="text-end">{g.name}</td>
                    <td className="text-center" colSpan="6">
                        <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </td>
                </>
            )
        return (
            <tr>{row}</tr>
        )
    });

    
    return (
        <div className="row" style={{minHeight:"200px"}}>
            <div className="col col-md-5">
                <table className="table table-sm table-hover table-striped" style={{maxHeight:"500px", overflowY:"auto"}}>
                    <tbody>
                        {charList}
                    </tbody>
                </table>
            </div>
            <div className="col col-md-7">
                <div className="row" style={{minHeight: "200px", maxWidth:"100%", overflowX:"auto"}}>
                    <div className="m-0 p-0">
                        <canvas
                            ref={canvasRef}
                            width="100%"
                            height="100%"
                            >
                        </canvas>
                    </div>
                </div>
                <table className="table table-sm border font-size-sm">
                    <tbody>
                        {/* <tr className="text-center">
                            <td></td>
                            <td>Counts - Total</td>
                            <td>Men+</td>
                            <td>Women+</td>
                            <td>Rates - Total</td>
                            <td>Men+</td>
                            <td>Women+</td>
                        </tr> */}
                        {selectedChInfo}
                    </tbody>
                </table>
                
                
            </div>
        </div>
    );
}

export default ContentViewCanvas;