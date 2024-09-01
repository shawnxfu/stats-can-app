import { TOPIC_NAMES } from "../../app/topics";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectGeo, setSelectedGeo } from "../content_view/contentSlice";
import TopicCardItem from "./topicCardItem";
import { parseSearchParams, findGeoById } from "../../app/utils";

function TopicCard() {
    const selectedGeo = useSelector(selectGeo);
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const params = parseSearchParams(searchParams);
    const geo_id = params['geo_id'];

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
        return (<><span>Invalid geo: {geo}</span></>)
    }

    let rowNum = Math.floor(TOPIC_NAMES.length / 3);
    let rows = Object.keys(Array(rowNum).fill()).map(index => {
        return (
            <div className="row mb-2">
                <div className="col-lg-4">
                    <TopicCardItem
                        key={geo.id+index+"1"}
                        geo_id={geo.id}
                        topicName={TOPIC_NAMES[index*3]}
                        >
                    </TopicCardItem>
                </div>
                <div className="col-lg-4">
                    <TopicCardItem
                        key={geo.id+index+"2"}
                        geo_id={geo.id}
                        topicName={TOPIC_NAMES[index*3+1]}
                        >
                    </TopicCardItem>
                </div>
                <div className="col-lg-4">
                    <TopicCardItem
                        key={geo.id+index+"3"}
                        geo_id={geo.id}
                        topicName={TOPIC_NAMES[index*3+2]}
                        >
                    </TopicCardItem>
                </div>
            </div>
        );
    });

    let breadcrumbList = Object.keys(Array(1).fill()).map(index => {
        return (
            <li key={geo.id+index} className="breadcrumb-item">
                <a href={'/topic'}>{geo.name}</a>
            </li>
        );
    });


    return (
        <>
            <div className="container-fluid">
                <nav aria-label="breadcrumb" key={geo.id}>
                    <ul className="breadcrumb">
                        {breadcrumbList}
                    </ul>
                </nav>
            </div>
            <div className="container-fluid">
                {rows}
            </div>
        </>
    );
}

export default TopicCard;