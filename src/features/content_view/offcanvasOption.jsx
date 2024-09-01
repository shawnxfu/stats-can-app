import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { GEO_PR_LIST } from "../../app/geo_pr";
import { GEO_CMACA_LIST } from "../../app/geo_cmaca";
import { setCompareWith, selectCompareWith, selectGeo } from "./contentSlice";
import { parseSearchParams } from "../../app/utils";

function OffcanvasOption() {
    const [isShowing, setIsShowing] = useState(false);
    const selectedGeo = useSelector(selectGeo);
    const compareWith = useSelector(selectCompareWith);
    const [selectedArray, setSelectedArray] = useState([]);
    const [search, setSearch] = useState("");
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const params = parseSearchParams(searchParams);

    useEffect(() => {
        if (!isShowing) return;
        if (compareWith?.length > 0) {
            setSelectedArray([...compareWith]);
        }
    }, [isShowing, compareWith]);


    function handleSearchChange(e) {
        e.preventDefault();
        const val = e.target.value;
        setSearch(val);
    }

    const selectedList = selectedArray.map(s => {
        return (
            <div className="rounded border float-sm-start ms-1 ps-1">
                {s.name}
                <button className="btn btn-sm btn-outline-default"
                    title="Remove from comparison"
                    onClick={() => removeItem(s)}
                    >X</button>
            </div>
        );
    })

    function addItem(geo) {
        if (geo.id === selectedGeo.id)return;
        const existed = selectedArray.filter(s => s.id === geo.id);
        if (existed && existed?.length === 0) {
            setSelectedArray([...selectedArray, geo]);
        }
        setSearch("");
    }

    function removeItem(geo) {
        const newSelection = selectedArray.filter(s => s.id !== geo.id);
        setSelectedArray([...newSelection]);
    }

    function close() {
        setIsShowing(false);
        dispatch(setCompareWith(selectedArray));
        const ids = selectedArray.map(s => s.id);
        if (ids.length > 0) {
            params['compare'] = ids.join(",");
        } else {
            delete params['compare'];
        }
        setSearchParams(`?${new URLSearchParams(params)}`)
        setSelectedArray([]);
    }

    const prList = GEO_PR_LIST.map(p => {
        return (
            <div>
                <a className="btn btn-sm text-start" key={p.id}
                    title="Add to comparison"
                    onClick={() => addItem(p)}
                    >{p.name}</a>
            </div>
        );
    })

    const cmacaList = GEO_CMACA_LIST.filter(p => p.name.toLowerCase().indexOf(search.toLowerCase()) >= 0)
        .map(p => {
            return (
                <div>
                    <a className="btn btn-sm text-start" key={p.id}
                        title="Add to comparison"
                        onClick={() => addItem(p)}
                        >{p.name}</a>
                </div>
            );
    })

    return (
        <>
            <div>
                <button className="btn btn-sm btn-outline-dark" onClick={() => setIsShowing(true)}>
                    Compare with { compareWith?.length > 0 ? compareWith.slice(0, 2).map(c => c.name).join(", ") + (compareWith.length > 2 ? " and more" : "") : ""}
                </button>
            </div>
            <div className={"offcanvas offcanvas-end" + (isShowing ? " show" : "")} tabIndex="-1">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Compare with:</h5>
                    <button className="btn-close"
                        onClick={() => close()}
                        ></button>
                </div>
                <div className="offcanvas-body text-start">
                    <div className="row mb-1">
                        <div className="float-sm-start">
                            {selectedList}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col col-md-6">
                        {prList}
                        </div>

                        <div className="col col-md-6">
                            <div className="input-group input-group-sm mb-1">
                                <input className="form-control" placeholder="Type to search" value={search}
                                        onChange={(e) => handleSearchChange(e)}>
                                </input>
                            </div>
                            {cmacaList}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OffcanvasOption;