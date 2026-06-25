import 'dotenv/config';
import { executeQuery, initializeDatabase } from './db.js';

async function crearValidacionCedula() {
  try {
    await initializeDatabase();
    
    console.log("Creando función FN_VALIDAR_CEDULA_EC...");
    const funcSql = `
      CREATE OR REPLACE FUNCTION FN_VALIDAR_CEDULA_EC(p_cedula IN VARCHAR2) RETURN BOOLEAN IS
          v_provincia NUMBER;
          v_suma NUMBER := 0;
          v_digito NUMBER;
          v_producto NUMBER;
          v_decena NUMBER;
          v_verificador NUMBER;
      BEGIN
          -- Validar longitud (10 dígitos) y que sean solo números
          IF LENGTH(p_cedula) != 10 OR NOT REGEXP_LIKE(p_cedula, '^[0-9]+$') THEN
              RETURN FALSE;
          END IF;
      
          -- Validar provincia (01 al 24)
          v_provincia := TO_NUMBER(SUBSTR(p_cedula, 1, 2));
          IF v_provincia < 1 OR v_provincia > 24 THEN
              RETURN FALSE;
          END IF;
      
          -- Algoritmo Módulo 10
          FOR i IN 1..9 LOOP
              v_digito := TO_NUMBER(SUBSTR(p_cedula, i, 1));
              
              -- Coeficientes alternados: 2 para impares, 1 para pares
              IF MOD(i, 2) != 0 THEN
                  v_producto := v_digito * 2;
              ELSE
                  v_producto := v_digito * 1;
              END IF;
              
              -- Ajuste de productos (si es >= 10, restamos 9)
              IF v_producto >= 10 THEN
                  v_producto := v_producto - 9;
              END IF;
              
              v_suma := v_suma + v_producto;
          END LOOP;
      
          -- Decena superior
          IF MOD(v_suma, 10) = 0 THEN
              v_decena := v_suma;
          ELSE
              v_decena := (TRUNC(v_suma / 10) + 1) * 10;
          END IF;
          
          -- Cálculo del verificador
          v_verificador := v_decena - v_suma;
          
          -- Verificar contra el décimo dígito
          IF v_verificador = TO_NUMBER(SUBSTR(p_cedula, 10, 1)) THEN
              RETURN TRUE;
          ELSE
              RETURN FALSE;
          END IF;
      END;
    `;
    await executeQuery(funcSql);
    
    console.log("Creando trigger TRG_VALIDAR_CEDULA_CLIENTE...");
    const triggerSql = `
      CREATE OR REPLACE TRIGGER TRG_VALIDAR_CEDULA_CLIENTE
      BEFORE INSERT OR UPDATE ON CLIENTE
      FOR EACH ROW
      DECLARE
          v_valido BOOLEAN;
          v_cedula_a_validar VARCHAR2(10);
      BEGIN
          IF :NEW.CLI_CI_RUC IS NOT NULL THEN
              -- El RUC/Cédula Ecuatoriana puede tener 10 o 13 dígitos
              IF LENGTH(:NEW.CLI_CI_RUC) IN (10, 13) THEN
                  v_cedula_a_validar := SUBSTR(:NEW.CLI_CI_RUC, 1, 10);
                  
                  -- Solo validamos con el algoritmo de Cédula si:
                  -- a) Es cédula de 10 dígitos.
                  -- b) Es un RUC de persona natural (13 dígitos y su 3er dígito es menor a 6).
                  IF LENGTH(:NEW.CLI_CI_RUC) = 10 OR (LENGTH(:NEW.CLI_CI_RUC) = 13 AND TO_NUMBER(SUBSTR(:NEW.CLI_CI_RUC, 3, 1)) < 6) THEN
                      
                      v_valido := FN_VALIDAR_CEDULA_EC(v_cedula_a_validar);
                      
                      IF NOT v_valido THEN
                          RAISE_APPLICATION_ERROR(-20001, 'La cédula ingresada (' || v_cedula_a_validar || ') es estructural o matemáticamente inválida según el Registro Civil del Ecuador.');
                      END IF;
                      
                  END IF;
              ELSE
                  RAISE_APPLICATION_ERROR(-20002, 'El documento debe tener 10 dígitos (Cédula) o 13 dígitos (RUC). Ingresaste: ' || LENGTH(:NEW.CLI_CI_RUC));
              END IF;
          END IF;
      END;
    `;
    await executeQuery(triggerSql);

    console.log("¡Función y Trigger creados exitosamente!");

  } catch (err) {
    console.error("Error al crear objetos en BD:", err);
  }
  process.exit();
}

crearValidacionCedula();
