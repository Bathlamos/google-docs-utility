// Canvas-based Google Docs:
//   After May 2021, Google Docs makes a slow transition from HTML rendering to canvas rendering
//   We hijack, or monkey patch, key canvas methods to detect invisible lines and style them as dotted lines instead

const clazz = 'google-docs-utility-override' // duplicated in content.js

var elt = document.createElement('script')
elt.innerHTML = `
(() => { // don't leak

  // Monkey patch the getContext method
  const orig = window.HTMLCanvasElement.prototype.getContext
  window.HTMLCanvasElement.prototype.getContext = function () {
    try {
      const context = orig.apply(this, arguments)
      let cache = {} // don't redraw more than one overlapping line

      // Called to before redrawing; forget about overlapping lines so as to redraw
      const clearRect = context.clearRect
      context.clearRect = function () {
        clearRect.apply(context, arguments)
        cache = {}
      }

      const rect = context.rect
      context.rect = function () {
        // i.e. if the lines are small and don't reach the end of the page and the plugin is enabled
        if (context.lineWidth === 1 && arguments[0] > 5 && document.body.classList.contains('${clazz}')) { // 5 being the edge of the page
          // Keep previous state
          const lineDashOffset = context.lineDashOffset
          const strokeStyle = context.strokeStyle
          const lineDash = context.getLineDash()

          // Set dotted line
          context.setLineDash([4, 2])
          context.strokeStyle = '#00000038'
          context.beginPath()
          const [x, y, w, h] = arguments
          const combos = [
            [[x, y], [x + w, y]],
            [[x, y], [x, y + h]],
            [[x + w, y], [x + w, y + h]],
            [[x, y + h], [x + w, y + h]]
          ]
          combos.forEach(([a, b], i) => {
            const s = 10 // sensitivity: some lines are very close to one another
            const key = JSON.stringify([a.map(e => Math.round(e / s) * s), b.map(e => Math.round(e / s) * s)])
            if (!cache[key]) { // don't draw overlapping lines
              if (i <= 1){
                // The top and left sides of rectangles are offsetted by 1
                context.moveTo(...a.map(e => e - 1))
                context.lineTo(...b.map(e => e - 1))
              } else {
                context.moveTo(...a)
              context.lineTo(...b)
              }
              cache[key] = true
            }
          })
          context.stroke()
          context.closePath()

          // Reset the context
          context.setLineDash(lineDash)
          context.lineDashOffset = lineDashOffset
          context.strokeStyle = strokeStyle
        }
        rect.apply(context, arguments)
      }

      return context
    } catch (e) {
      console.error(e)
    }
  }

})()
`
;(document.head || document.documentElement).appendChild(elt)
