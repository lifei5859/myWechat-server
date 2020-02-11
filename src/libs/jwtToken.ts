const jwt = require('jsonwebtoken');

interface Res {
    status: 1 | 0,
    result: any
}

interface Dec {
    exp: number
    data: string
    iat: number
}

export function genToken(token: string, secret: string): Promise<Res> {
    return new Promise((res: Function, rej: Function) => {
        jwt.verify(token, secret, function (err: any, decoded: Dec) {
            if (err) {
                rej(err)
            } else {
                res(decoded)
            }
        });
    }).then((result) => {
        return {status: 1, result}
    }, (error) => {
        return {status: 0, result: error}
    })
}



