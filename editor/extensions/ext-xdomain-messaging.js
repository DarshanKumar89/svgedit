import svgEditor from '../svg-editor.js';
/**
* Should not be needed for same domain control (just call via child frame),
*  but an API common for cross-domain and same domain use can be found
*  in embedapi.js with a demo at embedapi.html
*/
svgEditor.addExtension('xdomain-messaging', function () {
  const svgCanvas = svgEditor.canvas;
  try {
    window.addEventListener('message', function (e) {
      // We accept and post strings for the sake of IE9 support
      if (typeof e.data !== 'string' || e.data.charAt() === '|') {
        return;
      }
      const data = JSON.parse(e.data);
      if (!data || typeof data !== 'object' || data.namespace !== 'svgCanvas') {
        return;
      }
      // The default is not to allow any origins, including even the same domain or if run on a file:// URL
      //  See config-sample.js for an example of how to configure
      const {allowedOrigins} = svgEditor.curConfig;
      if (!allowedOrigins.includes('*') && !allowedOrigins.includes(e.origin)) {
        return;
      }
      const cbid = data.id;
      const {name, args} = data;
      const message = {
        namespace: 'svg-edit',
        id: cbid
      };
      try {
        message.result = svgCanvas[name].apply(svgCanvas, args);
      } catch (err) {
        message.error = err.message;
      }
      e.source.postMessage(JSON.stringify(message), '*');
    }, false);
  } catch (err) {
    console.log('Error with xdomain message listener: ' + err);
  }
});
