import { useState } from "react";
import { useNavigate, useLocation, useSearchParams  } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCompareWith, setCompareWith, selectGeo, setSelectedGeo } from "../content_view/contentSlice";
import { parseSearchParams } from "../../app/utils";
import NavLeftArea from "./navLeftArea";
import NavLeftCity from "./navLeftCity";

function NavLeft() {
    const selectedGeo = useSelector(selectGeo);
    const compareWith = useSelector(selectCompareWith);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showArea, setShowArea] = useState(selectedGeo ? true : (selectedGeo?.type === 1 ? true : false));
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const params = parseSearchParams(searchParams);

    function handleNavClick(geo) {
        dispatch(setSelectedGeo(geo));
        if (compareWith?.length > 0) {
            const filtered = compareWith.filter(g => g.id !== geo.id);
            if (filtered?.length < compareWith.length) {
                if (filtered?.length === 0) {
                    delete params['compare'];
                } else {
                    params['compare'] = filtered.map(c => c.id).join(",")
                }
                setSearchParams(`?${new URLSearchParams(params)}`)
                dispatch(setCompareWith(filtered));
            }
        }
        if (location.pathname.indexOf("/view") === 0) {
            // ignore
        } else if (location.pathname.indexOf("/topic") !== 0) {
            navigate("/topic");
        }
    }

    return (
        <>
        <ul className="nav nav-tabs">
            <li className="nav-item">
                <a className={"btn btn-sm nav-link" + (showArea ? " active" : "")}
                    onClick={() => setShowArea(true)}
                    >Region</a>
            </li>
            <li className="nav-item">
                <a className={"btn btn-sm nav-link" + (!showArea ? " active" : "")}
                    onClick={() => setShowArea(false)}
                    >City</a>
            </li>
        </ul>
        {
            showArea ? ( 
                    <NavLeftArea 
                        selected={selectedGeo} 
                        handleNavClick={handleNavClick}>
                    </NavLeftArea>
                )
                : 
                (
                    <NavLeftCity 
                        selected={selectedGeo} 
                        handleNavClick={handleNavClick}>
                    </NavLeftCity>

                )
        }
        
        </>
    );
}

export default NavLeft;