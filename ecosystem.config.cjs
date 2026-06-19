module.exports = {
  apps: [
    {
      name: "sleepcare-frontend",
      script: "./node_modules/serve/build/main.js",
      args: "-s dist -l 80",
      cwd: "C:\\sleepcare-dashboard",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
