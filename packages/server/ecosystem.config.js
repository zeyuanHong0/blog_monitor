module.exports = {
  apps: [{
    name: 'monitor-server',
    script: 'dist/src/main.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
};