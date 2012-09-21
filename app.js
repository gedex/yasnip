/**
 * App dependencies.
 */
var express = require("express")
    , app = express()
    , redis = require("redis")
    , rc = redis.createClient()
    , langs = require('./langs')
    , exec = require('child_process').exec;


/**
 * App config.
 */
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    
    // Middleware
    app.use(express.bodyParser());
    app.use(app.router);
});


/**
 * App routing.
 */
app.get('/add', function(req, res) {
    res.render('add', {
        langs: langs.langs
    });
});
app.post('/add', function(req, res) {
    rc.incr("nextId", function(err, id) {
        if (!err) {
            // Spawn pygmentize and save the result via set
            exec("echo '" + req.param('snip', '') + "' | pygmentize -l " + req.param('lang', 'html') +
                 " -f html -O full,style=pastie -P title='Snippet #" + id + "'",
                function(err, stdout, stderr) {
                    if (!err) {
                        rc.set('snips:id:' + id, JSON.stringify(stdout), function(err, reply) {
                            if (!err) {
                                // redirect to newly added snip
                                res.redirect('/view/' + id);
                            } else {
                                // TODO: give 500 page, something wrong during set snip
                                console.log(err);
                            }
                        });
                    } else {
                        // TODO: give 500 page, something wrong during pygmentize call
                        console.log(err);    
                    }
                }
            );
        } else {
            // TODO: give 500 page, unable to inc nextId
            console.log(err);
        }
    });
});

app.get('/view/:id', function(req, res) {
    rc.get("snips:id:" + req.params.id, function(err, snip) {
        if (!err) {
            res.send(JSON.parse(snip));
        } else {
            // TODO: give 500 page, unable to find snip with given id
            console.log(err);
        }
    });
});
app.get('/', function(req, res) {
    res.render('index', {
        title: 'Index',
        langs: langs.langs
    });
});

app.listen(3000, function() {
    console.log("Listening on port 3000");
});
