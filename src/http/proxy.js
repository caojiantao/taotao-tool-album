import $http from "@/http";
import { Toast } from "vant";

const proxy = options => {
  let toast = options.toast;
  let success = options.success;
  let error = options.error;
  if (toast) {
    Toast.loading({
      message: toast,
      forbidClick: true,
      overlay: true,
      duration: 0,
    });
  }
  $http(options).then((resp) => {
    if (toast) {
      Toast.clear();
    }
    if (success) {
      success(resp);
    }
  }).catch((e) => {
    if (error) {
      error(e);
    }
  });
}

export default proxy;