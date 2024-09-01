import { useState } from "react";
import { GEO_CMACA_LIST, POPULAR_LIST } from "../../app/geo_cmaca";

function NavLeftCity({selected, handleNavClick}) {
    const [search, setSearch] = useState("");

    function handleSearchChange(e) {
        e.preventDefault();
        const val = e.target.value;
        setSearch(val);
    }

    const popularNavList = POPULAR_LIST.map(geo => {
        const isSelected = selected.id === geo.id;
        return (
            <div className="rounded border float-sm-start ms-1" key={geo.id}>
                <a className={"btn btn-sm " + (isSelected ? "btn-primary" : "btn-link")}
                    onClick={() => handleNavClick(geo)}
                    >{geo.name}</a>
            </div>
        );
    });
    
    let cityNavLinks = GEO_CMACA_LIST.filter(geo => geo.name.toLowerCase().indexOf(search.toLowerCase()) >= 0)
        .map(geo => {
            const isSelected = selected.id === geo.id;
            return (
                <li key={"city-nav-" + geo.id}>
                    <a className={"btn btn-sm text-start " + (isSelected ? "btn-primary" : "btn-link")} 
                        onClick={() => handleNavClick(geo)}
                        >
                        {geo.name}
                    </a>
                </li>
            );
    });

    return (
        <div>
            <div className="row text-start">
                <div className="row ms-1">
                    Popular:
                </div>
                <div>
                    {popularNavList}
                </div>
            </div>
            <hr></hr>
            <div className="row" style={{overflowY:"auto", maxHeight:"400px"}}>
                <div className="input-group input-group-sm mb-1">
                    <input className="form-control" placeholder="Type to search"
                            onChange={(e) => handleSearchChange(e)}>
                    </input>
                </div>
                <ul className="list-unstyled">
                    {cityNavLinks}
                </ul>
            </div>
        </div>
    );
}
export default NavLeftCity;