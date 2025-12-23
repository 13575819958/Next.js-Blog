import mysql from 'mysql2/promise';

// 优化的数据库连接池配置
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'blog_db',
  
  // 连接池优化配置
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === 'production' ? 20 : 10,
  queueLimit: 50,
  
  // 连接超时设置
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // 连接超时
  connectTimeout: 10000,
  
  // 定期清理空闲连接
  idleTimeout: 60000,
});


export default pool;
