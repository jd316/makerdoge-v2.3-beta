module.exports = function override(config, env) {
  // Disable Content Security Policy in development
  config.plugins = config.plugins.map(plugin => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      return new plugin.constructor({
        ...plugin.options,
        meta: {
          'Content-Security-Policy': { 
            'http-equiv': 'Content-Security-Policy', 
            'content': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' ws:" 
          }
        }
      });
    }
    return plugin;
  });
  return config;
}
