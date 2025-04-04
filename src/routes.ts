/**
 * an array of routes that is accessible to the public
 * these dont require authenitcaton nor authorization
 * @type {string[]}
 */
export const publicRoutes =[
    '/',
    
]
/**
 * an array of routes that used for authentication
 * these will redirect loggin users to their dashboard
 * @type {string[]}
 */
export const authRoutes =[
    '/login',
    '/register'


]

export const apiAuthPrefix = '/api/auth'

export const DEFAULT_LOGIN_REDIRECT = '/dashboard'
