module.exports = {
  "presets": [["@babel/preset-env", {
    "modules": false,
    "useBuiltIns": false,
    "targets": {
      "browsers": [
        "> 1%",
        "last 2 versions",
        "ie >= 9"
      ]
    }
  }]],
  "plugins": [["@babel/plugin-transform-runtime", {
    "corejs": 3
  }], "@babel/plugin-proposal-class-properties"],
  "env": {
    "commonjs": {
      "plugins": ["@babel/plugin-transform-modules-commonjs"]
    },
    "es": {
      "plugins": [["@babel/plugin-transform-runtime", {
        useESModules: true,
        "corejs": 3
      }]]
    }
  }
}
