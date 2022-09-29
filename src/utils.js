let canvasToFile = (canvas) => {
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 1));
}
let parseExtOnCanplay = (v, c, delay) => {
  return new Promise(resolve => {
    let ctx = c.getContext('2d');
    v.addEventListener('canplay', async () => {
      var w = v.videoWidth
      var h = v.videoHeight
      ctx.drawImage(v, 0, 0, w, h)
      let coverFile = await canvasToFile(c).then(blob => { return blob; })
      let ext = {
        coverFile: coverFile,
        seconds: Math.round(v.duration),
      }
      resolve(ext);
    }, false)
  })
}

let parseVideo = async (fileUrl) => {
  var v = document.createElement("video");
  v.autoplay = true;
  v.src = fileUrl;
  var c = document.createElement("canvas")
  var delay = 100
  return await parseExtOnCanplay(v, c, delay);
}

export {
  parseVideo
}