const express = require('express')
const path = require('path')
//para recuperar a informacao do body
var bodyParser = require('body-parser');
const {
    request
} = require('http');
const app = express();

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
app.get('/', (require, response) => {
    console.log(require.query)

    if (require.query.busca == null) {
        response.render('home', {})
    } else
        response.send('Voce buscou por: ' + require.query.busca)
})



//recuperandoa url de noticia
app.get('/:slug', (require, response) => {
    response.send(require.params.slug)
})

app.listen(5000, () => {
    console.log('Server inicializado')
})