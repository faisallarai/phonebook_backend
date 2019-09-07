const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const uuid = require('node-uuid')
const cors = require('cors')

let persons = [
    {
        id: 1,
        name: "Kofi Amanu",
        number: "0244656852",
        active: true
    },
    {
        id: 2,
        name: "Kweku Amanu",
        number: "0244656852",
        active: false
    },
    {
        id: 3,
        name: "Ama Amanu",
        number: "0244656852",
        active: true
    }
]
const app = express()
app.use(express.static('build'))
app.use(cors())
// middle that transforms body into an object
app.use(bodyParser.json())

// middleware that injects id in the request
const injectId = (request, response, next) => {
    request.id = uuid.v4()
    next() 
}
app.use(injectId)

morgan.token('id', request => request.id)
morgan.token('body', request => JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('',(request, response) => {
    response.end('<h1>Hello World</h1>')
})

app.get('/api/persons',(request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    newPerson = persons.find(person => person.id === id)
    if(newPerson) {
        response.json(newPerson)
    } else {
        response.status(404).end()
    }
})

app.put('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const body = req.body

    person = persons.find(person => person.id === id)
    changedPerson = {...person, active: body.active}
    persons = persons.map(person => person.id === id ? changedPerson : person)

    res.json(changedPerson)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.param.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).json(persons)
})

const generateId = () => {
    const maxId = persons.length > 0 ? Math.max(...persons.map(person => person.id)) : 0
    return maxId + 1
}

const random = () => {
    return Math.floor(Math.random() * (5000 - persons.length) + persons.length)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name) {
        const newMessage = {
            error: 'name missing'
        }
        return response.json(newMessage)
    } else if(!body.number) {
        const newMessage = {
            error: 'number is missing'
        }
        return response.json(newMessage)
    }

    const person = persons.find(person => {
        console.log(person.name, body.name)
        return person.name === body.name
    })

    if(person) {
        const newMessage = {
            error: 'name must be unique'
        }
        return response.json(newMessage)
    }

    const newPerson = {
        id: random(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(newPerson)
    response.json(newPerson)
})

app.get('/info', (request, response) => {
    const total = persons.length
    response.end(`<p>Phonebook has info for ${total} people</p><p>${Date()}</p>`)
})

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log(`Server running on ${port}`)
})
