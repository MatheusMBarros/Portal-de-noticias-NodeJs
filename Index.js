const express = require('express')
const path = require('path')
//para recuperar a informacao do body
var bodyParser = require('body-parser');
//instancia o servidor
const app = express();
//contectando o mongo

const mongoose = require('mongoose');

var session = require('express-session')

// importando o Schema de posts
const Posts = require('./Posts.js');
const {
    render
} = require('ejs');


//inicializa a sessao
app.use(session({
    secret: 'keyboard cat',
    cookie: {
        maxAge: 60000
    }
}))

mongoose.connect('mongodb+srv://MBarros02:Ma91810815!@cluster0.lbeeypd.mongodb.net/portalNoticial?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(function () {
    console.log('Conectado com sucesso!')
}).catch(function (err) {
    console.log(err.message)
})


//setando a engine de renderizacao com o ejs
app.engine('html', require('ejs').renderFile);
//setando a viewEnsgine como ejs
app.set('view engine', 'html');
//setando que o diretorio estatico onde ficam os arquivos estaticos(arquivos , fotos, css )esta na pasta public
app.use('/public', express.static(path.join(__dirname, 'public')))
//setando a pasta onde estao as views
app.set('views', path.join(__dirname, '/pages'))
//para poder quebrar o body em um json
app.use(bodyParser.json())
// integrando o formulario no node
app.use(bodyParser.urlencoded({
    extended: true
}))

//pagina inicial
app.get('/', (request, response) => {
    //recupera do Bd
    if (request.query.busca == null) {

        Posts.find({}).sort({
            '_id': -1
        }).exec(function (err, posts) {
            posts = posts.map((val) => {

                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0, 10),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })


            Posts.find({}).sort({
                'views': -1
            }).limit(3).exec(function (err, postsTop) {



                postsTop = postsTop.map(function (val) {

                    return {

                        titulo: val.titulo,

                        conteudo: val.conteudo,

                        descricaoCurta: val.conteudo,

                        imagem: val.imagem,

                        slug: val.slug,

                        categoria: val.categoria,

                        views: val.views

                    }

                })
                response.render('home', {
                    posts: posts,
                    postsTop: postsTop
                });
            })
        })

    } else {

        Posts.find({
                titulo: {
                    $regex: request.query.busca,
                    $options: "i"
                },
            },

            (err, posts) => {
                posts = posts.map(function (val) {

                    return {

                        titulo: val.titulo,

                        conteudo: val.conteudo,

                        descricaoCurta: val.conteudo.substr(0, 100),

                        imagem: val.imagem,

                        slug: val.slug,

                        categoria: val.categoria,

                        views: val.views

                    }

                })

                response.render('busca', {
                    posts: posts,
                    contagem: posts.length
                })


            })


    }
})



//recuperandoa url de noticia
app.get('/:slug', (request, response) => {
    // response.send(require.params.slug)
    Posts.findOneAndUpdate({
        //a slug que estou requisitando
        slug: request.params.slug
    }, {
        //incrementando a view
        $inc: {
            views: 1
        }
    }, {
        new: true
        //criando um objeto com todas as informacoes do post
    }, (err, resposta) => {

        if (resposta != null) {

            Posts.find({}).sort({
                'views': -1
            }).limit(3).exec(function (err, postsTop) {

                postsTop = postsTop.map(function (val) {

                    return {

                        titulo: val.titulo,

                        conteudo: val.conteudo,

                        descricaoCurta: val.conteudo.substr(0, 100),

                        imagem: val.imagem,

                        slug: val.slug,

                        categoria: val.categoria,

                        views: val.views

                    }

                })
                response.render('partials/single', {
                    //passando o objeto para a noticia para renderizar na single
                    noticia: resposta,
                    postsTop: postsTop
                })
            })
        } else {
            response.render('404', {})
        }

        // console.log(resposta)


    })
})

var usuarios = [{
    login: 'Matheus',
    senha: '123456'
}]

app.post('/admin/login', (request, response) => {
    usuarios.map((val) => {
        if (val.login == request.body.login && val.senha == request.body.senha) {
            request.session.login = "Matheus"
            response.redirect('/admin/login')
        } else {
            response.render('admin-login')
        }

    })

})

app.get('/admin/login', (request, response) => {
    if (request.session.login == null) {
        response.render('admin-login')
    } else {
        response.render('admin-panel')

    }
})

app.post('/admin/cadastro', (request, response) => {
    // falta inserir no BD
    console.log(request.body)
    Posts.create({
        titulo: request.body.titulo_noticia,
        imagem: request.body.url_imagem,
        categoria: 'Nenhuma',
        descricaoCurta: request.body.noticia.substring(0, 100),
        conteudo: request.body.noticia,
        slug: request.body.slug,
        autor: 'Matheus',
        views: 0

    })
    response.send('Cadastrado com sucesso!')
})

app.get('/admin/deletar/:id', (request, response) => {
    response.send('deletado a noticia com o id ' + request.params.id)

})

app.listen(5000, () => {
    console.log('Server inicializado')
})