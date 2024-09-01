import { useSelector } from "react-redux";
import DrillDownLink from "./drillDownLink";
import { selectAllCharacteristics, selectCompareWith } from "./contentSlice";

function ContentViewTable({geo, ids, root, handleItemClick}) {
    const allChs = useSelector(selectAllCharacteristics);
    const compareWith = useSelector(selectCompareWith);

    if (!ids) return (<></>);

    const geoArray = [geo, ...compareWith];
    const tableRows = ids.map(id => { 
        const ch = allChs[id];
        if (!ch) return (<></>);

        return geoArray.map(g => {
            const data = ch?.data?.[g.id];
            let dataColumns;
            if (data) {
                dataColumns = Object.values(data).map((val, idx) => {
                    return (
                        <td className="text-end">{idx < 3 && Number(val) ? Number(val).toLocaleString() : val}</td>
                    );
                });
            } else {
                dataColumns = Array(1).fill(1).map(val => {
                    return (
                        <>
                            <td className="text-center" colSpan="6">
                                <div className="spinner-border text-info" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </td>
                        </>
                    );
                });
            }
            if (g.id === geo.id) {
                return (
                    <tr>
                        <td width="48%">
                            <DrillDownLink root={root} ch={ch} handleItemClick={handleItemClick}></DrillDownLink>
                        </td>
                        {dataColumns}
                    </tr>
                );
            } else {
                return (
                    <tr className="fw-light">
                        <td width="48%" className="text-truncate text-end" title={"Compare with " + g.name}>
                            <span className="pe-3">{g.name}</span>
                        </td>
                        {dataColumns}
                    </tr>

                );
            }
            
        });
        
    });
    
    return (
        <table className="table table-sm table-hover table-striped">
            <tbody>
                <tr>
                    <th></th>
                    <th className="text-center" colSpan={3}>Counts</th>
                    <th className="text-center" colSpan={3}>Rates(%)</th>
                </tr>
                <tr>
                    <th></th>
                    <th>Total</th>
                    <th>Men+</th>
                    <th>Women+</th>
                    <th>Total</th>
                    <th>Men+</th>
                    <th>Women+</th>
                </tr>
                {tableRows}
            </tbody>
        </table>
    )
}

export default ContentViewTable;