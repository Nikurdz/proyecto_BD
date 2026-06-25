-- Type package declaration
create or replace package PDTypes  
as
    TYPE ref_cursor IS REF CURSOR;
end;
/

-- Integrity package declaration
create or replace package IntegrityPackage AS
 procedure InitNestLevel;
 function GetNestLevel return number;
 procedure NextNestLevel;
 procedure PreviousNestLevel;
 end IntegrityPackage;
/

-- Integrity package definition
create or replace package body IntegrityPackage AS
 NestLevel number;

-- Procedure to initialize the trigger nest level
 procedure InitNestLevel is
 begin
 NestLevel := 0;
 end;


-- Function to return the trigger nest level
 function GetNestLevel return number is
 begin
 if NestLevel is null then
     NestLevel := 0;
 end if;
 return(NestLevel);
 end;

-- Procedure to increase the trigger nest level
 procedure NextNestLevel is
 begin
 if NestLevel is null then
     NestLevel := 0;
 end if;
 NestLevel := NestLevel + 1;
 end;

-- Procedure to decrease the trigger nest level
 procedure PreviousNestLevel is
 begin
 NestLevel := NestLevel - 1;
 end;

 end IntegrityPackage;
/


drop index SUCURSAL_BODEGA_FK
/

drop table BODEGA cascade constraints
/

drop table CARGO cascade constraints
/

drop index CLIENTE_CARRITO2_FK
/

drop table CARRITO cascade constraints
/

drop index PROVINCIA_CIUDAD_FK
/

drop table CIUDAD cascade constraints
/

drop index EMPRESA_CLIENTE_FK
/

drop table CLIENTE cascade constraints
/

drop index FACTURA_COMIVENTA2_FK
/

drop index EMPLEADO_COMIVENTA_FK
/

drop table COMISION_VENTA cascade constraints
/

drop index EMPRESA_DEPARTAMENTO_FK
/

drop table DEPARTAMENTO cascade constraints
/

drop index FACTURA_DETAFACTU_FK
/

drop index PRODUCTO_DETAFACT_FK
/

drop table DETALLE_FACTURA cascade constraints
/

drop index DEPARTAM_EMPLEADO_FK
/

drop index CARGO_EMPLEADO_FK
/

drop index CIUDA_EMPLEADO_FK
/

drop index SUCURSAL_EMPLEADO_FK
/

drop index EMPRESA_EMPLEADO_FK
/

drop table EMPLEADO cascade constraints
/

drop table EMPRESA cascade constraints
/

drop index CLIENTE_FACTURA_FK
/

drop index EMPLEADO_FACTURA_FK
/

drop index SUCURSAL_FACTURA_FK
/

drop table FACTURA cascade constraints
/

drop index LOTEENTRA_KARDEX_FK
/

drop index FACTURA_KARDEX_FK
/

drop index TRANSACCION_KARDEX_FK
/

drop index UNIDAMEDI_KARDEX_FK
/

drop index PRODUCTO_KARDEX_FK
/

drop index BODEGA_KARDEX_FK
/

drop table KARDEX cascade constraints
/

drop index BODEWGA_LOT_ENTRA_FK
/

drop index ORD_COMP_LOTE_ENTRA_FK
/

drop index PRODUCTO_LOTEENTRA_FK
/

drop table LOTE_ENTRADA cascade constraints
/

drop index EMPLEADO_ORDECOMP_FK
/

drop index PROVEEDOR_ORDENCOMP_FK
/

drop table ORDEN_COMPRA cascade constraints
/

drop index CATEGORIA_PRODUCTO_FK
/

drop index UNIDAMEDI_PRODUCTO_FK
/

drop index PRODUCTO_PRODBODE_FK
/

drop index BODEGA_PRODUCBODE_FK
/

drop table PROD_BODGA cascade constraints
/

drop index PRODUCTO_PRODCARR_FK
/

drop index CARRITO_PRODCARRITO_FK
/

drop table PROD_CARRITO cascade constraints
/

drop index PRODUCTO_PRODORDECOM_FK
/

drop index ORDENCOMP_PRODORDCOM_FK
/

drop table PROD_ORDENCOMPRA cascade constraints
/

drop table PROMOCION cascade constraints
/

drop index PRODUCTO_PRODPROMO_FK
/

drop index PROMOCION_PRODPROMO_FK
/

drop table PROMO_PROD cascade constraints
/

drop table PROVEEDOR cascade constraints
/

drop index PRODUCTO_PRODPROVEE_FK
/

drop index PROVEEDOR_PRODPROVEE_FK
/

drop table PROVE_PROD cascade constraints
/

drop table PROVINCIA cascade constraints
/

drop index CIUDAD_SUCURSAL_FK
/

drop index EMPRESA_SUCURSAL_FK
/

drop table SUCURSAL cascade constraints
/

drop table TRANSACCION cascade constraints
/

drop table UNIDAD_MEDIDA cascade constraints
/

drop index CLIENTE_USUARIO_A2_FK
/

drop table USUARIO_A cascade constraints
/

/*==============================================================*/
/* Table: BODEGA                                                */
/*==============================================================*/
create table BODEGA (
   BOD_CODIGO           VARCHAR2(4)           not null
      constraint CKC_BOD_CODIGO_BODEGA check (BOD_CODIGO = upper(BOD_CODIGO)),
   SUC_CODIGO           VARCHAR2(8)           not null
      constraint CKC_SUC_CODIGO_BODEGA check (SUC_CODIGO = upper(SUC_CODIGO)),
   BOD_DESCRIPCION      VARCHAR2(100)         not null,
   constraint PK_BODEGA primary key (BOD_CODIGO)
)
   
/

comment on table BODEGA is
'Tabla que contiene las bodegas donde se almacenan los productos'
/

comment on column BODEGA.BOD_CODIGO is
'Código de la bodega'
/

comment on column BODEGA.SUC_CODIGO is
'Código de la sucursal'
/

comment on column BODEGA.BOD_DESCRIPCION is
'Descripción de la bodega
'
/

/*==============================================================*/
/* Index: SUCURSAL_BODEGA_FK                                    */
/*==============================================================*/
create index SUCURSAL_BODEGA_FK on BODEGA (
   SUC_CODIGO ASC
)

/

/*==============================================================*/
/* Table: CARGO                                                 */
/*==============================================================*/
create table CARGO (
   CRG_CODIGO           VARCHAR2(3)           not null
      constraint CKC_CRG_CODIGO_CARGO check (CRG_CODIGO = upper(CRG_CODIGO)),
   CRG_DESCRIPCION      VARCHAR2(200)         not null,
   CRG_COMISION         CHAR(1)               not null
      constraint CKC_CRG_COMISION_CARGO check (CRG_COMISION in ('S','N') and CRG_COMISION = upper(CRG_COMISION)),
   constraint PK_CARGO primary key (CRG_CODIGO)
)
   
/

comment on table CARGO is
'Tabla que contiene los cargos de los empleados '
/

comment on column CARGO.CRG_CODIGO is
'Código del cargo que un empleado desempeña en la emprsea'
/

comment on column CARGO.CRG_DESCRIPCION is
'Descripcion del cargo que un empleado desempeña en la empresa
'
/

comment on column CARGO.CRG_COMISION is
'Identificador del cargo respecto a si el cargo cobra o no comición a mas de su sueldo. (S=Si, N=No)
'
/

/*==============================================================*/
/* Table: CARRITO                                               */
/*==============================================================*/
create table CARRITO (
   CRR_CED_RUC_CLI      VARCHAR2(13)          not null
      constraint CKC_CRR_CED_RUC_CLI_CARRITO check (CRR_CED_RUC_CLI = upper(CRR_CED_RUC_CLI)),
   CLI_CI_RUC           VARCHAR2(13)          not null
      constraint CKC_CLI_CI_RUC_CARRITO check (CLI_CI_RUC = upper(CLI_CI_RUC)),
   CRR_FECHA_C          DATE                  not null,
   CRR_FECHA_A          DATE                  not null,
   constraint PK_CARRITO primary key (CRR_CED_RUC_CLI)
)
   
/

comment on table CARRITO is
'Tabla que contiene la información del carrito de compra'
/

comment on column CARRITO.CRR_CED_RUC_CLI is
'Cedula o RUC del cliente dueño del carrito'
/

comment on column CARRITO.CLI_CI_RUC is
'Cédula de identidad o RUC del cliente'
/

comment on column CARRITO.CRR_FECHA_C is
'Fecha de creación del carrito de compras
'
/

comment on column CARRITO.CRR_FECHA_A is
'Fecha de actualización del carrito de compras
'
/

/*==============================================================*/
/* Index: CLIENTE_CARRITO2_FK                                   */
/*==============================================================*/
create index CLIENTE_CARRITO2_FK on CARRITO (
   CLI_CI_RUC ASC
)

/

/*==============================================================*/
/* Table: CIUDAD                                                */
/*==============================================================*/
create table CIUDAD (
   CIU_CODIGO           VARCHAR2(4)           not null
      constraint CKC_CIU_CODIGO_CIUDAD check (CIU_CODIGO = upper(CIU_CODIGO)),
   PRO_CODIGO           VARCHAR2(2)           not null
      constraint CKC_PRO_CODIGO_CIUDAD check (PRO_CODIGO = upper(PRO_CODIGO)),
   CIU_NOMBRE           VARCHAR2(50)          not null,
   constraint PK_CIUDAD primary key (CIU_CODIGO)
)
   
/

comment on table CIUDAD is
'Tabla que contiene las ciudades'
/

comment on column CIUDAD.CIU_CODIGO is
'Código de la ciudad'
/

comment on column CIUDAD.PRO_CODIGO is
'Código de la provincia'
/

/*==============================================================*/
/* Index: PROVINCIA_CIUDAD_FK                                   */
/*==============================================================*/
create index PROVINCIA_CIUDAD_FK on CIUDAD (
   PRO_CODIGO ASC
)

/

/*==============================================================*/
/* Table: CLIENTE                                               */
/*==============================================================*/
create table CLIENTE (
   CLI_CI_RUC           VARCHAR2(13)          not null
      constraint CKC_CLI_CI_RUC_CLIENTE check (CLI_CI_RUC = upper(CLI_CI_RUC)),
   EMP_RUC              VARCHAR2(13)          not null
      constraint CKC_EMP_RUC_CLIENTE check (EMP_RUC = upper(EMP_RUC)),
   CLI_NOMBRE           VARCHAR2(100)         not null,
   CLI_DIRECCION        VARCHAR2(200)         not null,
   CLI_TELEFONO         VARCHAR2(10)          not null,
   CLI_CORREO           VARCHAR2(120)         not null
      constraint CKC_CLI_CORREO_CLIENTE check (CLI_CORREO = lower(CLI_CORREO)),
   CLI_CODIGO_POSTAL    VARCHAR2(6)           not null
      constraint CKC_CLI_CODIGO_POSTAL_CLIENTE check (CLI_CODIGO_POSTAL = upper(CLI_CODIGO_POSTAL)),
   constraint PK_CLIENTE primary key (CLI_CI_RUC)
)
   
/

comment on table CLIENTE is
'Tabla que contiene los clientes de la empresa'
/

comment on column CLIENTE.CLI_CI_RUC is
'Cédula de identidad o RUC del cliente'
/

comment on column CLIENTE.EMP_RUC is
'Ruc de la empresa'
/

comment on column CLIENTE.CLI_NOMBRE is
'Nombre del cliente
'
/

comment on column CLIENTE.CLI_DIRECCION is
'Dirección del cliente
'
/

comment on column CLIENTE.CLI_TELEFONO is
'Teléfono del cliente
'
/

comment on column CLIENTE.CLI_CORREO is
'Correo electrónico del cliente
'
/

comment on column CLIENTE.CLI_CODIGO_POSTAL is
'Código postal del cliente
'
/

/*==============================================================*/
/* Index: EMPRESA_CLIENTE_FK                                    */
/*==============================================================*/
create index EMPRESA_CLIENTE_FK on CLIENTE (
   EMP_RUC ASC
)

/

/*==============================================================*/
/* Table: COMISION_VENTA                                        */
/*==============================================================*/
create table COMISION_VENTA (
   COM_CODIGO           VARCHAR2(20)          not null
      constraint CKC_COM_CODIGO_COMISION check (COM_CODIGO = upper(COM_CODIGO)),
   PLE_CEDULA           VARCHAR2(10)          not null
      constraint CKC_PLE_CEDULA_COMISION check (PLE_CEDULA = upper(PLE_CEDULA)),
   FAC_NUMERO           NUMBER(10)            not null
      constraint CKC_FAC_NUMERO_COMISION check (FAC_NUMERO >= 1),
   COM_MONTO            NUMBER(10,4)          not null,
   constraint PK_COMISION_VENTA primary key (COM_CODIGO)
)
   
/

comment on table COMISION_VENTA is
'Tabla que contiene las comisiones de los vendedores'
/

comment on column COMISION_VENTA.COM_CODIGO is
'Código de la comisión, el código se conforma con la CÉDULA DEL EMPLEADO + NUMERO FACTURA'
/

comment on column COMISION_VENTA.PLE_CEDULA is
'Cédula del empleado de la empresa'
/

comment on column COMISION_VENTA.FAC_NUMERO is
'Número de la factura'
/

comment on column COMISION_VENTA.COM_MONTO is
'Valor de la comisión
'
/

/*==============================================================*/
/* Index: EMPLEADO_COMIVENTA_FK                                 */
/*==============================================================*/
create index EMPLEADO_COMIVENTA_FK on COMISION_VENTA (
   PLE_CEDULA ASC
)

/

/*==============================================================*/
/* Index: FACTURA_COMIVENTA2_FK                                 */
/*==============================================================*/
create index FACTURA_COMIVENTA2_FK on COMISION_VENTA (
   FAC_NUMERO ASC
)

/

/*==============================================================*/
/* Table: DEPARTAMENTO                                          */
/*==============================================================*/
create table DEPARTAMENTO (
   DPT_CODIGO           VARCHAR2(4)           not null
      constraint CKC_DPT_CODIGO_DEPARTAM check (DPT_CODIGO = upper(DPT_CODIGO)),
   EMP_RUC              VARCHAR2(13)          not null
      constraint CKC_EMP_RUC_DEPARTAM check (EMP_RUC = upper(EMP_RUC)),
   DPT_DESCRIPCION      VARCHAR2(200)         not null,
   constraint PK_DEPARTAMENTO primary key (DPT_CODIGO)
)
   
/

comment on table DEPARTAMENTO is
'Tabla que contiene los departamentos de la empresa'
/

comment on column DEPARTAMENTO.DPT_CODIGO is
'Código del departamento de la empresa dado en 2 caracteres'
/

comment on column DEPARTAMENTO.EMP_RUC is
'Ruc de la empresa'
/

comment on column DEPARTAMENTO.DPT_DESCRIPCION is
'Descripción del departamento de la empresa
'
/

/*==============================================================*/
/* Index: EMPRESA_DEPARTAMENTO_FK                               */
/*==============================================================*/
create index EMPRESA_DEPARTAMENTO_FK on DEPARTAMENTO (
   EMP_RUC ASC
)

/

/*==============================================================*/
/* Table: DETALLE_FACTURA                                       */
/*==============================================================*/
create table DETALLE_FACTURA (
   FAC_NUMERO           NUMBER(10)            not null
      constraint CKC_FAC_NUMERO_DETALLE_ check (FAC_NUMERO >= 1),
   PRD_CODIGO           VARCHAR2(13)          not null
      constraint CKC_PRD_CODIGO_DETALLE_ check (PRD_CODIGO = upper(PRD_CODIGO)),
   DFA_CANTIDAD         INTEGER               not null
      constraint CKC_DFA_CANTIDAD_DETALLE_ check (DFA_CANTIDAD >= 0),
   DFA_PRECIO_UNI       NUMBER(10,2)          not null
      constraint CKC_DFA_PRECIO_UNI_DETALLE_ check (DFA_PRECIO_UNI >= 0.00),
   DFA_COSTO_UNI        NUMBER(15,6),
   constraint PK_DETALLE_FACTURA primary key (FAC_NUMERO, PRD_CODIGO)
)
   
/

comment on table DETALLE_FACTURA is
'Tabla intersección que contiene el detalle de la factura o los productos de una factura'
/

comment on column DETALLE_FACTURA.FAC_NUMERO is
'Número de la factura'
/

comment on column DETALLE_FACTURA.PRD_CODIGO is
'Código interno del producto'
/

comment on column DETALLE_FACTURA.DFA_CANTIDAD is
'Cantidad de productos'
/

comment on column DETALLE_FACTURA.DFA_PRECIO_UNI is
'Precio unitario de los productos'
/

comment on column DETALLE_FACTURA.DFA_COSTO_UNI is
'Costo del producto en esa venta'
/

/*==============================================================*/
/* Index: PRODUCTO_DETAFACT_FK                                  */
/*==============================================================*/
create index PRODUCTO_DETAFACT_FK on DETALLE_FACTURA (
   PRD_CODIGO ASC
)

/

/*==============================================================*/
/* Index: FACTURA_DETAFACTU_FK                                  */
/*==============================================================*/
create index FACTURA_DETAFACTU_FK on DETALLE_FACTURA (
   FAC_NUMERO ASC
)

/

/*==============================================================*/
/* Table: EMPLEADO                                              */
/*==============================================================*/
create table EMPLEADO (
   PLE_CEDULA           VARCHAR2(10)          not null
      constraint CKC_PLE_CEDULA_EMPLEADO check (PLE_CEDULA = upper(PLE_CEDULA)),
   EMP_RUC              VARCHAR2(13)          not null
      constraint CKC_EMP_RUC_EMPLEADO check (EMP_RUC = upper(EMP_RUC)),
   SUC_CODIGO           VARCHAR2(8)           not null
      constraint CKC_SUC_CODIGO_EMPLEADO check (SUC_CODIGO = upper(SUC_CODIGO)),
   CIU_CODIGO           VARCHAR2(4)         
      constraint CKC_CIU_CODIGO_EMPLEADO check (CIU_CODIGO is null or (CIU_CODIGO = upper(CIU_CODIGO))),
   CRG_CODIGO           VARCHAR2(3)           not null
      constraint CKC_CRG_CODIGO_EMPLEADO check (CRG_CODIGO = upper(CRG_CODIGO)),
   DPT_CODIGO           VARCHAR2(4)           not null
      constraint CKC_DPT_CODIGO_EMPLEADO check (DPT_CODIGO = upper(DPT_CODIGO)),
   PLE_CODIGO           VARCHAR2(12)          not null
      constraint CKC_PLE_CODIGO_EMPLEADO check (PLE_CODIGO = upper(PLE_CODIGO)),
   PLE_NOMBRE           VARCHAR2(100)         not null,
   PLE_DIRECCION        VARCHAR2(200)         not null,
   PLE_TELEFONO         VARCHAR2(10)          not null,
   PLE_CARGO            VARCHAR2(50)          not null,
   PLE_CORREO           VARCHAR2(120)         not null
      constraint CKC_PLE_CORREO_EMPLEADO check (PLE_CORREO = lower(PLE_CORREO)),
   PLE_SUELDO           NUMBER(10,4)          not null,
   constraint PK_EMPLEADO primary key (PLE_CEDULA)
)
   
/

comment on table EMPLEADO is
'Tabla que contiene los empleados de la empresa'
/

comment on column EMPLEADO.PLE_CEDULA is
'Cédula del empleado de la empresa'
/

comment on column EMPLEADO.EMP_RUC is
'Ruc de la empresa'
/

comment on column EMPLEADO.SUC_CODIGO is
'Código de la sucursal'
/

comment on column EMPLEADO.CIU_CODIGO is
'Código de la ciudad'
/

comment on column EMPLEADO.CRG_CODIGO is
'Código del cargo que un empleado desempeña en la emprsea'
/

comment on column EMPLEADO.DPT_CODIGO is
'Código del departamento de la empresa dado en 2 caracteres'
/

comment on column EMPLEADO.PLE_CODIGO is
'Codigo único interno del empleado dado en  caracteres formado por el código del departamento y un secuencial en 2 digitos
'
/

comment on column EMPLEADO.PLE_NOMBRE is
'Nombre del empleado
'
/

comment on column EMPLEADO.PLE_DIRECCION is
'Dirección del empleado
'
/

comment on column EMPLEADO.PLE_TELEFONO is
'Teléfono del empleado
'
/

comment on column EMPLEADO.PLE_CARGO is
'Cargo del empleado
'
/

comment on column EMPLEADO.PLE_CORREO is
'Correo Elecrónico del empleado
'
/

comment on column EMPLEADO.PLE_SUELDO is
'Sueldo del empleado
'
/

/*==============================================================*/
/* Index: EMPRESA_EMPLEADO_FK                                   */
/*==============================================================*/
create index EMPRESA_EMPLEADO_FK on EMPLEADO (
   EMP_RUC ASC
)

/

/*==============================================================*/
/* Index: SUCURSAL_EMPLEADO_FK                                  */
/*==============================================================*/
create index SUCURSAL_EMPLEADO_FK on EMPLEADO (
   SUC_CODIGO ASC
)

/

/*==============================================================*/
/* Index: CIUDA_EMPLEADO_FK                                     */
/*==============================================================*/
create index CIUDA_EMPLEADO_FK on EMPLEADO (
   CIU_CODIGO ASC
)

/

/*==============================================================*/
/* Index: CARGO_EMPLEADO_FK                                     */
/*==============================================================*/
create index CARGO_EMPLEADO_FK on EMPLEADO (
   CRG_CODIGO ASC
)

/

/*==============================================================*/
/* Index: DEPARTAM_EMPLEADO_FK                                  */
/*==============================================================*/
create index DEPARTAM_EMPLEADO_FK on EMPLEADO (
   DPT_CODIGO ASC
)

/

/*==============================================================*/
/* Table: EMPRESA                                               */
/*==============================================================*/
create table EMPRESA (
   EMP_RUC              VARCHAR2(13)          not null
      constraint CKC_EMP_RUC_EMPRESA check (EMP_RUC = upper(EMP_RUC)),
   EMP_DESCRIPCION      VARCHAR2(100)         not null,
   EMP_DIRECCION        VARCHAR2(200)         not null,
   EMP_TELEFONO         VARCHAR2(10)          not null,
   EMP_CORREO           VARCHAR2(120)         not null
      constraint CKC_EMP_CORREO_EMPRESA check (EMP_CORREO = lower(EMP_CORREO)),
   EMP_REPRESENTANTE    VARCHAR2(60)          not null,
   EMP_IVA              NUMBER(10,4)          not null,
   EMP_PRC_UTILIDAD     NUMBER(10,4)          not null,
   EMP_PRC_COM_VENTA    NUMBER(10,4)          not null,
   EMP_CODIGO_SRI       VARCHAR2(20)          not null
      constraint CKC_EMP_CODIGO_SRI_EMPRESA check (EMP_CODIGO_SRI = upper(EMP_CODIGO_SRI)),
   constraint PK_EMPRESA primary key (EMP_RUC)
)
   
/

comment on table EMPRESA is
'Tabla que contiene la informaión de la empresa'
/

comment on column EMPRESA.EMP_RUC is
'Ruc de la empresa'
/

comment on column EMPRESA.EMP_DESCRIPCION is
'Descripción de la empresa
'
/

comment on column EMPRESA.EMP_DIRECCION is
'Dirección de la empresa
'
/

comment on column EMPRESA.EMP_TELEFONO is
'Teléfono de la empresa convencional o celular
'
/

comment on column EMPRESA.EMP_CORREO is
'Correo electrónico de la empresa
'
/

comment on column EMPRESA.EMP_REPRESENTANTE is
'Nombre del representante legal de la empresa
'
/

comment on column EMPRESA.EMP_IVA is
'Valor del iva que se considera para la facturación
'
/

comment on column EMPRESA.EMP_PRC_UTILIDAD is
'Porcentaje de utilidad que se concidera para las ventas (en caso de comercialización)
'
/

comment on column EMPRESA.EMP_PRC_COM_VENTA is
'Porcentaje de comición que se paga por las ventas
'
/

comment on column EMPRESA.EMP_CODIGO_SRI is
'Código asignado por el SRI a la empresa
'
/

/*==============================================================*/
/* Table: FACTURA                                               */
/*==============================================================*/
create table FACTURA (
   FAC_NUMERO           NUMBER(10)            not null
      constraint CKC_FAC_NUMERO_FACTURA check (FAC_NUMERO >= 1),
   SUC_CODIGO           VARCHAR2(8)           not null
      constraint CKC_SUC_CODIGO_FACTURA check (SUC_CODIGO = upper(SUC_CODIGO)),
   PLE_CEDULA           VARCHAR2(10)          not null
      constraint CKC_PLE_CEDULA_FACTURA check (PLE_CEDULA = upper(PLE_CEDULA)),
   CLI_CI_RUC           VARCHAR2(13)          not null
      constraint CKC_CLI_CI_RUC_FACTURA check (CLI_CI_RUC = upper(CLI_CI_RUC)),
   FAC_FECHA            DATE                  not null,
   FAC_ESTADO           CHAR(1)               not null
      constraint CKC_FAC_ESTADO_FACTURA check (FAC_ESTADO in ('V','A')),
   constraint PK_FACTURA primary key (FAC_NUMERO)
)
   
/

comment on table FACTURA is
'Tabla que contiene las facturas realizadas'
/

comment on column FACTURA.FAC_NUMERO is
'Número de la factura'
/

comment on column FACTURA.SUC_CODIGO is
'Código de la sucursal'
/

comment on column FACTURA.PLE_CEDULA is
'Cédula del empleado de la empresa'
/

comment on column FACTURA.CLI_CI_RUC is
'Cédula de identidad o RUC del cliente'
/

comment on column FACTURA.FAC_FECHA is
'Fecha de la factura
'
/

comment on column FACTURA.FAC_ESTADO is
'Estado de la factura puede ser (V=Vigente, A=Anulada)
'
/

/*==============================================================*/
/* Index: SUCURSAL_FACTURA_FK                                   */
/*==============================================================*/
create index SUCURSAL_FACTURA_FK on FACTURA (
   SUC_CODIGO ASC
)

/

/*==============================================================*/
/* Index: EMPLEADO_FACTURA_FK                                   */
/*==============================================================*/
create index EMPLEADO_FACTURA_FK on FACTURA (
   PLE_CEDULA ASC
)

/

/*==============================================================*/
/* Index: CLIENTE_FACTURA_FK                                    */
/*==============================================================*/
create index CLIENTE_FACTURA_FK on FACTURA (
   CLI_CI_RUC ASC
)

/

/*==============================================================*/
/* Table: KARDEX                                                */
/*==============================================================*/
create table KARDEX (
   KRD_NUMERO           NUMBER(10)            not null,
   BOD_CODIGO           VARCHAR2(4)           not null
      constraint CKC_BOD_CODIGO_KARDEX check (BOD_CODIGO = upper(BOD_CODIGO)),
   PRD_CODIGO           VARCHAR2(13)          not null
      constraint CKC_PRD_CODIGO_KARDEX check (PRD_CODIGO = upper(PRD_CODIGO)),
   LOT_NUMERO           NUMBER(12),
   UNM_CODIGO           VARCHAR2(6)           not null
      constraint CKC_UNM_CODIGO_KARDEX check (UNM_CODIGO = upper(UNM_CODIGO)),
   TRN_CODIGO           VARCHAR2(4)           not null
      constraint CKC_TRN_CODIGO_KARDEX check (TRN_CODIGO = upper(TRN_CODIGO)),
   FAC_NUMERO           NUMBER(10)          
      constraint CKC_FAC_NUMERO_KARDEX check (FAC_NUMERO is null or (FAC_NUMERO >= 1)),
   KRD_FECHA            DATE                  not null,
   KRD_CANTIDAD         NUMBER(12,2),
   KRD_COSTO            NUMBER(15,6)        
      constraint CKC_KRD_COSTO_KARDEX check (KRD_COSTO is null or (KRD_COSTO >= 0)),
   constraint PK_KARDEX primary key (KRD_NUMERO)
)
   
/

comment on table KARDEX is
'Tabla que contiene los movimientos de los productos de la bodega'
/

comment on column KARDEX.KRD_NUMERO is
'Numero de la transacción realizada en el movimiento de la bodega'
/

comment on column KARDEX.BOD_CODIGO is
'Código de la bodega'
/

comment on column KARDEX.PRD_CODIGO is
'Código interno del producto'
/

comment on column KARDEX.LOT_NUMERO is
'Numero del Lote de compra'
/

comment on column KARDEX.UNM_CODIGO is
'Código de la unidad de medida'
/

comment on column KARDEX.TRN_CODIGO is
'Código de la transaccion'
/

comment on column KARDEX.FAC_NUMERO is
'Número de la factura'
/

comment on column KARDEX.KRD_FECHA is
'Fecha de la transacción realizada en el movimiento de la bodega
'
/

comment on column KARDEX.KRD_CANTIDAD is
'Cantidad del producto que se esta moviendo '
/

comment on column KARDEX.KRD_COSTO is
'Costo del producto en ese movimineto de bodega'
/

/*==============================================================*/
/* Index: BODEGA_KARDEX_FK                                      */
/*==============================================================*/
create index BODEGA_KARDEX_FK on KARDEX (
   BOD_CODIGO ASC
)

/

/*==============================================================*/
/* Index: PRODUCTO_KARDEX_FK                                    */
/*==============================================================*/
create index PRODUCTO_KARDEX_FK on KARDEX (
   PRD_CODIGO ASC
)

/

/*==============================================================*/
/* Index: UNIDAMEDI_KARDEX_FK                                   */
/*==============================================================*/
create index UNIDAMEDI_KARDEX_FK on KARDEX (
   UNM_CODIGO ASC
)

/

/*==============================================================*/
/* Index: TRANSACCION_KARDEX_FK                                 */
/*==============================================================*/
create index TRANSACCION_KARDEX_FK on KARDEX (
   TRN_CODIGO ASC
)

/

/*==============================================================*/
/* Index: FACTURA_KARDEX_FK                                     */
/*==============================================================*/
create index FACTURA_KARDEX_FK on KARDEX (
   FAC_NUMERO ASC
)

/

/*==============================================================*/
/* Index: LOTEENTRA_KARDEX_FK                                   */
/*==============================================================*/
create index LOTEENTRA_KARDEX_FK on KARDEX (
   LOT_NUMERO ASC
)

/

/*==============================================================*/
/* Table: LOTE_ENTRADA                                          */
/*==============================================================*/
create table LOTE_ENTRADA (
   LOT_NUMERO           NUMBER(12)            not null,
   BOD_CODIGO           VARCHAR2(4)           not null
      constraint CKC_BOD_CODIGO_LOTE_ENT check (BOD_CODIGO = upper(BOD_CODIGO)),
   ORC_NUMERO           NUMBER(10)            not null
      constraint CKC_ORC_NUMERO_LOTE_ENT check (ORC_NUMERO >= 1),
   PRD_CODIGO           VARCHAR2(13)          not null
      constraint CKC_PRD_CODIGO_LOTE_ENT check (PRD_CODIGO = upper(PRD_CODIGO)),
   LOT_FECHA_INGRESO    DATE,
   LOT_CANTIDAD         NUMBER(12,4)        
      constraint CKC_LOT_CANTIDAD_LOTE_ENT check (LOT_CANTIDAD is null or (LOT_CANTIDAD >= 1)),
   LOT_COSTO_UNIT       NUMBER(15,6)        
      constraint CKC_LOT_COSTO_UNIT_LOTE_ENT check (LOT_COSTO_UNIT is null or (LOT_COSTO_UNIT >= 0)),
   LOT_SALDO            NUMBER(12,4)        
      constraint CKC_LOT_SALDO_LOTE_ENT check (LOT_SALDO is null or (LOT_SALDO >= 0)),
   constraint PK_LOTE_ENTRADA primary key (LOT_NUMERO)
)
   
/

comment on table LOTE_ENTRADA is
'Tabla que contiene los lotes de compra para el registro de las ventas de acuerdo al metodo que requiere el producto.'
/

comment on column LOTE_ENTRADA.LOT_NUMERO is
'Numero del Lote de compra'
/

comment on column LOTE_ENTRADA.BOD_CODIGO is
'Código de la bodega'
/

comment on column LOTE_ENTRADA.ORC_NUMERO is
'Número de la orden de compra'
/

comment on column LOTE_ENTRADA.PRD_CODIGO is
'Código interno del producto'
/

comment on column LOTE_ENTRADA.LOT_FECHA_INGRESO is
'Fecha de ingreso del lote de compra'
/

comment on column LOTE_ENTRADA.LOT_CANTIDAD is
'Cantidad de la compra de ese producto'
/

comment on column LOTE_ENTRADA.LOT_COSTO_UNIT is
'Costo de la compra del producto en ese lote'
/

comment on column LOTE_ENTRADA.LOT_SALDO is
'Saldo del producto en ese lote'
/

/*==============================================================*/
/* Index: PRODUCTO_LOTEENTRA_FK                                 */
/*==============================================================*/
create index PRODUCTO_LOTEENTRA_FK on LOTE_ENTRADA (
   PRD_CODIGO ASC
)

/

/*==============================================================*/
/* Index: ORD_COMP_LOTE_ENTRA_FK                                */
/*==============================================================*/
create index ORD_COMP_LOTE_ENTRA_FK on LOTE_ENTRADA (
   ORC_NUMERO ASC
)

/

/*==============================================================*/
/* Index: BODEWGA_LOT_ENTRA_FK                                  */
/*==============================================================*/
create index BODEWGA_LOT_ENTRA_FK on LOTE_ENTRADA (
   BOD_CODIGO ASC
)

/

/*==============================================================*/
/* Table: ORDEN_COMPRA                                          */
/*==============================================================*/
create table ORDEN_COMPRA (
   ORC_NUMERO           NUMBER(10)            not null
      constraint CKC_ORC_NUMERO_ORDEN_CO check (ORC_NUMERO >= 1),
   PRV_CI_RUC           VARCHAR2(13)          not null
      constraint CKC_PRV_CI_RUC_ORDEN_CO check (PRV_CI_RUC = upper(PRV_CI_RUC)),
   PLE_CEDULA           VARCHAR2(10)          not null
      constraint CKC_PLE_CEDULA_ORDEN_CO check (PLE_CEDULA = upper(PLE_CEDULA)),
   ORC_FECHA_COM        DATE                  not null,
   ORC_FECHA_ENTREGA    DATE                  not null,
   ORC_ESTADO           CHAR(1)               not null,
   ORC_MONTO            NUMBER(10,2)          not null,
   constraint PK_ORDEN_COMPRA primary key (ORC_NUMERO)
)
   
/

comment on table ORDEN_COMPRA is
'Tabla que contiene las ordedes de compra de los proveedores'
/

comment on column ORDEN_COMPRA.ORC_NUMERO is
'Número de la orden de compra'
/

comment on column ORDEN_COMPRA.PRV_CI_RUC is
'Cédula de identidad o RUC del proveedor'
/

comment on column ORDEN_COMPRA.PLE_CEDULA is
'Cédula del empleado de la empresa'
/

comment on column ORDEN_COMPRA.ORC_FECHA_COM is
'Fecha de la orden de compra
'
/

comment on column ORDEN_COMPRA.ORC_FECHA_ENTREGA is
'Fecha limite para la entrega de la orden de compra
'
/

comment on column ORDEN_COMPRA.ORC_ESTADO is
'Estado de la orden de compra
'
/

comment on column ORDEN_COMPRA.ORC_MONTO is
'Monto total en dinero de la orden de compra
'
/

/*==============================================================*/
/* Index: PROVEEDOR_ORDENCOMP_FK                                */
/*==============================================================*/
create index PROVEEDOR_ORDENCOMP_FK on ORDEN_COMPRA (
   PRV_CI_RUC ASC
)

/

/*==============================================================*/
/* Index: EMPLEADO_ORDECOMP_FK                                  */
/*==============================================================*/
create index EMPLEADO_ORDECOMP_FK on ORDEN_COMPRA (
   PLE_CEDULA ASC
)

/

/*==============================================================*/
/* Index: UNIDAMEDI_PRODUCTO_FK (Movido al final)               */
/*==============================================================*/

/*==============================================================*/
/* Index: CATEGORIA_PRODUCTO_FK (Movido al final)               */
/*==============================================================*/

/*==============================================================*/
/* Table: PROD_BODGA                                            */
/*==============================================================*/
create table PROD_BODGA (
   PRD_CODIGO           VARCHAR2(13)          not null
      constraint CKC_PRD_CODIGO_PROD_BOD check (PRD_CODIGO = upper(PRD_CODIGO)),
   BOD_CODIGO           VARCHAR2(4)           not null
      constraint CKC_BOD_CODIGO_PROD_BOD check (BOD_CODIGO = upper(BOD_CODIGO)),
   PRB_EXISTENCIA       INTEGER               not null
      constraint CKC_PRB_EXISTENCIA_PROD_BOD check (PRB_EXISTENCIA >= 0),
   constraint PK_PROD_BODGA primary key (PRD_CODIGO, BOD_CODIGO)
)
   
/

comment on table PROD_BODGA is
'Tabla intercección que contiene los productos de una biodega'
/

comment on column PROD_BODGA.PRD_CODIGO is
'Código interno del producto'
/

comment on column PROD_BODGA.BOD_CODIGO is
'Código de la bodega'
/

comment on column PROD_BODGA.PRB_EXISTENCIA is
'Stock de los productos en bodega'
/

/*==============================================================*/
/* Index: BODEGA_PRODUCBODE_FK                                  */
/*==============================================================*/
create index BODEGA_PRODUCBODE_FK on PROD_BODGA (
   BOD_CODIGO ASC
)

/

/*==============================================================*/
/* Index: PRODUCTO_PRODBODE_FK                                  */
/*==============================================================*/
create index PRODUCTO_PRODBODE_FK on PROD_BODGA (
   PRD_CODIGO ASC
)

/

/*==============================================================*/
/* Table: PROD_CARRITO                                          */
/*==============================================================*/
create table PROD_CARRITO (
   PRD_CODIGO           VARCHAR2(13)          not null
      constraint CKC_PRD_CODIGO_PROD_CAR check (PRD_CODIGO = upper(PRD_CODIGO)),
   CRR_CED_RUC_CLI      VARCHAR2(13)          not null
      constraint CKC_CRR_CED_RUC_CLI_PROD_CAR check (CRR_CED_RUC_CLI = upper(CRR_CED_RUC_CLI)),
   PCA_CANTIDAD         INTEGER               not null
      constraint CKC_PCA_CANTIDAD_PROD_CAR check (PCA_CANTIDAD >= 0),
   constraint PK_PROD_CARRITO primary key (PRD_CODIGO, CRR_CED_RUC_CLI)
)
   
/

comment on table PROD_CARRITO is
'Tabla intercecsion que contiene los productos que el cliente pone en el carrito de compras '
/

comment on column PROD_CARRITO.PRD_CODIGO is
'Código interno del producto'
/

comment on column PROD_CARRITO.CRR_CED_RUC_CLI is
'Cedula o RUC del cliente dueño del carrito'
/

comment on column PROD_CARRITO.PCA_CANTIDAD is
'Cantidad de productos'
/

/*==============================================================*/
/* Index: CARRITO_PRODCARRITO_FK                                */
/*==============================================================*/
create index CARRITO_PRODCARRITO_FK on PROD_CARRITO (
   CRR_CED_RUC_CLI ASC
)

/

/*==============================================================*/
/* Index: PRODUCTO_PRODCARR_FK                                  */
/*==============================================================*/
create index PRODUCTO_PRODCARR_FK on PROD_CARRITO (
   PRD_CODIGO ASC
)

/

/*==============================================================*/
/* Table: PROD_ORDENCOMPRA                                      */
/*==============================================================*/
create table PROD_ORDENCOMPRA (
   PRD_CODIGO           VARCHAR2(13)          not null
      constraint CKC_PRD_CODIGO_PROD_ORD check (PRD_CODIGO = upper(PRD_CODIGO)),
   ORC_NUMERO           NUMBER(10)            not null
      constraint CKC_ORC_NUMERO_PROD_ORD check (ORC_NUMERO >= 1),
   POR_CANTIDAD         INTEGER               not null
      constraint CKC_POR_CANTIDAD_PROD_ORD check (POR_CANTIDAD >= 0),
   constraint PK_PROD_ORDENCOMPRA primary key (PRD_CODIGO, ORC_NUMERO)
)
   
/

comment on table PROD_ORDENCOMPRA is
'Tabla intercección que contiene los productos de una orden de compra'
/

comment on column PROD_ORDENCOMPRA.PRD_CODIGO is
'Código interno del producto'
/

comment on column PROD_ORDENCOMPRA.ORC_NUMERO is
'Número de la orden de compra'
/

comment on column PROD_ORDENCOMPRA.POR_CANTIDAD is
'Cantidad de productos'
/

/*==============================================================*/
/* Index: ORDENCOMP_PRODORDCOM_FK                               */
/*==============================================================*/
create index ORDENCOMP_PRODORDCOM_FK on PROD_ORDENCOMPRA (
   ORC_NUMERO ASC
)

/

/*==============================================================*/
/* Index: PRODUCTO_PRODORDECOM_FK                               */
/*==============================================================*/
create index PRODUCTO_PRODORDECOM_FK on PROD_ORDENCOMPRA (
   PRD_CODIGO ASC
)

/

/*==============================================================*/
/* Table: PROMOCION                                             */
/*==============================================================*/
create table PROMOCION (
   PRM_NUMERO           NUMBER(10)            not null
      constraint CKC_PRM_NUMERO_PROMOCIO check (PRM_NUMERO >= 1),
   PRM_DESCRIPCION      VARCHAR2(150)         not null,
   PRM_FECHA_INI        DATE                  not null,
   PRM_FECHA_FIN        DATE                  not null,
   PRM_DETALLE          VARCHAR2(200)         not null,
   PRM_PORCENTAJE       NUMBER(5,2)           not null,
   constraint PK_PROMOCION primary key (PRM_NUMERO)
)
   
/

comment on table PROMOCION is
'Tabla que contiene las promociones '
/

comment on column PROMOCION.PRM_NUMERO is
'Número de la promoción'
/

comment on column PROMOCION.PRM_DESCRIPCION is
'Descripción de la promoción
'
/

comment on column PROMOCION.PRM_FECHA_INI is
'Fecha de inicio de la promoción 
'
/

comment on column PROMOCION.PRM_FECHA_FIN is
'Fecha de finalización de la promoción
'
/

comment on column PROMOCION.PRM_DETALLE is
'Detalle de la promoción
'
/

comment on column PROMOCION.PRM_PORCENTAJE is
'Porcentaje que se aplicará a la promoción 
'
/

/*==============================================================*/
/* Table: PROMO_PROD                                            */
/*==============================================================*/
create table PROMO_PROD (
   PRD_CODIGO           VARCHAR2(13)          not null
      constraint CKC_PRD_CODIGO_PROMO_PR check (PRD_CODIGO = upper(PRD_CODIGO)),
   PRM_NUMERO           NUMBER(10)            not null
      constraint CKC_PRM_NUMERO_PROMO_PR check (PRM_NUMERO >= 1),
   constraint PK_PROMO_PROD primary key (PRD_CODIGO, PRM_NUMERO)
)
   
/

comment on table PROMO_PROD is
'Tabla intersección que contiene los productos que se encuentran en una promoción determinada'
/

comment on column PROMO_PROD.PRD_CODIGO is
'Código interno del producto'
/

comment on column PROMO_PROD.PRM_NUMERO is
'Número de la promoción'
/

/*==============================================================*/
/* Index: PROMOCION_PRODPROMO_FK                                */
/*==============================================================*/
create index PROMOCION_PRODPROMO_FK on PROMO_PROD (
   PRM_NUMERO ASC
)

/

/*==============================================================*/
/* Index: PRODUCTO_PRODPROMO_FK                                 */
/*==============================================================*/
create index PRODUCTO_PRODPROMO_FK on PROMO_PROD (
   PRD_CODIGO ASC
)

/

/*==============================================================*/
/* Table: PROVEEDOR                                             */
/*==============================================================*/
create table PROVEEDOR (
   PRV_CI_RUC           VARCHAR2(13)          not null
      constraint CKC_PRV_CI_RUC_PROVEEDO check (PRV_CI_RUC = upper(PRV_CI_RUC)),
   PRV_NOMBRE           VARCHAR2(100)         not null,
   PRV_DIRECCION        VARCHAR2(200)         not null,
   PRV_TELEFONO         VARCHAR2(10)          not null,
   PRV_CORREO           VARCHAR2(120)         not null
      constraint CKC_PRV_CORREO_PROVEEDO check (PRV_CORREO = lower(PRV_CORREO)),
   PRV_CONTACTO         VARCHAR2(100)         not null,
   PRV_DIAS_ENTRERGA    INTEGER               not null,
   constraint PK_PROVEEDOR primary key (PRV_CI_RUC)
)
   
/

comment on table PROVEEDOR is
'Tabla que contiene los provedores de la empresa '
/

comment on column PROVEEDOR.PRV_CI_RUC is
'Cédula de identidad o RUC del proveedor'
/

comment on column PROVEEDOR.PRV_NOMBRE is
'Nombre del proveedor
'
/

comment on column PROVEEDOR.PRV_DIRECCION is
'Dirección del proveedor
'
/

comment on column PROVEEDOR.PRV_TELEFONO is
'Teléfono de contacto del proveedor
'
/

comment on column PROVEEDOR.PRV_CORREO is
'Correo electrónico del proveedor
'
/

comment on column PROVEEDOR.PRV_CONTACTO is
'Nombre de la persona de contacto en el proveedor
'
/

comment on column PROVEEDOR.PRV_DIAS_ENTRERGA is
'Número de días definidos por el provedor para entrega de productos
'
/

/*==============================================================*/
/* Table: PROVE_PROD                                            */
/*==============================================================*/
create table PROVE_PROD (
   PRD_CODIGO           VARCHAR2(13)          not null
      constraint CKC_PRD_CODIGO_PROVE_PR check (PRD_CODIGO = upper(PRD_CODIGO)),
   PRV_CI_RUC           VARCHAR2(13)          not null
      constraint CKC_PRV_CI_RUC_PROVE_PR check (PRV_CI_RUC = upper(PRV_CI_RUC)),
   constraint PK_PROVE_PROD primary key (PRD_CODIGO, PRV_CI_RUC)
)
   
/

comment on table PROVE_PROD is
'Tabla intersección que contiene los productos que provee a la empresa un proveedor'
/

comment on column PROVE_PROD.PRD_CODIGO is
'Código interno del producto'
/

comment on column PROVE_PROD.PRV_CI_RUC is
'Cédula de identidad o RUC del proveedor'
/

/*==============================================================*/
/* Index: PROVEEDOR_PRODPROVEE_FK                               */
/*==============================================================*/
create index PROVEEDOR_PRODPROVEE_FK on PROVE_PROD (
   PRV_CI_RUC ASC
)

/

/*==============================================================*/
/* Index: PRODUCTO_PRODPROVEE_FK                                */
/*==============================================================*/
create index PRODUCTO_PRODPROVEE_FK on PROVE_PROD (
   PRD_CODIGO ASC
)

/

/*==============================================================*/
/* Table: PROVINCIA                                             */
/*==============================================================*/
create table PROVINCIA (
   PRO_CODIGO           VARCHAR2(2)           not null
      constraint CKC_PRO_CODIGO_PROVINCI check (PRO_CODIGO = upper(PRO_CODIGO)),
   PRO_DESCRIPCION      VARCHAR2(100)         not null,
   constraint PK_PROVINCIA primary key (PRO_CODIGO)
)
   
/

comment on table PROVINCIA is
'Tabla que contiene la información de provincias'
/

comment on column PROVINCIA.PRO_CODIGO is
'Código de la provincia'
/

comment on column PROVINCIA.PRO_DESCRIPCION is
'Descripción de la provincia
'
/

/*==============================================================*/
/* Table: SUCURSAL                                              */
/*==============================================================*/
create table SUCURSAL (
   SUC_CODIGO           VARCHAR2(8)           not null
      constraint CKC_SUC_CODIGO_SUCURSAL check (SUC_CODIGO = upper(SUC_CODIGO)),
   EMP_RUC              VARCHAR2(13)          not null
      constraint CKC_EMP_RUC_SUCURSAL check (EMP_RUC = upper(EMP_RUC)),
   CIU_CODIGO           VARCHAR2(4)           not null
      constraint CKC_CIU_CODIGO_SUCURSAL check (CIU_CODIGO = upper(CIU_CODIGO)),
   SUC_DESCRIPCION      VARCHAR2(100)         not null,
   SUC_DIRECCION        VARCHAR2(200)         not null,
   SUC_TELEFONO         VARCHAR2(10)          not null,
   SUC_CORREO           VARCHAR2(120)         not null
      constraint CKC_SUC_CORREO_SUCURSAL check (SUC_CORREO = lower(SUC_CORREO)),
   SUC_RESPONSABLE      VARCHAR2(80)          not null,
   SUC_CODIGO_SRI       VARCHAR2(20)          not null
      constraint CKC_SUC_CODIGO_SRI_SUCURSAL check (SUC_CODIGO_SRI = upper(SUC_CODIGO_SRI)),
   SUC_NUMFACINI        VARCHAR2(17)          not null,
   constraint PK_SUCURSAL primary key (SUC_CODIGO)
)
   
/

comment on table SUCURSAL is
'Tabla que contiene las sucursales de la empresa'
/

comment on column SUCURSAL.SUC_CODIGO is
'Código de la sucursal'
/

comment on column SUCURSAL.EMP_RUC is
'Ruc de la empresa'
/

comment on column SUCURSAL.CIU_CODIGO is
'Código de la ciudad'
/

comment on column SUCURSAL.SUC_DESCRIPCION is
'Descripción de la sucursal
'
/

comment on column SUCURSAL.SUC_DIRECCION is
'Dirección de la sucursal
'
/

comment on column SUCURSAL.SUC_TELEFONO is
'Teléfono de la sucursal, convencional o celular
'
/

comment on column SUCURSAL.SUC_CORREO is
'Correo electrónico de la sucursal
'
/

comment on column SUCURSAL.SUC_RESPONSABLE is
'Nombre del responsable de la sucursal
'
/

comment on column SUCURSAL.SUC_CODIGO_SRI is
'Codigo de sucursal asignado por el SRI
'
/

comment on column SUCURSAL.SUC_NUMFACINI is
'Número e la factura en curso
'
/

/*==============================================================*/
/* Index: EMPRESA_SUCURSAL_FK                                   */
/*==============================================================*/
create index EMPRESA_SUCURSAL_FK on SUCURSAL (
   EMP_RUC ASC
)

/

/*==============================================================*/
/* Index: CIUDAD_SUCURSAL_FK                                    */
/*==============================================================*/
create index CIUDAD_SUCURSAL_FK on SUCURSAL (
   CIU_CODIGO ASC
)

/

/*==============================================================*/
/* Table: TRANSACCION                                           */
/*==============================================================*/
create table TRANSACCION (
   TRN_CODIGO           VARCHAR2(4)           not null
      constraint CKC_TRN_CODIGO_TRANSACC check (TRN_CODIGO = upper(TRN_CODIGO)),
   TRN_DESCRIPCION      VARCHAR2(120)         not null,
   TRN_TIPO             CHAR(1)               not null
      constraint CKC_TRN_TIPO_TRANSACC check (TRN_TIPO in ('I','E') and TRN_TIPO = upper(TRN_TIPO)),
   constraint PK_TRANSACCION primary key (TRN_CODIGO)
)
   
/

comment on table TRANSACCION is
'Tabla que contiene las transacciones que se puede aplicar en un movimineto de bodega'
/

comment on column TRANSACCION.TRN_CODIGO is
'Código de la transaccion'
/

comment on column TRANSACCION.TRN_DESCRIPCION is
'Descripción de la transacción
'
/

comment on column TRANSACCION.TRN_TIPO is
'Indicador del tipo de transacción (I=Ingreso, E=Egreso)
'
/

/*==============================================================*/
/* Table: UNIDAD_MEDIDA                                         */
/*==============================================================*/
create table UNIDAD_MEDIDA (
   UNM_CODIGO           VARCHAR2(6)           not null
      constraint CKC_UNM_CODIGO_UNIDAD_M check (UNM_CODIGO = upper(UNM_CODIGO)),
   UNM_DESCRIPCION      VARCHAR2(100)         not null,
   constraint PK_UNIDAD_MEDIDA primary key (UNM_CODIGO)
)
   
/

comment on table UNIDAD_MEDIDA is
'Tabla que contiene las unidades de medida de los productos'
/

comment on column UNIDAD_MEDIDA.UNM_CODIGO is
'Código de la unidad de medida'
/

comment on column UNIDAD_MEDIDA.UNM_DESCRIPCION is
'Descripción de la unidad de medida
'
/

/*==============================================================*/
/* Table: USUARIO_A                                             */
/*==============================================================*/
create table USUARIO_A (
   URA_USUARIO          VARCHAR2(10)          not null
      constraint CKC_URA_USUARIO_USUARIO_ check (URA_USUARIO = upper(URA_USUARIO)),
   CLI_CI_RUC           VARCHAR2(13)          not null
      constraint CKC_CLI_CI_RUC_USUARIO_ check (CLI_CI_RUC = upper(CLI_CI_RUC)),
   URA_CLAVE            VARCHAR2(20)          not null,
   constraint PK_USUARIO_A primary key (URA_USUARIO)
)
   
/

comment on table USUARIO_A is
'Tabla que contiene los usuarios del comercio electrónico'
/

comment on column USUARIO_A.URA_USUARIO is
'Login del usuario de la aplicación'
/

comment on column USUARIO_A.CLI_CI_RUC is
'Cédula de identidad o RUC del cliente'
/

comment on column USUARIO_A.URA_CLAVE is
'Clave del usuario de la aplicación.
'
/

/*==============================================================*/
/* Index: CLIENTE_USUARIO_A2_FK                                 */
/*==============================================================*/
create index CLIENTE_USUARIO_A2_FK on USUARIO_A (
   CLI_CI_RUC ASC
)

/










































































































































































































-- ==============================================================
-- FUSIÓN QUIRÚRGICA (ALTER TABLES)
-- ==============================================================

-- 1. CATEGORIAS (Añadir columnas del nuevo modelo)
ALTER TABLE CATEGORIAS RENAME TO CATEGORIA;
ALTER TABLE CATEGORIA ADD (
    CAT_CODIGO VARCHAR2(4),
    CAT_DESCRIPCION VARCHAR2(120)
);

-- Agregar restricción UNIQUE para que las llaves foráneas puedan apuntar a CAT_CODIGO
ALTER TABLE CATEGORIA ADD CONSTRAINT UQ_CAT_CODIGO UNIQUE (CAT_CODIGO);

-- 2. PRODUCTO (Añadir y modificar columnas del nuevo modelo)
-- Eliminamos PRD_CATEGORIA si ya no se usa, o lo reemplazamos
ALTER TABLE PRODUCTO ADD (
    UNM_CODIGO VARCHAR2(6),
    CAT_CODIGO VARCHAR2(4),
    PRD_CODIGO_BARRA VARCHAR2(13),
    PRD_PRECIO_COMPRA NUMBER(10,4),
    PRD_PRECIO_VENTA NUMBER(10,4),
    PRD_PRECIO_VEN_ANT NUMBER(10,4),
    PRD_PAGA_IVA CHAR(1) DEFAULT 'S' CHECK (PRD_PAGA_IVA IN ('S','N')),
    PRD_STOCK_MIN INTEGER DEFAULT 0,
    PRD_METODO_VALORA VARCHAR2(1) CHECK (PRD_METODO_VALORA IN ('F','L','P','E'))
);

ALTER TABLE PRODUCTO MODIFY (
    PRD_CODIGO VARCHAR2(13),
    PRD_DESCRIPCION VARCHAR2(1000)
);

create index UNIDAMEDI_PRODUCTO_FK on PRODUCTO (
   UNM_CODIGO ASC
);

create index CATEGORIA_PRODUCTO_FK on PRODUCTO (
   CAT_CODIGO ASC
);

-- 3. PAGOS (Ajustar para que apunte a FACTURA en lugar de PEDIDOCLIENTE y quitar trigger distribuido)
BEGIN
   EXECUTE IMMEDIATE 'DROP TRIGGER TIB_PAGOS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -4080 THEN
         RAISE;
      END IF;
END;
/

ALTER TABLE PAGOS RENAME COLUMN PED_NUMERO TO FAC_NUMERO;
ALTER TABLE PAGOS ADD CONSTRAINT FK_PAGOS_FACTURA FOREIGN KEY (FAC_NUMERO) REFERENCES FACTURA(FAC_NUMERO) ON DELETE CASCADE ENABLE NOVALIDATE;

-- ==============================================================
-- LLAVES FORÁNEAS FÍSICAS RECONSTRUIDAS 
-- ==============================================================
ALTER TABLE BODEGA ADD CONSTRAINT FK_BODEGA_SUCURSAL_SUC_CODIGO FOREIGN KEY (SUC_CODIGO) REFERENCES SUCURSAL(SUC_CODIGO);
ALTER TABLE CARRITO ADD CONSTRAINT FK_CARRITO_CLIENTE_CLI_CI_RUC FOREIGN KEY (CLI_CI_RUC) REFERENCES CLIENTE(CLI_CI_RUC);
ALTER TABLE CIUDAD ADD CONSTRAINT FK_CIUDAD_PROVINCIA_PRO_CODIGO FOREIGN KEY (PRO_CODIGO) REFERENCES PROVINCIA(PRO_CODIGO);
ALTER TABLE CLIENTE ADD CONSTRAINT FK_CLIENTE_EMPRESA_EMP_RUC FOREIGN KEY (EMP_RUC) REFERENCES EMPRESA(EMP_RUC);
ALTER TABLE COMISION_VENTA ADD CONSTRAINT FK_COMISION_VENTA_EMPLEADO_PLE_CEDULA FOREIGN KEY (PLE_CEDULA) REFERENCES EMPLEADO(PLE_CEDULA);
ALTER TABLE COMISION_VENTA ADD CONSTRAINT FK_COMISION_VENTA_FACTURA_FAC_NUMERO FOREIGN KEY (FAC_NUMERO) REFERENCES FACTURA(FAC_NUMERO);
ALTER TABLE DEPARTAMENTO ADD CONSTRAINT FK_DEPARTAMENTO_EMPRESA_EMP_RUC FOREIGN KEY (EMP_RUC) REFERENCES EMPRESA(EMP_RUC);
ALTER TABLE DETALLE_FACTURA ADD CONSTRAINT FK_DETALLE_FACTURA_PRODUCTO_PRD_CODIGO FOREIGN KEY (PRD_CODIGO) REFERENCES PRODUCTO(PRD_CODIGO);
ALTER TABLE DETALLE_FACTURA ADD CONSTRAINT FK_DETALLE_FACTURA_FACTURA_FAC_NUMERO FOREIGN KEY (FAC_NUMERO) REFERENCES FACTURA(FAC_NUMERO);
ALTER TABLE EMPLEADO ADD CONSTRAINT FK_EMPLEADO_EMPRESA_EMP_RUC FOREIGN KEY (EMP_RUC) REFERENCES EMPRESA(EMP_RUC);
ALTER TABLE EMPLEADO ADD CONSTRAINT FK_EMPLEADO_SUCURSAL_SUC_CODIGO FOREIGN KEY (SUC_CODIGO) REFERENCES SUCURSAL(SUC_CODIGO);
ALTER TABLE EMPLEADO ADD CONSTRAINT FK_EMPLEADO_CIUDAD_CIU_CODIGO FOREIGN KEY (CIU_CODIGO) REFERENCES CIUDAD(CIU_CODIGO);
ALTER TABLE EMPLEADO ADD CONSTRAINT FK_EMPLEADO_CARGO_CRG_CODIGO FOREIGN KEY (CRG_CODIGO) REFERENCES CARGO(CRG_CODIGO);
ALTER TABLE EMPLEADO ADD CONSTRAINT FK_EMPLEADO_DEPARTAMENTO_DPT_CODIGO FOREIGN KEY (DPT_CODIGO) REFERENCES DEPARTAMENTO(DPT_CODIGO);
ALTER TABLE FACTURA ADD CONSTRAINT FK_FACTURA_SUCURSAL_SUC_CODIGO FOREIGN KEY (SUC_CODIGO) REFERENCES SUCURSAL(SUC_CODIGO);
ALTER TABLE FACTURA ADD CONSTRAINT FK_FACTURA_EMPLEADO_PLE_CEDULA FOREIGN KEY (PLE_CEDULA) REFERENCES EMPLEADO(PLE_CEDULA);
ALTER TABLE FACTURA ADD CONSTRAINT FK_FACTURA_CLIENTE_CLI_CI_RUC FOREIGN KEY (CLI_CI_RUC) REFERENCES CLIENTE(CLI_CI_RUC);
ALTER TABLE KARDEX ADD CONSTRAINT FK_KARDEX_BODEGA_BOD_CODIGO FOREIGN KEY (BOD_CODIGO) REFERENCES BODEGA(BOD_CODIGO);
ALTER TABLE KARDEX ADD CONSTRAINT FK_KARDEX_PRODUCTO_PRD_CODIGO FOREIGN KEY (PRD_CODIGO) REFERENCES PRODUCTO(PRD_CODIGO);
ALTER TABLE KARDEX ADD CONSTRAINT FK_KARDEX_UNIDAD_MEDIDA_UNM_CODIGO FOREIGN KEY (UNM_CODIGO) REFERENCES UNIDAD_MEDIDA(UNM_CODIGO);
ALTER TABLE KARDEX ADD CONSTRAINT FK_KARDEX_TRANSACCION_TRN_CODIGO FOREIGN KEY (TRN_CODIGO) REFERENCES TRANSACCION(TRN_CODIGO);
ALTER TABLE KARDEX ADD CONSTRAINT FK_KARDEX_FACTURA_FAC_NUMERO FOREIGN KEY (FAC_NUMERO) REFERENCES FACTURA(FAC_NUMERO);
ALTER TABLE KARDEX ADD CONSTRAINT FK_KARDEX_LOTE_ENTRADA_LOT_NUMERO FOREIGN KEY (LOT_NUMERO) REFERENCES LOTE_ENTRADA(LOT_NUMERO);
ALTER TABLE LOTE_ENTRADA ADD CONSTRAINT FK_LOTE_ENTRADA_PRODUCTO_PRD_CODIGO FOREIGN KEY (PRD_CODIGO) REFERENCES PRODUCTO(PRD_CODIGO);
ALTER TABLE LOTE_ENTRADA ADD CONSTRAINT FK_LOTE_ENTRADA_ORDEN_COMPRA_ORC_NUMERO FOREIGN KEY (ORC_NUMERO) REFERENCES ORDEN_COMPRA(ORC_NUMERO);
ALTER TABLE LOTE_ENTRADA ADD CONSTRAINT FK_LOTE_ENTRADA_BODEGA_BOD_CODIGO FOREIGN KEY (BOD_CODIGO) REFERENCES BODEGA(BOD_CODIGO);
ALTER TABLE ORDEN_COMPRA ADD CONSTRAINT FK_ORDEN_COMPRA_PROVEEDOR_PRV_CI_RUC FOREIGN KEY (PRV_CI_RUC) REFERENCES PROVEEDOR(PRV_CI_RUC);
ALTER TABLE ORDEN_COMPRA ADD CONSTRAINT FK_ORDEN_COMPRA_EMPLEADO_PLE_CEDULA FOREIGN KEY (PLE_CEDULA) REFERENCES EMPLEADO(PLE_CEDULA);
ALTER TABLE PRODUCTO ADD CONSTRAINT FK_PRODUCTO_UNIDAD_MEDIDA_UNM_CODIGO FOREIGN KEY (UNM_CODIGO) REFERENCES UNIDAD_MEDIDA(UNM_CODIGO);
ALTER TABLE PRODUCTO ADD CONSTRAINT FK_PRODUCTO_CATEGORIA_CAT_CODIGO FOREIGN KEY (CAT_CODIGO) REFERENCES CATEGORIA(CAT_CODIGO);
ALTER TABLE PROD_BODGA ADD CONSTRAINT FK_PROD_BODGA_BODEGA_BOD_CODIGO FOREIGN KEY (BOD_CODIGO) REFERENCES BODEGA(BOD_CODIGO);
ALTER TABLE PROD_BODGA ADD CONSTRAINT FK_PROD_BODGA_PRODUCTO_PRD_CODIGO FOREIGN KEY (PRD_CODIGO) REFERENCES PRODUCTO(PRD_CODIGO);
ALTER TABLE PROD_CARRITO ADD CONSTRAINT FK_PROD_CARRITO_CARRITO_CRR_CED_RUC_CLI FOREIGN KEY (CRR_CED_RUC_CLI) REFERENCES CARRITO(CRR_CED_RUC_CLI);
ALTER TABLE PROD_CARRITO ADD CONSTRAINT FK_PROD_CARRITO_PRODUCTO_PRD_CODIGO FOREIGN KEY (PRD_CODIGO) REFERENCES PRODUCTO(PRD_CODIGO);
ALTER TABLE PROD_ORDENCOMPRA ADD CONSTRAINT FK_PROD_ORDENCOMPRA_ORDEN_COMPRA_ORC_NUMERO FOREIGN KEY (ORC_NUMERO) REFERENCES ORDEN_COMPRA(ORC_NUMERO);
ALTER TABLE PROD_ORDENCOMPRA ADD CONSTRAINT FK_PROD_ORDENCOMPRA_PRODUCTO_PRD_CODIGO FOREIGN KEY (PRD_CODIGO) REFERENCES PRODUCTO(PRD_CODIGO);
ALTER TABLE PROMO_PROD ADD CONSTRAINT FK_PROMO_PROD_PROMOCION_PRM_NUMERO FOREIGN KEY (PRM_NUMERO) REFERENCES PROMOCION(PRM_NUMERO);
ALTER TABLE PROMO_PROD ADD CONSTRAINT FK_PROMO_PROD_PRODUCTO_PRD_CODIGO FOREIGN KEY (PRD_CODIGO) REFERENCES PRODUCTO(PRD_CODIGO);
ALTER TABLE PROVE_PROD ADD CONSTRAINT FK_PROVE_PROD_PROVEEDOR_PRV_CI_RUC FOREIGN KEY (PRV_CI_RUC) REFERENCES PROVEEDOR(PRV_CI_RUC);
ALTER TABLE PROVE_PROD ADD CONSTRAINT FK_PROVE_PROD_PRODUCTO_PRD_CODIGO FOREIGN KEY (PRD_CODIGO) REFERENCES PRODUCTO(PRD_CODIGO);
ALTER TABLE SUCURSAL ADD CONSTRAINT FK_SUCURSAL_EMPRESA_EMP_RUC FOREIGN KEY (EMP_RUC) REFERENCES EMPRESA(EMP_RUC);
ALTER TABLE SUCURSAL ADD CONSTRAINT FK_SUCURSAL_CIUDAD_CIU_CODIGO FOREIGN KEY (CIU_CODIGO) REFERENCES CIUDAD(CIU_CODIGO);
ALTER TABLE USUARIO_A ADD CONSTRAINT FK_USUARIO_A_CLIENTE_CLI_CI_RUC FOREIGN KEY (CLI_CI_RUC) REFERENCES CLIENTE(CLI_CI_RUC);
