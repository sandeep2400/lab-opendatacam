import React, { Component } from 'react'

import { connect } from 'react-redux';

import MenuCountingAreasEditor from './MenuCountingAreasEditor'

import { COLORS } from '../../utils/colors';

import { clearCountingArea, saveCountingArea, defaultCountingAreaValue } from '../../statemanagement/app/CounterStateManagement'

class CountingAreasEditor extends Component {

  constructor(props) {
    super(props);

    this.state = {
      editorInitialized: false
    }

    // Fabric.js state
    this.lines = {}
    this.mouseDown = false;
  }

  initListeners() {

    this.editorCanvas.on('mouse:down', (o) => {
      if(this.lines[this.props.selectedCountingArea]) {
        this.editorCanvas.remove(this.lines[this.props.selectedCountingArea])
      }
      this.mouseDown = true;
      let pointer = this.editorCanvas.getPointer(o.e);
      let points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
      this.lines[this.props.selectedCountingArea] = new fabric.Line(points, {
        strokeWidth: 5,
        fill: COLORS[this.props.selectedCountingArea],
        stroke: COLORS[this.props.selectedCountingArea],
        originX: 'center',
        originY: 'center'
      });
      this.editorCanvas.add(this.lines[this.props.selectedCountingArea]);
    });
    
    this.editorCanvas.on('mouse:move', (o) => {
      if (!this.mouseDown) return;
      let pointer = this.editorCanvas.getPointer(o.e);
      this.lines[this.props.selectedCountingArea].set({ x2: pointer.x, y2: pointer.y });
      
      // TODO STORE LINE DATA POINTS
      this.editorCanvas.renderAll();
    });
    
    this.editorCanvas.on('mouse:up', (o) => {
      let { x1, y1, x2, y2 } = this.lines[this.props.selectedCountingArea];
      this.props.dispatch(saveCountingArea(this.props.selectedCountingArea, {
        point1: { x1, y1},
        point2: { x2, y2},
        refWidth: this.editorCanvas.width, 
        refHeight: this.editorCanvas.height
      }))
      this.mouseDown = false;
    });
  }

  componentWillReceiveProps(newProps) {
    // We may have to delete some lines
    if(newProps.countingAreas !== this.props.countingAreas) {
      this.reRenderCountingAreasInEditor(newProps.countingAreas)
    }
  } 

  componentDidMount() {
    if(this.elCanvas) {
      
      // If no countingAreas exists already
      if(this.props.countingAreas.equals(defaultCountingAreaValue)) {
        const { width, height } = this.elCanvas.getBoundingClientRect();
        this.editorCanvas = new fabric.Canvas(this.elCanvas, { selection: false, width: width, height: height });
      } else {
        // If some counting areas exists already
        const { refWidth, refHeight } = this.props.countingAreas.find((val) => val !== null).toJS();
        this.editorCanvas = new fabric.Canvas(this.elCanvas, { selection: false, width: refWidth, height: refHeight });
        this.reRenderCountingAreasInEditor(this.props.countingAreas)
      }

      if(this.props.selectedCountingArea) {
        this.initListeners();
      }
    }
  }

  reRenderCountingAreasInEditor(countingAreas) {
    // Clear canvas 
    this.editorCanvas.clear();
    this.lines = {}

    countingAreas.map((area, color) => {
      if(area !== null) {
        let data = area.toJS();
        let points = [ data.point1.x1, data.point1.y1, data.point2.x2, data.point2.y2 ];
        this.lines[color] = new fabric.Line(points, {
          strokeWidth: 5,
          fill: COLORS[color],
          stroke: COLORS[color],
          originX: 'center',
          originY: 'center'
        });
        this.editorCanvas.add(this.lines[color]);
      }
    })
  }

  render () {

    const isEditing = Object.keys(this.props.countingAreas.toJS()).length > 0

    return (
      <div
        className="counting-areas-editor"
      >
        <MenuCountingAreasEditor />
        <canvas
          ref={(el) => this.elCanvas = el}
          width={1280}
          height={720}
          className="editor-canvas" />
        <style jsx>{`
          .counting-areas-editor,.editor-canvas  {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
          }

          @media (min-aspect-ratio: 16/9) {
            :global(.canvas-container),.editor-canvas {
              width: 100% !important;
              height: auto !important;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            :global(.canvas-container),.editor-canvas {
              width: auto !important;
              height: 100% !important;
            }
          }
        `}</style>
      </div>
    )
  }
}

export default connect((state) => {
  return {
    countingAreas: state.counter.get('countingAreas'),
    selectedCountingArea: state.counter.get('selectedCountingArea')
  }
})(CountingAreasEditor)
