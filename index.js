const MODEL_PATH = 'https://raw.githubusercontent.com/MatveiZhartun/5-tf-js-server/master/model/model.json';

class DrawingPad {
  constructor(model) {
    this.model = model;
    this.canvas = $('#canvas')[0]
    this.ctx = this.canvas.getContext("2d")
    this.isMouseClicked = false
    this.isMouseInCanvas = false
    this.prevX = 0
    this.currX = 0
    this.prevY = 0
    this.currY = 0
    this.data = null

    $('#canvas').on("mousemove", (e) => this.onMouseMove(e))
    $('#canvas').on("mousedown", (e) => this.onMouseDown(e))
    $('#canvas').on("mouseup", () => this.onMouseUp())
    $('#canvas').on("mouseout", () => this.onMouseOut())
    $('#canvas').on("mouseenter", (e) => this.onMouseEnter(e))
    $('#clear').on("click", () => this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height))
    
    console.log('[Canvas Initialized]')
  }
  
  onMouseDown(e) {
  	this.isMouseClicked = true
    this.updateCurrentPosition(e)
  }
  
  onMouseUp() {
  	this.isMouseClicked = false
  }
  
  onMouseEnter(e) {
  	this.isMouseInCanvas = true
    this.updateCurrentPosition(e)
  }
  
  onMouseOut() {
  	this.isMouseInCanvas = false
  }

  onMouseMove(e) {
    if (this.isMouseClicked && this.isMouseInCanvas) {
    	this.updateCurrentPosition(e)
      this.draw()

      const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
      this.pixels = _.filter(data, (_, i) => (i+1) % 4 === 0)
      this.predict()
    }
  }
  
  updateCurrentPosition(e) {
      this.prevX = this.currX
      this.prevY = this.currY
      this.currX = e.clientX - this.canvas.offsetLeft
      this.currY = e.clientY - this.canvas.offsetTop
  }
  
  draw() {
    this.ctx.beginPath()
    this.ctx.moveTo(this.prevX, this.prevY)
    this.ctx.lineTo(this.currX, this.currY)
    this.ctx.strokeStyle = "black"
    this.ctx.lineWidth = 2
    this.ctx.stroke()
    this.ctx.closePath()
  }

  predict() {
    const scaledData = _.map(this.pixels, (v) => v / 255)
    const dataTensor = tf.tensor2d([scaledData])
    const result = this.model.predict(dataTensor).arraySync()[0]

    _.forEach(result, (r, i) => $('#prob-' + i).text(Number(r).toFixed(10)))
  }
}

tf.loadLayersModel(MODEL_PATH).then(model => new DrawingPad(model))
