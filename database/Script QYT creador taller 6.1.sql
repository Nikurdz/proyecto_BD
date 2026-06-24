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


drop trigger TDB_CLIENTE
/

drop trigger TUB_CLIENTE
/

drop trigger TIB_PAGOS
/

drop trigger TUB_PAGOS
/

drop trigger TDB_PEDIDOCLIENTE
/

drop trigger TIB_PEDIDOCLIENTE
/

drop trigger TUB_PEDIDOCLIENTE
/

drop trigger TDB_PRODUCTO
/

drop trigger TUB_PRODUCTO
/

drop trigger TIB_PRODUCTO_PEDCLI
/

drop trigger TUB_PRODUCTO_PEDCLI
/

drop table CLIENTE cascade constraints
/

drop index PEDIDOCLIENTE_PAGO_FK
/

drop table PAGOS cascade constraints
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
/* Table: PAGOS                                                 */
/*==============================================================*/
create table PAGOS (
   PAG_CODIGO           VARCHAR2(15)          not null,
   PED_NUMERO           NUMBER(12)            not null,
   PAG_MONTO            NUMBER(12,2),
   PAG_FECHA            DATE,
   constraint PK_PAGOS primary key (PAG_CODIGO)
)
   tablespace DATA
/

/*==============================================================*/
/* Index: PEDIDOCLIENTE_PAGO_FK                                 */
/*==============================================================*/
create index PEDIDOCLIENTE_PAGO_FK on PAGOS (
   PED_NUMERO ASC
)
tablespace INDEXP
/

/*==============================================================*/
/* Table: PRODUCTO                                              */
/*==============================================================*/
create table PRODUCTO (
   PRD_CODIGO           VARCHAR2(10)          not null,
   PRD_NOMBRE           CHAR(30),
   PRD_CATEGORIA	NUMBER(10)	      not null,
   PRD_PRECIO           NUMBER(12,2),
   PRD_EXISTENCIA       NUMBER(10),
   constraint CKC_PRD_EXISTENCIA_PRODUCTO check (PRD_EXISTENCIA is null or (PRD_EXISTENCIA >= '0')),
   constraint PK_PRODUCTO primary key (PRD_CODIGO)
)
   tablespace DATA
/
