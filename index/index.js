import faceFilter from "../libs/jeelizFaceFilter.moduleNoDOM.js";
import JeelizResizer from "../libs/JeelizResizer.js";
import JeelizThreeHelper from "../libs/JeelizThreeHelper.js";
import neuralNetworkModel from "../neuralNets/NN_DEFAULT";
const vw = 288
const vh = 384
const arrayBuffer = new Uint8Array(vw * vh * 4); // vw and vh are video width and height in pixels
var FAKEVIDEOELEMENT = {
  isFakeVideo: true, //always true
  arrayBuffer: arrayBuffer, // the WeChat video arrayBuffer
  videoHeight: vh, // height in pixels
  videoWidth: vw, //width in pixels
  needsUpdate: true // boolean
};

Page({
  data: {
    width: 288,
    height: 384,
  },
  onReady: function () {
    const selector = wx.createSelectorQuery()
    selector.select('#webgl')
      .node(this.init.bind(this))
      .exec()
  },

  // callback: launched if a face is detected or lost
  detect_callback(faceIndex, isDetected) {
    if (isDetected) {
      console.log("INFO in detect_callback(): DETECTED");
    } else {
      console.log("INFO in detect_callback(): LOST");
    }
  },

  // build the 3D. called once when Jeeliz Face Filter is OK:
  init_threeScene(spec) {
    spec.threeCanvasId = "threeCanvas"; // enable 2 canvas mode
    const threeStuffs = JeelizThreeHelper.init(spec, this.detect_callback);

    // CREATE A CUBE
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshNormalMaterial();
    const threeCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    threeCube.frustumCulled = false;
    threeStuffs.faceObject.add(threeCube);

    //CREATE THE CAMERA
    THREECAMERA = JeelizThreeHelper.create_camera();
  },



  init(res) {
    const canvas = res.node
    const context = wx.createCameraContext()
    var isInitialized = false
    faceFilter.FAKEDOM.window.setCanvas(canvas)
    const listener = context.onCameraFrame((frame) => {
      if (!isInitialized) {
        isInitialized = true
        FAKEVIDEOELEMENT.arrayBuffer = new Uint8Array(frame.data)
        FAKEVIDEOELEMENT.videoWidth = frame.width
        FAKEVIDEOELEMENT.videoHeight = frame.height
        FAKEVIDEOELEMENT.needsUpdate = true
        faceFilter.init({
          canvas: canvas,
          videoSettings: {
            videoElement: FAKEVIDEOELEMENT
          },
          maxFacesDetected: 1,
          NNC: neuralNetworkModel,
          callbackReady: function (errCode, spec) {
            if (errCode) {
              console.log("AN ERROR HAPPENS. ERROR CODE =", errCode);
              return;
            }
            // [init scene with spec...]
            console.log("INFO: JEELIZFACEFILTER IS READY");
            //that.init_threeScene(spec);
          }, //end callbackReady()
          // called at each render iteration (drawing loop)
          callbackTrack: function (detectState) {
            //JeelizThreeHelper.render(detectState, THREECAMERA);
          }, //end callbackTrack()
        });
      } 
      else{
        // FAKEVIDEOELEMENT.arrayBuffer = new Uint8Array(frame.data)
        // FAKEVIDEOELEMENT.needsUpdate = true
      }
    })
    listener.start()
  }
})