export interface ListaProveedores {
    proveedorid: number,
    nombre: string,
    telefono: string,
    alias:string,
    nombrefiltro: string,
}

export interface DatosProveedores{
    proveedorid: number,
    nombre: string,
    telefono: string,
    rfc: string,
    calle: string,
    nointerior: string,
    noexterior: string,
    colonia: string,
    ciudad: string,
    municipio: string,
    estado: string,
    pais: string,
    email: string,
    cp: string
}