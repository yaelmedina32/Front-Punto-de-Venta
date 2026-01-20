export interface ListaProductos {
    productoid: number
    , clave: string
    , nombre: string
    , iva: number
    , categoriaid: number
    , marca: string
    , modelo: string
    , tipo: string
    , ancho: number
    , alto: number
    , roc: string
    , tamanorin: number
    , indicecarga: number
    , letravelocidad: string
    , aplicacion: string
    , tipovehiculo: string
    , marcaid: number
    , nombrefiltrado: string
    , precioCompra: number

}

export interface ListaProductosResumido {
    productoid: number
    , clave: string
    , nombre: string
    , nombrefiltro: string
}

export interface Catergorias{
    categoriaId: number,
    nombre: string
}

export interface Marcas{
    marcaId: number,
    nombre: string
}