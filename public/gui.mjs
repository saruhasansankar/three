import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';

let surveyCounter = 0

export function createGUI(logger) {
  const effectController = {

    /** 
     * METALITIX HELPER FUNCTIONS
     * The code below shows example usage of helper functions:
     *  - Stopping a session
     *  - Starting a new session
     *  - Manually prompting the user for their engagement level
     *  - Specifying the color theme of that prompt
     *  - Recording an event with a custom name
     *  - Recording a custom field metric
     */
    loggerPauseSession: () => logger.pauseSession(),
    loggerResumeSession: () => logger.resumeSession(),
    loggerShowSurveyWhite: async () => {
      logger.showSurvey();
      logger.setCustomField('surveyCounter', ++surveyCounter);
    },
    loggerShowSurveyBlack: async () => {
      logger.showSurvey('black');
      logger.logCustomEvent('change-theme');
      logger.setCustomField('surveyCounter', ++surveyCounter);
    },

    shininess: 40.0,
    ka: 0.17,
    kd: 0.51,
    ks: 0.2,
    metallic: true,

    hue: 0.121,
    saturation: 0.73,
    lightness: 0.66,

    lhue: 0.04,
    lsaturation: 0.01, // Non-zero so fractions show
    llightness: 1.0,
    vertexColors: false,

    lx: 0.32,
    ly: 0.39,
    lz: 0.7,
    newTess: 15,
    bottom: true,
    lid: true,
    body: true,
    fitLid: false,
    nonblinn: false,
    newShading: 'glossy'
  };

  let h;
  const gui = new GUI();

  h = gui.addFolder('Metalitix Logger');
  h.add(effectController, 'loggerPauseSession').name('Pause logging');
  h.add(effectController, 'loggerResumeSession').name('Resume logging');
  h.add(effectController, 'loggerShowSurveyWhite').name('Show survey manually (white theme)');
  h.add(effectController, 'loggerShowSurveyBlack').name('Show survey manually (black theme)');

  h = gui.addFolder('Material control');
  h.add(effectController, 'shininess', 1.0, 400.0, 1.0).name('shininess');
  h.add(effectController, 'kd', 0.0, 1.0, 0.025).name('diffuse strength');
  h.add(effectController, 'ks', 0.0, 1.0, 0.025).name('specular strength');
  h.add(effectController, 'metallic');
  h.close();

  h = gui.addFolder('Material color');
  h.add(effectController, 'hue', 0.0, 1.0, 0.025).name('hue');
  h.add(effectController, 'saturation', 0.0, 1.0, 0.025).name('saturation');
  h.add(effectController, 'lightness', 0.0, 1.0, 0.025).name('lightness');
  h.add(effectController, 'vertexColors');
  h.close();

  h = gui.addFolder('Lighting');
  h.add(effectController, 'lhue', 0.0, 1.0, 0.025).name('hue');
  h.add(effectController, 'lsaturation', 0.0, 1.0, 0.025).name('saturation');
  h.add(effectController, 'llightness', 0.0, 1.0, 0.025).name('lightness');
  h.add(effectController, 'ka', 0.0, 1.0, 0.025).name('ambient');
  h.close();

  h = gui.addFolder('Light direction');
  h.add(effectController, 'lx', -1.0, 1.0, 0.025).name('x');
  h.add(effectController, 'ly', -1.0, 1.0, 0.025).name('y');
  h.add(effectController, 'lz', -1.0, 1.0, 0.025).name('z');
  h.close();

  h = gui.addFolder('Tessellation control');
  h.add(effectController, 'newTess', [2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50]).name('Tessellation Level');
  h.add(effectController, 'lid').name('display lid');
  h.add(effectController, 'body').name('display body');
  h.add(effectController, 'bottom').name('display bottom');
  h.add(effectController, 'fitLid').name('snug lid');
  h.add(effectController, 'nonblinn').name('original scale');
  h.close();

  gui.add(effectController, 'newShading', [
        'wireframe',
        'flat',
        'smooth',
        'glossy',
        'textured',
        'normal',
        'reflective',
      ])
      .name('Shading');
  
  return effectController
}
