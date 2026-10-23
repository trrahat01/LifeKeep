const { withAndroidStyles } = require("@expo/config-plugins");

module.exports = function withAndroidEdgeToEdge(config) {
  return withAndroidStyles(config, (config) => {
    config.modResults.resources.style = config.modResults.resources.style.map(
      (style) => {
        if (style.$.name !== "AppTheme") {
          return style;
        }

        style.item = (style.item ?? []).filter(
          (item) => item.$.name !== "android:statusBarColor"
        );
        return style;
      }
    );

    return config;
  });
};
