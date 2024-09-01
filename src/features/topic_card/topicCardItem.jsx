import { TOPICS } from "../../app/topics";
import { CHARACTERISTICS } from "../../app/characteristics";
import { useNavigate } from "react-router-dom";


function TopicCardItem({geo_id, topicName}) {
    const navigate = useNavigate();

    const topic = TOPICS.filter(t => t.name === topicName)[0];
    const chList = CHARACTERISTICS.filter(c => c.tid === topic.id);
    let cardText = chList.slice(0, 2)
        .map(ch => {
            return (
                <li key={ch.id} className="text-truncate" title={ch.name}>
                    {ch.name}
                </li>
            );
        });
    
    function handleCardClick() {
        const params = {
            'geo_id': geo_id,
            'topic_id': topic.id,
        }
        navigate(`/view?${new URLSearchParams(params)}`);
    }

    return (
        <>
            <div className="card" onClick={() => handleCardClick()}>
                <div className="card-body">
                    <h5 className="card-title">{topic.name}</h5>
                    <div className="card-text">
                        <ul>
                            {cardText}
                            {chList.length > 2 &&
                                ( <li key="more">{chList.length-2} more ...</li> )
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TopicCardItem;