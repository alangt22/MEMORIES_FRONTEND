import axios from 'axios'

axios.defaults.baseURL = 'https://memoriesbackend-production.up.railway.app/'

axios.defaults.headers.post["Content-Type"] = 'application/json' 

axios.defaults.timeout = 10000

export default axios

// 

// 