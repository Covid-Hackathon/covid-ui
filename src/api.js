import axios from 'axios';

const api = axios.create({
    baseURL: 'http://52.149.152.176:3000'
});

const getCountries = async () => {
    return await api.get('/countries');
}

const getRegions = async (country) => {
    let nameDivision = 'states';
    if(['Russia'].includes(country)) {
        nameDivision = 'regions'
    }
    return await api.get(`/countries/${country}/${nameDivision}`);
}

const getDistricts = async (country, region) => {
    return await api.get(`/countries/${country}/districts/${region}`);
}

const getPredictionRegion = async (country, region) => {
    return await api.get(`/countries/${country}/predict/${region}`);
}

const getPastRegion = async (country, region) => {
    return await api.get(`/countries/${country}/past/${region}`);
}

const getPredictionDistrict = async (country, district) => {
    return await api.get(`/countries/${country}/predict?district=${district}`);
}

const getPastDistrict = async (country, district) => {
    return await api.get(`/countries/${country}/past?district=${district}`);
}

const getHeatFactorsCountry = async (country) => {
    return await api.get(`/countries/${country}/heatfactors`);
}

const getHeatFactorsRegion = async (country, region) => {
    return await api.get(`/countries/${country}/heatfactors/${region}`);
}

export default {
    getCountries,
    getRegions,
    getDistricts,
    getPastRegion,
    getPredictionRegion,
    getPastDistrict,
    getPredictionDistrict,
    getHeatFactorsCountry,
    getHeatFactorsRegion
}

// http://52.149.152.176:3000/countries/India/past?district=Ahmednagar
// 52.149.152.176:3000/countries/India/predict?district=Ahmednagar