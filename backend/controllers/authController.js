import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { executeQuery, getConnection } from '../db.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import oracledb from 'oracledb';

export async function registrarUsuario(req, res) {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  let connection;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Generar token de verificación único
    const tokenVerificacion = crypto.randomBytes(32).toString('hex');

    connection = await getConnection();

    const cliCedRuc = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();

    const sql = `
      BEGIN
        sp_registrar_cliente(:cliCedRuc, :nombre, :correo, :password, :tokenVerificacion);
      END;
    `;
    
    const binds = {
      cliCedRuc,
      nombre,
      correo: email.toLowerCase().trim(),
      password: hashedPassword,
      tokenVerificacion
    };

    await connection.execute(sql, binds);
    await connection.commit();

    // Enviar correo electrónico usando Nodemailer (Gmail SMTP)
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Las credenciales de correo (EMAIL_USER / EMAIL_PASS) no están configuradas.');
      }
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Debe ser false para el puerto 587
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false // Ayuda a evitar rechazos por certificados locales
        }
      });

      // Verificar conexión
      transporter.verify((error, success) => {
        if (error) {
          console.error("Error de conexión SMTP:", error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "Servidor de correos listo (Registro)");
        }
      });

      const urlVerificacion = `${process.env.FRONTEND_URL}/verificar/${tokenVerificacion}`;
      
      await transporter.sendMail({
        from: `"Naturart Foods" <${process.env.EMAIL_USER}>`,
        to: email.toLowerCase().trim(),
        subject: '¡Bienvenido a Naturart Foods! Verifica tu cuenta',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #059669;">¡Hola, ${nombre}!</h2>
            <p style="color: #374151; font-size: 16px;">Gracias por registrarte en Naturart Foods. Estamos emocionados de tenerte con nosotros.</p>
            <p style="color: #374151; font-size: 16px;">Para activar tu cuenta y poder iniciar sesión, por favor haz clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${urlVerificacion}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Verificar mi cuenta</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Si no creaste esta cuenta, puedes ignorar este correo de forma segura.</p>
          </div>
        `
      });

      console.log('Correo de verificación enviado con éxito vía Gmail a:', email);
    } catch (emailErr) {
      console.error('Error enviando correo de registro con Nodemailer:', emailErr);
    }

    return res.status(201).json({
      message: 'Usuario creado. Revisa tu consola si el correo no llegó.',
    });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (rollbackErr) { console.error(rollbackErr); }
    }
    if (err.message && err.message.includes('ORA-00001')) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
    }
    if (err.message && err.message.includes('ORA-20')) {
      const match = err.message.match(/ORA-20\d{3}:\s*(.*)/);
      const customError = match ? match[1] : err.message;
      return res.status(400).json({ error: customError });
    }
    // Loguear el error exacto de Oracle en la consola para depuración detallada
    console.error('=== ERROR DETALLADO EN EL REGISTRO (ORACLE) ===');
    console.error('Mensaje de error:', err.message);
    console.error('Pila de ejecución:', err.stack);
    console.error('Código de error Oracle:', err.errorNum || 'No disponible');
    console.error('================================================');
    
    return res.status(500).json({ error: 'Error interno del servidor al registrar el usuario en la base de datos.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (closeErr) { console.error(closeErr); }
    }
  }
}

export async function verificarCorreo(req, res) {
  const { token } = req.params;

  let connection;
  try {
    connection = await getConnection();
    
    // Buscar usuario por token y obtener todos sus datos para el JWT
    const sqlSelect = `
      SELECT CLI_CED_RUC, CLI_NOMBRE, CLI_CORREO, CLI_ROL 
      FROM vw_clientes_gyq 
      WHERE TOKEN_VERIFICACION = :token
    `;
    const result = await connection.execute(sqlSelect, { token });

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Token inválido" });
    }

    const usuario = result.rows[0];

    // Actualizar estado a verificado y eliminar el token
    const sqlUpdate = `
      BEGIN
        sp_verificar_cliente(:token);
      END;
    `;
    await connection.execute(sqlUpdate, { token });
    await connection.commit();

    // AUTO-LOGIN: Generar JWT exactamente igual que en iniciarSesion
    const jwtToken = jwt.sign(
      { 
        id: usuario.CLI_CED_RUC, 
        nombre: usuario.CLI_NOMBRE, 
        email: usuario.CLI_CORREO, 
        rol: usuario.CLI_ROL 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Responder con los datos de sesión listos para usar
    return res.status(200).json({ 
      mensaje: "Verificado",
      token: jwtToken,
      usuario: {
        id: usuario.CLI_CED_RUC,
        nombre: usuario.CLI_NOMBRE,
        email: usuario.CLI_CORREO,
        rol: usuario.CLI_ROL
      }
    });
  } catch (err) {
    console.error('Error verificando correo:', err);
    return res.status(500).json({ error: 'Error interno del servidor al verificar la cuenta.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (closeErr) { console.error(closeErr); }
    }
  }
}

export async function iniciarSesion(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'El correo y la contraseña son requeridos.' });
  }

  try {
    const sql = `
      SELECT CLI_CED_RUC, CLI_NOMBRE, CLI_CORREO, CLI_PASSWORD, CLI_ROL, VERIFICADO
      FROM vw_clientes_gyq
      WHERE UPPER(CLI_CORREO) = UPPER(:email)
    `;

    const result = await executeQuery(sql, { email: email.toLowerCase().trim() });

    if (!result.rows || result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const usuario = result.rows[0];

    // Verificar si el correo está confirmado (Excepto si es admin viejo que no tenga este campo seteado)
    if (usuario.CLI_ROL !== 'admin' && usuario.VERIFICADO === 0) {
       return res.status(403).json({ error: 'Debes verificar tu correo electrónico antes de iniciar sesión.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.CLI_PASSWORD);
    if (!passwordValido) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.CLI_CED_RUC, nombre: usuario.CLI_NOMBRE, email: usuario.CLI_CORREO, rol: usuario.CLI_ROL },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.CLI_CED_RUC,
        nombre: usuario.CLI_NOMBRE,
        email: usuario.CLI_CORREO,
        rol: usuario.CLI_ROL
      }
    });
  } catch (err) {
    console.error('Error en el inicio de sesión:', err);
    return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
}

export async function listarUsuarios(req, res) {
  try {
    const sql = `
      SELECT CLI_CED_RUC AS "id", CLI_NOMBRE AS "nombre", CLI_CORREO AS "correo", CLI_ROL AS "rol", VERIFICADO AS "verificado"
      FROM vw_clientes_gyq
      ORDER BY CLI_NOMBRE ASC
    `;
    const result = await executeQuery(sql, {});
    return res.json(result.rows);
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// --- NUEVAS FUNCIONES 
// 1. Reenviar Verificación (Público - Desde Login)
export async function reenviarVerificacionPublico(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El correo es obligatorio.' });

  let connection;
  try {
    connection = await getConnection();
    
    // Buscar usuario y estado de verificación
    const sqlSelect = `SELECT CLI_CED_RUC, CLI_NOMBRE, VERIFICADO FROM vw_clientes_gyq WHERE UPPER(CLI_CORREO) = UPPER(:email)`;
    const result = await connection.execute(sqlSelect, { email: String(email).trim() }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'No existe una cuenta con este correo.' });
    }
    
    const usuario = result.rows[0];
    if (usuario.VERIFICADO === 1) {
      return res.status(400).json({ error: 'Esta cuenta ya está verificada. Puedes iniciar sesión.' });
    }

    // Generar nuevo token y guardar en la base de datos
    const tokenVerificacion = crypto.randomBytes(32).toString('hex');
    const sqlUpdate = `
      BEGIN
        UPDATE CLIENTE@link_contingencia_gyq SET TOKEN_VERIFICACION = :token WHERE CLI_CED_RUC = :id;
      END;
    `;
    await connection.execute(sqlUpdate, { token: String(tokenVerificacion), id: String(usuario.CLI_CED_RUC) });
    await connection.commit();

    // Reenviar correo con Nodemailer (Gmail)
    let emailError = null;
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Las credenciales de correo (EMAIL_USER / EMAIL_PASS) no están configuradas.');
      }
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Debe ser false para el puerto 587
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false // Ayuda a evitar rechazos por certificados locales
        }
      });

      // Verificar conexión
      transporter.verify((error, success) => {
        if (error) {
          console.error("Error de conexión SMTP:", error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "Servidor de correos listo (Reenviar Público)");
        }
      });
      
      const urlVerificacion = `${process.env.FRONTEND_URL}/verificar/${tokenVerificacion}`;
      
      await transporter.sendMail({
        from: `"Naturart Foods" <${process.env.EMAIL_USER}>`,
        to: email.trim(),
        subject: 'Reenvío: Verifica tu cuenta de Naturart Foods',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">¡Hola, ${usuario.CLI_NOMBRE}!</h2>
            <p>Hemos recibido una solicitud para reenviar tu enlace de verificación de cuenta.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${urlVerificacion}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Verificar mi cuenta</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Si no solicitaste este reenvío, puedes ignorar este correo.</p>
          </div>
        `
      });

    } catch (emailErr) {
      emailError = emailErr.message;
      console.error('Excepción al enviar correo de reenvío con Nodemailer:', emailErr);
    }

    if (emailError) {
      return res.status(500).json({ 
        error: 'Usuario actualizado, pero hubo un problema al enviar el correo.', 
        detalle: emailError 
      });
    }

    return res.json({ message: 'Enlace de verificación reenviado exitosamente.' });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (e) { console.error(e); }
    }
    console.error('ERROR EN REENVIAR VERIFICACIÓN:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', detalle: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
}

// 2. Reenviar Verificación (Protegido - Desde el Admin Dashboard)
export async function reenviarVerificacionAdmin(req, res) {
  const { id } = req.params;
  
  let connection;
  try {
    connection = await getConnection();
    
    const sqlSelect = `SELECT CLI_CED_RUC, CLI_NOMBRE, CLI_CORREO, VERIFICADO FROM vw_clientes_gyq WHERE CLI_CED_RUC = :id`;
    const result = await connection.execute(sqlSelect, { id: String(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    
    const usuario = result.rows[0];
    if (usuario.VERIFICADO === 1) {
      return res.status(400).json({ error: 'Este usuario ya está verificado.' });
    }

    const tokenVerificacion = crypto.randomBytes(32).toString('hex');
    const sqlUpdate = `
      BEGIN
        UPDATE CLIENTE@link_contingencia_gyq SET TOKEN_VERIFICACION = :token WHERE CLI_CED_RUC = :id;
      END;
    `;
    await connection.execute(sqlUpdate, { token: tokenVerificacion, id: String(id) });
    await connection.commit();

    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Las credenciales de correo no están configuradas.');
      }
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Debe ser false para el puerto 587
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false // Ayuda a evitar rechazos por certificados locales
        }
      });

      // Verificar conexión
      transporter.verify((error, success) => {
        if (error) {
          console.error("Error de conexión SMTP:", error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "Servidor de correos listo (Reenviar Admin)");
        }
      });

      const urlVerificacion = `${process.env.FRONTEND_URL}/verificar/${tokenVerificacion}`;
      
      await transporter.sendMail({
        from: `"Naturart Foods" <${process.env.EMAIL_USER}>`,
        to: usuario.CLI_CORREO,
        subject: 'Administración: Verifica tu cuenta de Naturart Foods',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">¡Hola, ${usuario.CLI_NOMBRE}!</h2>
            <p>Un administrador ha solicitado el reenvío de tu enlace de verificación.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${urlVerificacion}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Verificar mi cuenta</a>
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Error enviando correo (Admin) con Nodemailer:', emailErr);
    }

    return res.json({ message: 'Correo de verificación enviado al usuario.' });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (e) { console.error(e); }
    }
    console.error('Error en reenviarVerificacionAdmin:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', detalle: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
}

// 3. Cambiar Rol del Usuario (Protegido - Desde el Admin Dashboard)
export async function cambiarRolUsuario(req, res) {
  const { id } = req.params;
  const { rol } = req.body;

  if (!rol || (rol !== 'admin' && rol !== 'cliente')) {
    return res.status(400).json({ error: 'El rol especificado no es válido (admin/cliente).' });
  }

  let connection;
  try {
    connection = await getConnection();
    
    const sqlUpdate = `
      BEGIN
        UPDATE CLIENTE@link_contingencia_gyq SET CLI_ROL = :rol WHERE CLI_CED_RUC = :id;
      END;
    `;
    const result = await connection.execute(sqlUpdate, { rol, id: String(id) });
    
    if (result.rowsAffected === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    
    await connection.commit();
    return res.json({ message: `Rol actualizado a '${rol}' exitosamente.` });
  } catch (err) {
    if (connection) {
      try { await connection.rollback(); } catch (e) { console.error(e); }
    }
    console.error('Error cambiando rol:', err);
    return res.status(500).json({ error: 'Error interno del servidor.', detalle: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
}
