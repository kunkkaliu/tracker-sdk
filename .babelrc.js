module.exports = {
  "presets": [["@babel/preset-env", {
    "useBuiltIns": false,
    "targets": {
      "browsers": [
        "> 1%",
        "last 2 versions",
        "ie >= 9",
      ]
    }
  }]],
  "plugins": ["@babel/plugin-transform-runtime", "@babel/plugin-proposal-class-properties"],
  "env": {
    "cjs": {
      "plugins": ["@babel/plugin-transform-modules-commonjs"]
    },
    "es": {
      "presets": [["@babel/preset-env", {
        "modules": false,
      }]],
      "plugins": [["@babel/plugin-transform-runtime", {
        useESModules: true,
      }]]
    }
  }
}
