import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

import 'vant/lib/index.css';
import { Button, PullRefresh, Grid, GridItem, Toast, Image, List, Cell, NavBar, ImagePreview, Form, Field, CellGroup, Uploader } from 'vant';
app.use(Button).use(PullRefresh).use(Grid).use(GridItem).use(Toast).use(Image).use(List).use(Cell).use(NavBar).use(ImagePreview).use(Form).use(Field).use(CellGroup).use(Uploader);

app.use(router)

app.mount('#app')
