import faceFilter from "../libs/jeelizFaceFilter.moduleNoDOM.js";
import JeelizResizer from "../libs/JeelizResizer.js";
import JeelizThreeHelper from "../libs/JeelizThreeHelper.js";
import neuralNetworkModel from "../neuralNets/NN_DEFAULT";
import {createScopedThreejs} from 'threejs-miniprogram'
const vw = 288
const vh = 384
var THREECAMERA = undefined
const arrayBuffer = new Uint8Array(vw * vh * 4); // vw and vh are video width and height in pixels
var FAKEVIDEOELEMENT = {
  isFakeVideo: true, //always true
  arrayBuffer: arrayBuffer, // the WeChat video arrayBuffer
  videoHeight: vh, // height in pixels
  videoWidth: vw, //width in pixels
  needsUpdate: true // boolean
};
var camera, scene, renderer;
var mesh;
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
  init_threeScene(canvas,THREE) {
    camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 1, 1000);
    camera.position.z = 400;
    scene = new THREE.Scene();
    var geometry = new THREE.BoxBufferGeometry(200, 200, 200);
    var material = new THREE.LineBasicMaterial( { color: Math.random() * 0xffffff } )
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
    renderer.setSize(canvas.width, canvas.height);
    //renderer.render(scene, camera);
  },



  init(res) {
    const canvas = res.node
    const context = wx.createCameraContext()
    var isInitialized = false
    var that = this;
    const THREE = createScopedThreejs(canvas)
    console.log('init')
    //that.init_threeScene(canvas,THREE);

    faceFilter.FAKEDOM.window.setCanvas(canvas)
    const listener = context.onCameraFrame((frame) => {
      if (!isInitialized) {
        console.log('initialized')
        isInitialized = true
        FAKEVIDEOELEMENT.arrayBuffer = new Uint8Array(frame.data)
        FAKEVIDEOELEMENT.videoWidth = frame.width
        FAKEVIDEOELEMENT.videoHeight = frame.height
        FAKEVIDEOELEMENT.needsUpdate = true
        faceFilter.init({
          followZRot: true,
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

          }, //end callbackReady()
          // called at each render iteration (drawing loop)
          callbackTrack: function (detectState) {
            //renderer.render(scene, camera);

            console.log(detectState);
           // JeelizThreeHelper.render(detectState, THREECAMERA,THREE);
          }, //end callbackTrack()
        });
      } 
      else{
        renderer.render(scene, camera);
       console.log(detectState)
        FAKEVIDEOELEMENT.arrayBuffer = new Uint8Array(frame.data)
        FAKEVIDEOELEMENT.needsUpdate = true
      }
    })
   listener.start()
  }
})