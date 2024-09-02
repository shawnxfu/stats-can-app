import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ContentViewTable from "./contentViewTable";
import ContentViewCanvas from "./contentViewCanvas";
import { findGeoById, parseSearchParams } from "../../app/utils";
import { fetchCharacteristics, fetchStats, 
    selectAllCharacteristics, 
    selectPendingCharacteristicIds, 
    selectPendingStatsIds,
    selectCompareWith, 
    selectCharacteristicsData, 
    setCompareWith} from "./contentSlice";

function ContentViewItem({geo, rootCharacteristic, open}) {
    const [isOpen, setIsOpen] = useState(open);
    const [root, setRoot] = useState(rootCharacteristic);
    const [showTable, setShowTable] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const viewRef = useRef(null);

    const allChs = useSelector(selectAllCharacteristics);
    
    const pendingChsIds = useSelector(selectPendingCharacteristicIds);
    const pendingStatsIds = useSelector(selectPendingStatsIds);
    const compareWith = useSelector(selectCompareWith);

    const dispatch = useDispatch();
    const params = parseSearchParams(searchParams);
    let cidArray = params['c_id']?.split(",") || [];

    let ids = root['child_ids'] ? [root.id, ...root['child_ids']] : [root.id];
    const allChsData = useSelector(selectCharacteristicsData);
    
    // loading data
    useEffect(() => {
        if (!isOpen) return;
        loadDataByIds(ids);
    }, [isOpen, ids, allChs, allChsData, compareWith]);
    
    // apply search params if applicable
    useEffect(() => {
        if (!isOpen) return;
        if (cidArray.length > 1) {
            for (let i=0; i<cidArray.length-1; i++) {
                if (cidArray[i] === root.id) {
                    const next = cidArray[i+1];
                    if (allChs?.[root.id]?.child_ids?.indexOf(next)) {
                        if (allChs[next]) {
                            setRoot(allChs[next]);
                            break;
                        }
                    }
                }
            }
        }
        if (params?.['chart']) {
            setShowTable(false);
        }
        if (params?.['compare']) {
            const compareIds = params?.['compare']?.split(",");
            if (compareIds?.length > 0 && compareWith.length == 0) {
                const compareWithArray = compareIds.map(id => findGeoById(id));
                dispatch(setCompareWith(compareWithArray));
            }
        }

    }, [isOpen, params, cidArray, allChs, root]);

    useEffect(() => {
        if (isOpen && viewRef.current && viewRef.current.scrollIntoView) {
            viewRef.current.scrollIntoView();
        }
    }, [isOpen, viewRef]);

    function isEqualArray(array1, array2) {
        return array1.length === array2.length && 
            array1.every((value, index) => value === array2[index]);
    }

    function loadDataByIds(ids) {
        let pendingIds = ids.filter(id => id && !allChs[id] && !pendingChsIds[id]);
        if (pendingIds.length > 0) {
            if (pendingIds.length > 10) {
                pendingIds = pendingIds.slice(0, 10);
            }
            // console.log("loading chars: " + pendingIds);
            dispatch(fetchCharacteristics({codes:pendingIds}));
        } else {   
            const geoPrArray = [geo, ...compareWith].filter(g => g.type === 1);
            let args = getPendingGeosAndIds(geoPrArray, ids);
            if (args.isPending) {
                dispatch(fetchStats(args));
            } else {
                const geoCmacaArray = [geo, ...compareWith].filter(g => g.type !== 1);
                args = getPendingGeosAndIds(geoCmacaArray, ids);
                if (args.isPending) {
                    dispatch(fetchStats(args));
                }
            }
        }
    }

    function getPendingGeosAndIds(geoArray, ids) {
        const geoMap = {};
        const idMap = {};
        let isPending = false;
        geoArray.forEach(geo => {
            const idArray = ids.filter(id => !allChs[id]?.['data']?.[geo.id] && !pendingStatsIds[id]);
            if (idArray?.length > 0) {
                geoMap[geo.id] = geo;
                idArray.forEach(id => idMap[id] = id);
                isPending = true;
            }
        });
        return {
            geos: Object.values(geoMap).slice(0, 10), 
            codes: Object.values(idMap).slice(0, 10),
            isPending: isPending
        };
    }

    function handleShowAccordion() {
        if (!isOpen) {
            if (cidArray?.[0] !== rootCharacteristic.id) {
                cidArray = [rootCharacteristic.id];
                params['c_id'] = cidArray.join(",");
                setSearchParams(`?${new URLSearchParams(params)}`)
            }
            loadDataByIds(ids);
        }
        setIsOpen(!isOpen);
    }

    function switchTableChart() {
        if (showTable) {
            params['chart'] = true;
        } else {
            delete params['chart'];
        }
        setSearchParams(`?${new URLSearchParams(params)}`)
        setShowTable(!showTable);
    }

    function handleItemClick(ch) {
        if (ch.child_ids && ch.child_ids?.length > 0) {
            const ids = [ch.id, ...ch['child_ids']];
            loadDataByIds(ids);
            setRoot(ch);
            params['c_id'] = [...cidArray, ch.id];
            setSearchParams(`?${new URLSearchParams(params)}`)
        }
    }

    function handleLinkClick(chLink) {
        setRoot(chLink);
        let newCidArray = [];
        let ch = chLink;
        while (ch.parent_id) {
            newCidArray.unshift(ch.id);
            ch = allChs[ch.parent_id];
        }
        newCidArray.unshift(rootCharacteristic.id);
        if (!isEqualArray(newCidArray, cidArray)) {
            params['c_id'] = newCidArray.join(",");
            setSearchParams(`?${new URLSearchParams(params)}`)
        }
    }

    let links = (<></>);
    
    if (rootCharacteristic.id !== root.id) {
        const linkArray = [];
        let ch = allChs[root?.['parent_id']];
        while (ch && ch['parent_id'] && ch['id'] !== rootCharacteristic.id) {
            linkArray.unshift(ch);
            ch = allChs[ch['parent_id']]
        }
        linkArray.unshift(rootCharacteristic);

        links = linkArray.map(ch => {
            return (
                <>
                    <a className="btn btn-sm btn-outline-success text-truncate" style={{width:"9em"}}
                        title={"Back to " + ch.name} key={ch.id}
                        onClick={() => handleLinkClick(ch)}>
                        {ch.name}
                    </a>
                </>
            );
        })
    }
    

    return (
        <>
            <div className="accordion-item mb-1" ref={viewRef} key={rootCharacteristic.id}>
                <h2 className="accordion-header">
                    <button className={"accordion-button " + (isOpen ? "collapsed" : "show")}
                        type="button" onClick={() => handleShowAccordion()}
                        aria-expanded={isOpen ? "true" : "false"}>
                        {rootCharacteristic.name}
                    </button>
                </h2>
                <div className={"accordion-collapse " + (isOpen ? "show" : "collapse")}>
                    <div className="accordion-body">
                        <div className="container-fluid">
                            <div className="row mb-2">
                                <div className="col-md-10 text-start">
                                    <div className="btn-group" role="group">
                                        {links}
                                    </div>
                                </div>
                                <div className="col-md-2 text-start">
                                    <div className="form-check form-switch">
                                        <label className="form-check-label">Table/Chart</label>
                                        <input className="form-check-input btn btn-sm btn-primary" type="checkbox" checked={!showTable} 
                                            onChange={() => switchTableChart()}
                                            title={showTable ? "Switch to chart" : "Switch to table"}
                                            ></input>
                                    </div>
                                </div>

                            </div>
                            
                            { showTable ? (
                                <ContentViewTable
                                    geo={geo}
                                    ids={ids}
                                    root={root}
                                    handleItemClick={handleItemClick}
                                ></ContentViewTable>
                            ) : (
                                <ContentViewCanvas
                                    geo={geo}
                                    ids={ids}
                                    root={root}
                                    handleItemClick={handleItemClick}
                                >
                                </ContentViewCanvas>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContentViewItem;