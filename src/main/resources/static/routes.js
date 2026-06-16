const express = require("express")
const path = require("path")
const Router = express.Router()
const mongoose = require("mongoose")
const Tcc = require('./db/tccSchema')


Router.get("/", (req, res) => res.sendFile(path.join(__dirname + '/pages/index.html')))
Router.get("/stats", (req, res) => res.sendFile(path.join(__dirname + '/pages/stats.html')))


// MAKE A TO REDEX FUNCTION
Router.post("/search", async (req, res) => {
    const result = await Tcc.find({
        Titulo: RegExp(req.body.Titulo, "i"),
        Discente: RegExp(req.body.Discente, "i"),
        Orientador: RegExp(req.body.Orientador, "i"),
        Municipio: RegExp(req.body.Municipio, "i")
    })
    return res.send(await result).status(200)
})

Router.get("/all", async (req, res) => {
    const result = await Tcc.find({
    })
    return res.send(await result).status(200)
})

Router.post("/findbycity", async (req, res) => {
    if (!req.body.city) {
        const result = await Tcc.find({})
        return res.send(await result)
    }
    const result = await Tcc.find({ Municipio: req.body.city })
    return res.send(await result)
})

Router.post("/post", async (req, res) => {
    if (!req.body.legth) {
        const Discente = req.body.Discente
        const DatadeDefesa = req.body.DatadeDefesa
        if (DatadeDefesa) {

            console.log(Discente)
        }
        const Titulo = req.body.Titulo
        const Orientador = req.body.Orientador
        const Examinador1 = req.body.Examinador1
        const Examinador2 = req.body.Examinador2
        const Municipio = req.body.Municipio
        const tcc = new Tcc({
            Discente,
            DatadeDefesa,
            Titulo,
            Orientador,
            Examinador1,
            Examinador2,
            Municipio
        })
        const result = await tcc.save()
        return res.send(await result)
        //return res.status(400).send("Information incomplete")
    }
    for (i = 0; i < req.body.legth; i++) {
        const Discente = req.body.Discente
        const DatadeDefesa = req.body.DatadeDefesa
        const Titulo = req.body.Titulo
        const Orientador = req.body.Orientador
        const Examinador1 = req.body.Examinador1
        const Examinador2 = req.body.Examinador2
        const Municipio = req.body.Municipio
        console.log("a")
        const tcc = new Tcc({
            Discente,
            DatadeDefesa,
            Titulo,
            Orientador,
            Examinador1,
            Examinador2,
            Municipio
        })
        const result = await tcc.save()
        res.send(await result)

    }
    return


})

Router.get("/Download", async (req, res)=>{
    res.download(`C:/Users/wilson/Documents/projetoPesquisa/TCCs/${req.query.TCC}.pdf`)
})

module.exports = Router