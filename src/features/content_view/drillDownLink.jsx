function DrillDownLink({root, ch, handleItemClick}) {
    if (root.id !== ch.id && ch.child_ids?.length > 0) {
        return (
            <div className="container-fluid m-0 p-0">
                <div className="row">
                    <div className="col col-md-11">
                        <label className="float-sm-start text-start" title={ch.name}>{ch.name}
                        </label>
                    </div>
                    <div className="col col-md-1">
                        <a className="float-sm-end icon-link-hover m-0 p-0"
                            onClick={()=>handleItemClick(ch)}
                            title="Click to see breakdown details"
                            >{'>>'}
                        </a>
                    </div>
                </div>
                
                
            </div>
        )
    }
    return (
        <label className="text-start" title={ch.name}>{ch.name}</label>
    )
}

export default DrillDownLink;