// type DbErr = {
//     code: string
//     errno: number
//     sqlMessage: string
//     sqlState: string
//     index: number
//     sql: string
//     length?: number
// }
//
// type DbRes = any[]
//
// type DB = DbErr | DbRes

export function checkDbRes(dbRes: any): string {
    const flag: string = dbRes.toString()
    if (flag.startsWith('Error')) {
        return 'err'
    } else {
        if (dbRes.length === 0) {
            return 'none'
        } else {
            return 'ok'
        }
    }
}


