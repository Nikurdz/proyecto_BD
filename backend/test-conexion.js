import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

async function checkConnection() {
  let connection;

  // Construimos el connectString explícitamente
  const connectString = `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`;

  const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: connectString
  };

  console.log('--- DIAGNÓSTICO DE CONEXIÓN ORACLE ---');
  console.log('Intentando conectar con los siguientes parámetros:');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Puerto: ${process.env.DB_PORT}`);
  console.log(`Servicio (SID): ${process.env.DB_SERVICE_NAME}`);
  console.log(`Usuario: ${dbConfig.user}`);
  console.log(`Connect String final: ${dbConfig.connectString}`);
  console.log('----------------------------------------');

  try {
    // Intentamos obtener una conexión directamente (sin pool) para aislar el problema
    connection = await oracledb.getConnection(dbConfig);
    console.log('\n✅ ¡ÉXITO! Conexión establecida con la base de datos Oracle.');
    
    // Hacemos un ping básico
    const result = await connection.execute('SELECT 1 AS PING FROM DUAL');
    console.log('Resultado del ping (SELECT 1 FROM DUAL):', result.rows);

  } catch (err) {
    console.error('\n❌ FALLO LA CONEXIÓN ❌');
    console.error('----------------------------------------');
    console.error('Código de Error Oracle:', err.errorNum || 'No disponible');
    console.error('Mensaje completo:', err.message);
    console.error('----------------------------------------');
    
    // Análisis de errores comunes
    console.error('POSIBLE CAUSA:');
    if (err.message.includes('NJS-503') || err.message.includes('ECONNREFUSED')) {
      console.error('-> El puerto 1521 está cerrado, bloqueado por un firewall (iptables/firewalld) o la IP de la VM (192.168.56.81) no es alcanzable desde Windows.');
    } else if (err.message.includes('ORA-12541')) {
      console.error('-> TNS: no listener. La base de datos está encendida, pero el "Listener" de Oracle está apagado. Ejecuta "lsnrctl start" en la VM.');
    } else if (err.message.includes('ORA-12170')) {
      console.error('-> Timeout de conexión. Usualmente indica un problema de red o que el firewall de la VM está descartando los paquetes silenciosamente (DROP).');
    } else if (err.message.includes('ORA-12514')) {
      console.error(`-> El servicio '${process.env.DB_SERVICE_NAME}' no es reconocido por el Listener. Revisa el resultado de "lsnrctl status" para ver los servicios disponibles (puede que sea ORCL21C, XE, u otro).`);
    } else if (err.message.includes('ORA-01017')) {
      console.error('-> Usuario o contraseña inválidos. Asegúrate de que "usuario1" y su clave son correctos y que el usuario no esté bloqueado en Oracle.');
    } else {
      console.error('-> Revisa el mensaje completo arriba para más pistas.');
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('\nConexión cerrada de forma segura.');
      } catch (err) {
        console.error('Error al cerrar la conexión:', err);
      }
    }
  }
}

checkConnection();
