let canvasToFile = (canvas) => {
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 1));
}
let parseExtOnCanplay = (v, c, delay) => {
  return new Promise(resolve => {
    let ctx = c.getContext('2d');
    v.addEventListener('canplay', async () => {
      var w = v.videoWidth
      var h = v.videoHeight
      c.width = w
      c.height = h
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(v, 0, 0, w, h)
      let coverFile = await canvasToFile(c).then(blob => { return blob; })
      let ext = {
        coverFile: coverFile,
        second: Math.round(v.duration),
      }
      v.pause();
      resolve(ext);
    }, false)
  })
}

let parseVideo = (fileUrl) => {
  var v = document.getElementById("tao-video");
  v.src = fileUrl;
  var c = document.getElementById("tao-canvas")
  var delay = 100
  return parseExtOnCanplay(v, c, delay);
}

export {
  parseVideo
}