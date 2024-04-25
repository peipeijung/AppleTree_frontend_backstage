import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import { useUserStore } from "./stores/userStore";

const API_URL = 'http://localhost:8080/mall'

//予許axios每次請求,都自動附帶跨域cookie
axios.defaults.withCredentials = true;

//刷新頁面時，如果session有登入資料，則還原pinia
axios.get(`${API_URL}/user/check`).then((rs) => {
    if (rs.data) {
        const loggedInMember = JSON.parse(sessionStorage.getItem("loggedInMember"));
        useUserStore().loginSuccess(loggedInMember);
    }
});

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.config.globalProperties.API_URL = API_URL;
app.mount('#app')
