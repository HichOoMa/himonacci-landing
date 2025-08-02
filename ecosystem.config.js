export const apps = [
  {
    name: 'dashboard',
    script: 'npm',
    args: 'run build && npm start',
    cwd: '/home/hichoma/Dev/hammem/dashboard',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }
];
