require('dotenv').config()
const mongoose = require('mongoose')
const { Server } = require('socket.io')
const Document = require('./Document')
const http = require('http')

const server = http.createServer((req, res) => {
    res.write('Hello World!'); //write a response
    res.end(); //end the response
  }).listen(process.env.PORT, () => {
   console.log(`server start at port ${process.env.PORT}`);
  });

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oeg4g.mongodb.net/noob-docs-db?retryWrites=true&w=majority`)

const io = require('socket.io')(server, {
    cors: {
        // origin: 'http://localhost:3000',
        origin: 'https://noob-docs.vercel.app',
        methods: ['GET', 'POST'],
    },
})

const defaultValue = ""

io.on("connection", socket => {
    socket.on("get-document", async documentId => {
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit("load-document", document.data)

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta)
        })

        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { data })
        })
    })
})

async function findOrCreateDocument(id) {
    if (id == null) return

    const document  = await Document.findById(id)
    if (document) return document

    return await Document.create({_id: id, data: defaultValue})
}