import baseUrl from "./baseUrl"

export const roomImg = (fileName) => {
    const pathString = `${baseUrl}/uploads/room/${fileName}`
    return pathString
}

export const colorImg = (productId, fileName) => {
    const pathString = `${baseUrl}/uploads/product/${productId}/${fileName}`
    return pathString
}
export const colorImgs = (productId, colorId, fileName) => {
    const pathString = `${baseUrl}/uploads/product/${productId}/${colorId}/${fileName}`
    return pathString
}
export const promoImg = (fileName) => {
    const pathString = `${baseUrl}/uploads/promotion/${fileName}`
    return pathString
}
