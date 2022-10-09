import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

import 'vant/lib/index.css';
import { Button, PullRefresh, Grid, GridItem, Toast, Image, List, Cell, NavBar, ImagePreview, Form, Field, CellGroup, Uploader, Loading, ConfigProvider, Icon, ActionSheet, Popover, CheckboxGroup, Checkbox } from 'vant';
app.use(Button).use(PullRefresh).use(Grid).use(GridItem).use(Toast).use(Image).use(List).use(Cell).use(NavBar).use(ImagePreview).use(Form).use(Field).use(CellGroup).use(Uploader).use(Loading).use(ConfigProvider).use(Icon).use(ActionSheet).use(Popover).use(CheckboxGroup).use(Checkbox);

import './assets/main.css'

app.use(router)

app.mount('#app')
