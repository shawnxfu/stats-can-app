import { GEO_PR_LIST } from "../../app/geo_pr";

function NavLeftArea({selected, handleNavClick}) {
    let navLinks = GEO_PR_LIST.map(geo => {
        const isSelected = selected.id === geo.id;
        return (
            <li key={geo.id}>
                <a className={"btn btn-sm text-start " + (isSelected ? "btn-primary" : "btn-link")} 
                    onClick={() => handleNavClick(geo)}
                    >
                    {geo.name}
                </a>
            </li>
        );
    });

    return (
        <ul className="list-unstyled">
            {navLinks}
        </ul>
    );
}
export default NavLeftArea;