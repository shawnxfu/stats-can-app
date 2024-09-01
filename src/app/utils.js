import { GEO_PR_LIST } from "./geo_pr";
import { GEO_CMACA_LIST } from "./geo_cmaca";

export function parseSearchParams(search) {
    const query = new URLSearchParams(search);

    const params = {};
    for (let p of query.entries()) {
        params[p[0]] = p[1];
    }

    return params;
}

export function findGeoById(geo_id) {
    let geo = GEO_PR_LIST.find(p => p.id === geo_id);
    if (!geo) {
        geo = GEO_CMACA_LIST.find(p => p.id == geo_id);
    }
    return geo;
}