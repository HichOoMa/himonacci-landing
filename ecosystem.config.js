module.exports = {
  apps: [
    {
      name: 'dashboard',
      script: 'npm run build && npm start',
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      time: true
    }
  ]
};
