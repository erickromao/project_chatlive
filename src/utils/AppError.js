require('express-async-errors')

class AppError{
    message
    statusCode

    constructor(message, statusCode = 400){
        this.message = message
        this.statusCode = statusCode
    }
}

function ErrorsClientAndServer(err, request, response, next){
    if(err instanceof AppError){
        return response.json({
            message: err.message
        })
    }
    console.error(err)
    return response.status(500).send('Error Internal Server')
}


module.exports = { AppError, ErrorsClientAndServer }