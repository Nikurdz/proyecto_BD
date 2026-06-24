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


drop table CLIENTE cascade constraints
/

drop index PEDIDOCLIENTE_PAGO_FK
/

drop index CLIENTE_PEDIDOCLIENTE_FK
/

drop table PEDIDOCLIENTE cascade constraints
/

drop table PRODUCTO cascade constraints
/

drop index PRODUCTO_PRDPEDCLI_FK
/

drop index PEDCLI_PRODPEDCLI_FK
/

drop table PRODUCTO_PEDCLI cascade constraints
/

/*==============================================================*/
/* Table: CLIENTE                                               */
/*==============================================================*/
create table CLIENTE (
   CLI_CED_RUC          VARCHAR2(13)          not null,
   CLI_NOMBRE           VARCHAR2(60),
   CLI_DIRECCION        VARCHAR2(60),
   CLI_TELEFONO         VARCHAR2(10),
   CLI_CORREO           VARCHAR2(60),
   constraint PK_CLIENTE primary key (CLI_CED_RUC)
)
   tablespace DATA
/


/*==============================================================*/
/* Table: PEDIDOCLIENTE                                         */
/*==============================================================*/
create table PEDIDOCLIENTE (
   PED_NUMERO           NUMBER(12)            not null,
   CLI_CED_RUC          VARCHAR2(13)          not null,
   PED_FECHA            DATE,
   PED_ESTADO           VARCHAR2(20),
   constraint PK_PEDIDOCLIENTE primary key (PED_NUMERO)
)
   tablespace DATA
/

/*==============================================================*/
/* Index: CLIENTE_PEDIDOCLIENTE_FK                              */
/*==============================================================*/
create index CLIENTE_PEDIDOCLIENTE_FK on PEDIDOCLIENTE (
   CLI_CED_RUC ASC
)
tablespace INDEXP
/

/*==============================================================*/
/* Table: PRODUCTO_PEDCLI                                       */
/*==============================================================*/
create table PRODUCTO_PEDCLI (
   PRD_CODIGO           VARCHAR2(10)          not null,
   PED_NUMERO           NUMBER(12)            not null,
   PPC_CANTIDAD         NUMBER(12,2)
)
   tablespace DATA
/

/*==============================================================*/
/* Index: PEDCLI_PRODPEDCLI_FK                                  */
/*==============================================================*/
create index PEDCLI_PRODPEDCLI_FK on PRODUCTO_PEDCLI (
   PED_NUMERO ASC
)
tablespace INDEXP
/

/*==============================================================*/
/* Index: PRODUCTO_PRDPEDCLI_FK                                 */
/*==============================================================*/
create index PRODUCTO_PRDPEDCLI_FK on PRODUCTO_PEDCLI (
   PRD_CODIGO ASC
)
tablespace INDEXP
/

