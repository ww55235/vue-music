const registerRouter = require("./backend/router");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { defineConfig } = require("@vue/cli-service");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  publicPath: "./",
  //publicPath: process.env.NODE_ENV === "production" ? "/music/" : "/",
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
        @import "@/assets/scss/variable.scss";
         @import "@/assets/scss/mixin.scss";
        `,
      },
    },
  },
  // configureWebpack: {
  //   plugins: [new BundleAnalyzerPlugin()],
  //   externals: {
  //     vue: "Vue",
  //     axios: "axios",
  //     "vue-router": "VueRouter",
  //     vant: "vant",
  //     "better-scroll": "BetterScroll",
  //     vuex: "Vuex",
  //     swiper: "Swiper",
  //   },
  // },
  configureWebpack: (config) => {
    //console.log(config, "config");
    if (process.env.NODE_ENV === "production") {
      // 为生产环境修改配置...
      const BundleAnalyzerPlugin =
        require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
      config.plugins.push(new BundleAnalyzerPlugin());

      config.externals = {
        vue: "Vue",
        axios: "axios",
        "vue-router": "VueRouter",
        "better-scroll": "BetterScroll",
        vuex: "Vuex",
        vant: "vant",
        nprogress: "NProgress",
      };
    } else {
      // 为开发环境修改配置...
    }
  },
  // chainWebpack: (config) => {
  //   config.plugin("html").tap((args) => {
  //     console.log(args, "args");
  //     return [
  //       /* 传递给 html-webpack-plugin's 构造函数的新参数 */
  //     ];
  //   });
  // },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }
      registerRouter(devServer.app);
      return middlewares;
    },
  },
});
