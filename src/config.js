export default {
  getFileUrl: (filename, path) => {
    return `${import.meta.env.VITE_PIC_PREFIX}/${path}/${filename}`;
  },
  fmtSecond: (t) => {
    let result = [];
    for (let i = 0; t != 0 || i < 2; i++) {
      let n = t % 60;
      t = Math.floor(t / 60);
      let flag = (n < 10) && (i == 0 || t != 0);
      result.push((flag ? "0" : "") + n);
    }
    return result.reverse().join(":")
  }
};
