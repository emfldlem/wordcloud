'use strict';


var arr = [];
var worddata = {
  'sang' : {
    list: (function () {
      var arr = [];
    $(function(){
        $.ajax({
        url: "test.json", //전송하고자 하는 URL
        dataType: "json", //받는 데이터 타입
        async:false,
        /*ajax로 json을 받아오고있지만 ajax는 비동기식이기때문에 json파일을 읽어 list 배열에 넣기도 전에 페이지가 로딩의 완료가 된다.
        그렇기에 ajax를 쓰지만 비동기식 기능을 false로 놓고 사용하고 있다.
        */
        success: function(data){
          for(var i=0; i<data.length; i++) {
              arr.push(data[i].weight + ' ' + data[i].word);
          };
          }
        })
      })
      console.log(arr);
      return arr.join('\n');
    })(),
    option: '{\n' +
            '  gridSize: Math.round(5 * $(\'#canvas\').width() / 1024),\n' +
            '  weightFactor: 2,\n' +
            '  fontFamily: \'Jeju Gothic\',\n' +
            '  color: \'random-light\',\n' +
            '  color: \'#1DA1F2\',\n' +
            '  backgroundColor: \'#ffffff\',\n' +
            '  hover: window.drawBox,\n' +
            '  click: function(item) {\n' +
            '    open("http://r3market.net/product/search?searchValue="+item[0]);\n' +
            //'  rotateRatio: 0.5,\n' +
            '  },\n' +
            '}'
  }
};

var maskCanvas;


jQuery(function($) {

  var $form = $('#form');
  var $canvas = $('#canvas');
  var $htmlCanvas = $('#html-canvas');
  var $canvasContainer = $('#canvas-container');
  var $loading = $('#loading');

  var $list = $('#input-list');
  var $options = $('#config-option');
  var $width = $('#config-width');
  var $height = $('#config-height');
  var $mask = $('#config-mask');
  var $dppx = $('#config-dppx');
  var $css = $('#config-css');
  var $webfontLink = $('#link-webfont');

  if (!WordCloud.isSupported) {
    $('#not-supported').prop('hidden', false);
    $form.find('textarea, input, select, button').prop('disabled', true);
    return;
  }

  var $box = $('<div id="box" hidden />');
  
  $canvasContainer.append($box);
  
  
  window.drawBox = function drawBox(item, dimension) {
    if (!dimension) {
      $box.prop('hidden', true);

      return;
    }

    var dppx = $dppx.val();

    $box.prop('hidden', false);
    $box.css({
      left: dimension.x / dppx + 'px',
      top: dimension.y / dppx + 'px',
      width: dimension.w / dppx + 'px',
      height: dimension.h / dppx + 'px'
    });
  };

  // Update the default value if we are running in a hdppx device
  if (('devicePixelRatio' in window) &&
      window.devicePixelRatio !== 1) {
    $dppx.val(window.devicePixelRatio);
  }

  $canvas.on('wordcloudstop', function wordcloudstopped(evt) {
    $loading.prop('hidden', true);
  });

  $form.on('submit', function formSubmit(evt) {
    evt.preventDefault();

    changeHash('');
  });

  $('#config-mask-clear').on('click', function() {
    maskCanvas = null;
    // Hack!
    $mask.wrap('<form>').closest('form').get(0).reset();
    $mask.unwrap();
  });

  // Load the local image file, read it's pixels and transform it into a
  // black-and-white mask image on the canvas.
  //사용자가 이미지를 올리면 그 이미지 대로 배치를 해주는 부분
  $mask.on('change', function() {
    maskCanvas = null;

    /*var file = system.file("image(back).png");

    if (!file) {
      return;
    }

    var url = window.URL.createObjectURL(file);*/
    var img = new Image();
    img.src = 'image.png';

    img.onload = function readPixels() {
     // window.URL.revokeObjectURL(url);

      maskCanvas = document.createElement('canvas');
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      console.log(maskCanvas.width);

      var ctx = maskCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);

      var imageData = ctx.getImageData(
        0, 0, maskCanvas.width, maskCanvas.height);
      var newImageData = ctx.createImageData(imageData);

      for (var i = 0; i < imageData.data.length; i += 4) {
        var tone = imageData.data[i] +
          imageData.data[i + 1] +
          imageData.data[i + 2];
        var alpha = imageData.data[i + 3];

        if (alpha < 128 || tone > 128 * 3) {
          // Area not to draw
          newImageData.data[i] =
            newImageData.data[i + 1] =
            newImageData.data[i + 2] = 255;
          newImageData.data[i + 3] = 0;
        } else {
          // Area to draw
          newImageData.data[i] =
            newImageData.data[i + 1] =
            newImageData.data[i + 2] = 0;
          newImageData.data[i + 3] = 255;
        }
      }
      

      ctx.putImageData(newImageData, 0, 0);
      console.log(ctx);
    };
  });

  if ($mask[0].files.length) {
    $mask.trigger('change');
  }

//저장 버튼 구현
  $('#btn-save').on('click', function save(evt) {
    var url = $canvas[0].toDataURL();
    if ('download' in document.createElement('a')) {
      this.href = url;
    } else {
      evt.preventDefault();
      alert('Please right click and choose "Save As..." to save the generated image.');
      window.open(url, '_blank', 'width=500,height=300,menubar=yes');
    }
  });

//
  $('#btn-canvas').on('click', function showCanvas(evt) {
    $canvas.removeClass('hide');
    $htmlCanvas.addClass('hide');
    $('#btn-canvas').prop('disabled', true);
    $('#btn-html-canvas').prop('disabled', false);
  });

  $('#btn-html-canvas').on('click', function showCanvas(evt) {
    $canvas.addClass('hide');
    $htmlCanvas.removeClass('hide');
    $('#btn-canvas').prop('disabled', false);
    $('#btn-html-canvas').prop('disabled', true);
  });

  $('#btn-canvas').prop('disabled', true);
  $('#btn-html-canvas').prop('disabled', false);

  var $worddata = $('#worddata');
  $worddata.on('change', function loadExample(evt) {
    changeHash(this.value);

    this.selectedIndex = 0;
    //$worddata.blur();
  });

  var run = function run() {
    $mask.trigger('change');
    $loading.prop('hidden', false);

    // Load web font
    $webfontLink.prop('href', $css.val());

    // devicePixelRatio
    var devicePixelRatio = parseFloat($dppx.val());

    // Set the width and height
    var width = $width.val() ? $width.val() : $('#canvas-container').width();
    //var width = 1280;
    var height = $height.val() ? $height.val() : Math.floor(width * 0.65);
    //var height = 720;
    var pixelWidth = width;
    var pixelHeight = height;

    if (devicePixelRatio !== 1) {
      $canvas.css({'width': width + 'px', 'height': height + 'px'});

      pixelWidth *= devicePixelRatio;
      pixelHeight *= devicePixelRatio;
    } else {
      $canvas.css({'width': '', 'height': '' });
    }

    $canvas.attr('width', pixelWidth);
    $canvas.attr('height', pixelHeight);

    $htmlCanvas.css({'width': pixelWidth + 'px', 'height': pixelHeight + 'px'});

    // Set the options object
    var options = {};
    if ($options.val()) {
      options = (function evalOptions() {
        try {
          return eval('(' + $options.val() + ')');
        } catch (error) {
          alert('The following Javascript error occurred in the option definition; all option will be ignored: \n\n' +
            error.toString());
          return {};
        }
      })();
    }

    // Set devicePixelRatio options
    if (devicePixelRatio !== 1) {
      if (!('gridSize' in options)) {
        options.gridSize = 8;
      }
      options.gridSize *= devicePixelRatio;

      if (options.origin) {
        if (typeof options.origin[0] == 'number')
          options.origin[0] *= devicePixelRatio;
        if (typeof options.origin[1] == 'number')
          options.origin[1] *= devicePixelRatio;
      }

      if (!('weightFactor' in options)) {
        options.weightFactor = 1;
      }
      if (typeof options.weightFactor == 'function') {
        var origWeightFactor = options.weightFactor;
        options.weightFactor =
          function weightFactorDevicePixelRatioWrap() {
            return origWeightFactor.apply(this, arguments) * devicePixelRatio;
          };
      } else {
        options.weightFactor *= devicePixelRatio;
      }
    }

    // Put the word list into options

    if ($list.val()) {
      var list = [];
      $.each($list.val().split('\n'), function each(i, line) {
        if (!$.trim(line)) //공백 제거 함수 trim
          return;

        var lineArr = line.split(' ');
        var count = parseFloat(lineArr.shift()) || 0;
        list.push([lineArr.join(' '), count]);
      });
      options.list = list;
    }

    WordCloud([$canvas[0], $htmlCanvas[0]], options);
  };


  var loadInitData = function loadInitData(name) {
    var initdata = worddata[name];

    $options.val(initdata.option || '');
    $list.val(initdata.list || '');
    $css.val(initdata.fontCSS || '');
    $width.val(initdata.width || '');
    $height.val(initdata.height || '');
  };
  if (maskCanvas) {
      options.clearCanvas = false;

      /* Determine bgPixel by creating
         another canvas and fill the specified background color. */
      var bctx = document.createElement('canvas').getContext('2d');

      bctx.fillStyle = options.backgroundColor || '#fff';
      bctx.fillRect(0, 0, 1, 1);
      var bgPixel = bctx.getImageData(0, 0, 1, 1).data;

      var maskCanvasScaled =
        document.createElement('canvas');
      maskCanvasScaled.width = $canvas[0].width;
      maskCanvasScaled.height = $canvas[0].height;
      var ctx = maskCanvasScaled.getContext('2d');

      ctx.drawImage(maskCanvas,
        0, 0, maskCanvas.width, maskCanvas.height,
        0, 0, maskCanvasScaled.width, maskCanvasScaled.height);

var img = new Image();
    img.src = 'image.png';

    img.onload = function readPixels() {
     // window.URL.revokeObjectURL(url);

      maskCanvas = document.createElement('canvas');
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      console.log(maskCanvas.width);

      var ctx = maskCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);

      var imageData = ctx.getImageData(
        0, 0, maskCanvas.width, maskCanvas.height);
      var newImageData = ctx.createImageData(imageData);

      for (var i = 0; i < imageData.data.length; i += 4) {
        var tone = imageData.data[i] +
          imageData.data[i + 1] +
          imageData.data[i + 2];
        var alpha = imageData.data[i + 3];

        if (alpha < 128 || tone > 128 * 3) {
          // Area not to draw
          newImageData.data[i] =
            newImageData.data[i + 1] =
            newImageData.data[i + 2] = 255;
          newImageData.data[i + 3] = 0;
        } else {
          // Area to draw
          newImageData.data[i] =
            newImageData.data[i + 1] =
            newImageData.data[i + 2] = 0;
          newImageData.data[i + 3] = 255;
        }
      }
    }


      ctx.putImageData(newImageData, 0, 0);

      ctx = $canvas[0].getContext('2d');
      ctx.drawImage(maskCanvasScaled, 0, 0);

      maskCanvasScaled = ctx = imageData = newImageData = bctx = bgPixel = undefined;
    }

  var changeHash = function changeHash(name) {
    if (window.location.hash === '#' + name ||
        (!window.location.hash && !name)) {
      // We got a same hash, call hashChanged() directly
      hashChanged();
    } else {
      // Actually change the hash to invoke hashChanged()
      window.location.hash = '#' + name;
    }
  };

  var hashChanged = function hashChanged() {
    var name = window.location.hash.substr(1);
    if (!name) {
      // If there is no name, run as-is.
      run();
    } else if (name in worddata) {
      // If the name matches one of the example, load it and run it
      loadInitData(name);
      run();
    } else {
      // If the name doesn't match, reset it.
      window.location.replace('#');
    }
  }

  $(window).on('hashchange', hashChanged);

  if (!window.location.hash ||
    !(window.location.hash.substr(1) in worddata)) {
      window.location.replace('#sang');
  } else {
    hashChanged();
  }
});
