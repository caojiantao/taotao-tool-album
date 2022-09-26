export default {
  getPicUrl: (filename) => {
    return `${import.meta.env.VITE_PIC_PREFIX}/${filename}`;
  },
};
