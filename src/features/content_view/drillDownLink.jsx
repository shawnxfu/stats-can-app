function DrillDownLink({root, ch, handleItemClick}) {
    if (root.id !== ch.id && ch.child_ids?.length > 0) {
        return (
            <div className="container-fluid m-0 p-0">
                <label className="float-sm-start text-start" title={ch.name}>{ch.name}
                </label>
                <a className="float-sm-end btn btn-link m-0 p-0"
                        onClick={()=>handleItemClick(ch)}
                        title="Click to see breakdown details"
                    >{'>>'}</a>
            </div>
        )
    }
    return (
        <label className="text-start" title={ch.name}>{ch.name}</label>
    )
}

export default DrillDownLink;