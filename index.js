const { generateTheme } = require("antd-theme-generator");
const path = require("path");

class AntDesignThemePlugin {
  constructor(options) {
    const defaulOptions = {
      varFile: path.join(__dirname, "../../src/styles/variables.less"),
      mainLessFile: path.join(__dirname, "../../src/styles/index.less"),
      antDir: path.join(__dirname, "../../node_modules/antd"),
      stylesDir: path.join(__dirname, "../../src/styles/antd"),
      themeVariables: ["@primary-color"],
      indexFileName: "index.html",
      generateOnce: false,
      lessUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/less.js/2.7.2/less.min.js",
      publicPath: ""
    };
    this.options = Object.assign(defaulOptions, options);
    this.generated = false;
  }

  apply(compiler) {
    const options = this.options;
    compiler.plugin("emit", (compilation, callback) => {
      const less = `
    <script>
    const path = require('path');
    const dirPath = path.resolve((__dirname).replace('\\\\app.asar',''),'../../'),
    function addCss(fileName) {

      let head = document.head;
      let link = document.createElement("link");
    
      link.type = "text/css";
      link.rel = "stylesheet/less";
      link.href = fileName;
    
      head.appendChild(link);
    }
    
     addCss(path.resolve(dirPath, './resources/color.less'));
     window.less = require(path.resolve(dirPaths, './resources/less.min.js'));
     window.less.sheets.push(path.join(__dirname, './resources/color.less'));
     window.less.refresh();
    </script>
        `;
      if (
        options.indexFileName &&
        options.indexFileName in compilation.assets
      ) {
        const index = compilation.assets[options.indexFileName];
        let content = index.source();

        if (!content.match(/\/color\.less/g)) {
          index.source = () =>
            content.replace(less, "").replace(/</body>/gi, `${less}</body>`);
          content = index.source();
          index.size = () => content.length;
        }
      }
      if (options.generateOnce && this.colors) {
        compilation.assets["color.less"] = {
          source: () => this.colors,
          size: () => this.colors.length
        };
        return callback();
      }
      generateTheme(options)
        .then(css => {
          if (options.generateOnce) {
            this.colors = css;
          }
          compilation.assets["color.less"] = {
            source: () => css,
            size: () => css.length
          };
          callback();
        })
        .catch(err => {
          callback(err);
        });
    });
  }
}

module.exports = AntDesignThemePlugin;
