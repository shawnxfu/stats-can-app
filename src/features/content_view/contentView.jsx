import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectGeo, setSelectedGeo } from "../content_view/contentSlice";
import { TOPICS } from "../../app/topics";
import { CHARACTERISTICS } from "../../app/characteristics";
import ContentViewItem from "./contentViewItem";
import OffcanvasOption from "./offcanvasOption";
import Error from "../error";
import { parseSearchParams, findGeoById } from "../../app/utils";


function ContentView() {
    const selectedGeo = useSelector(selectGeo);
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const params = parseSearchParams(searchParams);
    const geo_id = params['geo_id'];
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedGeo.id && geo_id !== selectedGeo.id) {
            params['geo_id'] = selectedGeo.id;
            setSearchParams(`?${new URLSearchParams(params)}`)
        }
        if (!selectedGeo?.id && geo_id) {
            const geo = findGeoById(geo_id);
            if (geo) {
                dispatch(setSelectedGeo(geo));
            }
        }
    }, [geo_id, selectedGeo, params]);

    const geo = findGeoById(geo_id);
    if (!geo) {
        return (<>Invalid GEO ID</>);
    }

    const topicId = params['topic_id'];
    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) {
        const params = {'geo_id': geo.id};
        navigate(`/topic?${new URLSearchParams(params)}`);
        return (<></>);
    }

    const cidArray = params['c_id']?.split(",") || [];

    const accordionList = CHARACTERISTICS.filter(c => c.tid === topicId)
        .map((ch) => {
            const isOpen = cidArray?.[0] === ch.id;
            return (
                <ContentViewItem 
                    geo={geo} 
                    rootCharacteristic={ch} 
                    open={isOpen}
                    key={ch.id}
                >
                </ContentViewItem>
            )       
    });

    function handleBreadcrumbClick() {
        navigate("/topic");
    }

    return (
        <>
            <div className="container-fluid">
                <div className="row mt-1">
                    <div className="col col-md-6">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a className="btn-link" title="Back to topics"
                                        onClick={() => handleBreadcrumbClick()}>{geo.name}</a></li>
                                <li className="breadcrumb-item">{topic.name}</li>
                            </ol>
                        </nav>
                    </div>
                    <div className="col col-md-6">
                        <div className="row text-end">
                            <OffcanvasOption>
                            </OffcanvasOption>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="container-fluid" style={{overflowY:"scroll", maxHeight:"800px"}}>
                <div className="accordion">
                    {accordionList}
                </div>
                    
            </div>
           
        </>
    );
}

export default ContentView;