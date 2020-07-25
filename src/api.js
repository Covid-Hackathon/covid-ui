import axios from 'axios';

const api = axios.create({
    baseURL: 'http://52.149.152.176:3000'
});

const getCountries = async () => {
    return await api.get('/countries');
}

const getRegions = async (country) => {
    let nameDivision = 'regions';
    if(country === 'India') {
        nameDivision = 'states'
    }
    return await api.get(`/countries/${country}/${nameDivision}`);
}

const getPrediction = async (country, region) => {
    return await api.get(`/countries/${country}/predict/${region}`);
}

const getPast = async (country, region) => {
    return await api.get(`/countries/${country}/past/${region}`);
}

export default {
    getCountries,
    getRegions,
    getPast,
    getPrediction
}

