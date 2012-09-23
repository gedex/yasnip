/**
 * App dependencies.
 */
var express = require("express")
    , app = express()
    , redis = require("redis")
    , rc = redis.createClient()
    , langs = require('./langs')
    , cp = require('child_process')
    , config = require("./config")
    , conf = new config();


rc.on('error', function(err) {
    // TODO: Evaluate env first whether error should be logged or not.
    console.log(err);
});


/**
 * App config.
 */
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    // Our custom "verbose errors" setting
    // which we can use in the templates
    // via settings['verbose errors'].
    // TODO: Evaluate env first whether 'verbose error' should be enabled or not.
    app.enable('verbose errors');

    // Built-in middleware
    app.use(express.static(__dirname + '/assets'));
    app.use(express.bodyParser());
    app.use(app.router);

    // TODO: use this middleware when config env is `production`
    app.use(function(req, res, next) {
        res.status('404');

        if (req.accepts('html')) {
            res.render('404', {
                url: req.url
            });
            return;
        }
        
        if (req.accpets('json')) {
            res.send({
                error: 'Not found'
            });
        }
        
        res.type('txt').send('Not found');
    });

    // Error handler
    app.use(error);
    function error(err, req, res, next) {
        res.status(err.status || 500);
        res.render('500', {
            error: err
        });
    }
});


/**
 * App routing.
 */
app.get('/add', function(req, res) {
    res.render('add', {
        langs: langs.langs
    });
});
app.post('/add', function(req, res, next) {
    rc.incr("nextId", function(err, id) {
        if (!err) {
            // Save raw snippet
            rc.set('raw_snips:id:' + id, JSON.stringify(req.param('snip', '')), function(err, reply) {
                if (err) {
                    next(new Error(err));
                }
            });
            
            // Save lang
            rc.set('lang:id:' + id, req.param('lang', 'html'), function(err, reply) {
                // Since lang is not important, we just need to log the error
                if (err) {
                    // TODO: Logging should be enabled when env is `production`
                    //console.log(err);
                }
            });

            var out = "";
            // Spawn pygmentize and save the result via set
            var pyg = cp.spawn("pygmentize", ["-l", req.param('lang', 'html')
                ,"-f", "html"
                ,"-O", "'style=pastie'"
            ]);
            pyg.stdout.on("data", function(data) {
                // TODO: Logging should be enabled when env is `production`
                //console.log("pygmentize: on data");
                out += data;
            });
            pyg.on("exit", function(code) {
                console.log("pygmentize: exiting")
                if (code !== 0) {
                    var err = "pygmentize process exited with code " + code;
                    next(new Error(err));
                } else {
                    // Save highlighted snippet
                    rc.set('snips:id:' + id, JSON.stringify(out), function(err, reply) {
                        if (!err) {
                            // redirect to newly added snip
                            res.redirect('/view/' + id);
                        } else {
                            next(new Error(err));
                        }
                    });
                }
                pyg.stdin.end();
            });

            pyg.stderr.on("data", function(data) {
                pyg.stdin.end();
                next(new Error("pygmentize err: " + data))
            });

            pyg.stdin.write(req.param('snip', ''));
            pyg.stdin.end();
        } else {
            next(new Error(err));
        }
    });
});

app.get('/view/:id/:format?', function(req, res, next) {
    var id = req.params.id
        , format = req.params.format;

    switch(format) {
        case "raw":
            rc.get("raw_snips:id:" + id, function(err, snip) {
                if (!err && snip) {
                    res.header("Content-Type", "text/plain; charset=utf-8");
                    res.send(JSON.parse(snip));
                } else {
                    if (err) {
                        // TODO: Logging should be enabled when env is `production`
                        //console.log(err);
                    }
                    // Gives 404 page, unable to find raw_snip
                    res.header("Content-Type", "text/plain; charset=utf-8");
                    next();
                }
            });
            break;
        default:
            rc.get("snips:id:" + id, function(err, snip) {
                if (!err && snip) {
                    rc.get("lang:id:" + id, function(err, repl) {
                        var lang = "Unknown";
                        if (!err && repl) {
                            lang = langs.lang_by_shortcode(repl)[1];
                        }
                        res.render('view', {
                            id: id
                            , snip: JSON.parse(snip)
                            , lang: lang
                        });
                    });
                } else {
                    if (err) {
                        console.log(err);
                    }
                    // Gives 404 page, unable to find snip with given id
                    next();
                }
            });
    }
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
